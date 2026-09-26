package com.sssit.bikerental.modules.verification.bikedocument.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.verification.bikedocument.model.RCData;
import com.sssit.bikerental.modules.verification.common.util.DocumentIdentifierUtil;
import com.sssit.bikerental.modules.verification.common.util.IndianStateCodeUtil;

/**
 * Extracts structured Registration Certificate (RC) fields (Owner
 * Name, Registration Number, Chassis Number, Engine Number, Maker's
 * Name, Model, Vehicle Class, Registration Date, Insurance/PUCC/
 * Fitness validity, Address) out of the raw OCR text that
 * OCRService.extractData(file).getRawText() returns.
 */
@Component
public class RCExtractor {

    // Indian vehicle registration numbers: e.g. TS09AB1234, TS09A1234, TS09AB123, DL1A1234, AP39KA1234, TG09EF4321, 22BH1234AA
    // Requires at least 1 series letter so arbitrary numbers (like PIN codes or AR505001) are never matched
    private static final Pattern REG_NUMBER_PATTERN =
            Pattern.compile("(?i)\\b([A-Z]{2})[-\\s/.]*([0-9]{1,2})[-\\s/.]*([A-Z]{1,3})[-\\s/.]*([0-9]{1,4})\\b");

    // Primary project format: AA 00 AA 0000 (State + 2 digits RTO + 2 letters + 4 digits vehicle number)
    private static final Pattern EXACT_PROJECT_PATTERN =
            Pattern.compile("(?i)\\b([A-Z]{2})[-\\s/.]*([0-9]{2})[-\\s/.]*([A-Z]{2})[-\\s/.]*([0-9]{4})\\b");

    private static final Pattern BH_SERIES_PATTERN =
            Pattern.compile("(?i)\\b([0-9]{2})[-\\s/.]*(BH)[-\\s/.]*([0-9]{4})[-\\s/.]*([A-Z]{1,2})\\b");

    private static final String[] REG_LABELS = {
            "regn. number", "regn number", "registration no.", "registration no",
            "registration number", "reg. no.", "reg. no", "regn. no.", "regn. no",
            "regn no", "reg no", "regd. no.", "regd. no", "regd no", "vehicle no.",
            "vehicle no", "vehicle reg no", "vehicle regn no", "vehicle registration number",
            "vehicle registration no", "vehicle number", "regn", "registration"
    };

    private static final Pattern DATE_PATTERN =
            Pattern.compile("\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}");

    private static final Pattern MFG_DATE_PATTERN =
            Pattern.compile("\\b(\\d{1,2})[/-](\\d{4})\\b");

    // Chassis/engine numbers are alphanumeric, typically 5-20 chars
    private static final Pattern ALNUM_CODE_PATTERN =
            Pattern.compile("\\b[A-Z0-9]{5,20}\\b");

    private static final Pattern OWNER_LABEL_PATTERN =
            Pattern.compile("(?i)(reg[a-z0-9]*\\.?[\\s:-]*(owner|0wner|qwner|owne|owner['s]?)|registered[\\s:-]*(owner|0wner|qwner)|owner['s\\s]*name|owner|0wner|qwner|regd[\\s:-]*owner)[\\s:-]*");

    private static final String[] NAME_JUNK_MARKERS = {
            "son/daughter", "s/o", "d/o", "w/o", "address", "signature", "h.no", "hno"
    };

    public RCData extract(String rawText) {
        return extract(rawText, null);
    }

    public RCData extract(String rawText, String expectedRegistrationNumber) {

        RCData data = new RCData();

        if (rawText == null || rawText.isBlank()) {
            return data;
        }

        String[] lines = rawText.split("\\r?\\n");

        extractRegistrationNumber(rawText, lines, expectedRegistrationNumber, data);
        extractOwnerName(lines, data);
        extractChassisNumber(lines, data);
        extractEngineNumber(lines, data);
        extractMakerName(lines, data);
        extractModel(lines, data);
        extractVehicleClass(lines, data);
        extractRegistrationDate(lines, data);
        extractInsuranceValidUpto(lines, data);
        extractPuccValidUpto(lines, data);
        extractFitnessValidUpto(lines, data);
        extractAddress(lines, data);

        return data;
    }

    //-------------------------------------------------------
    // Registration Number Candidate Selection
    //-------------------------------------------------------

    private static class RegCandidate {
        String value;
        int score;

        RegCandidate(String value, int score) {
            this.value = value;
            this.score = score;
        }
    }

    private void extractRegistrationNumber(String rawText, String[] lines, String expectedRegNumber, RCData data) {
        String targetNormalized = DocumentIdentifierUtil.normalizeRegistrationNumber(expectedRegNumber);
        java.util.Map<String, Integer> candidates = new java.util.LinkedHashMap<>();

        // Helper to record candidate with score
        java.util.function.BiConsumer<String, Integer> addCandidate = (cand, score) -> {
            if (cand == null) return;
            String norm = DocumentIdentifierUtil.normalizeRegistrationNumber(cand);
            // Must not contain 5 or more consecutive digits (PIN code or arbitrary numeric block like 505001)
            if (norm.matches(".*[0-9]{5,}.*")) {
                return;
            }
            if (isValidIndianRegNumber(norm)) {
                int s = score;
                if (targetNormalized != null && !targetNormalized.isEmpty() && norm.equals(targetNormalized)) {
                    s += 1500;
                }
                if (DocumentIdentifierUtil.isExactProjectRcFormat(norm)) {
                    s += 200;
                }
                int existingScore = candidates.getOrDefault(norm, 0);
                if (s > existingScore) {
                    candidates.put(norm, s);
                }
            }

            // Also test if OCR digit repair turns candidate into exact project format
            String repaired = fixRegistrationNumberOcrNoise(cand);
            if (repaired != null && !repaired.equals(norm) && !repaired.matches(".*[0-9]{5,}.*") && DocumentIdentifierUtil.isExactProjectRcFormat(repaired)) {
                int s = score + 150;
                if (targetNormalized != null && !targetNormalized.isEmpty() && repaired.equals(targetNormalized)) {
                    s += 1500;
                }
                int existingScore = candidates.getOrDefault(repaired, 0);
                if (s > existingScore) {
                    candidates.put(repaired, s);
                }
            }
        };

        // Pass 0: RC Upper Zone / Red Header Banner & "Regn. Number" Region Search
        // Target region is the upper portion around:
        // CERTIFICATE OF REGISTRATION -> Registration Number area -> Regd. Owner
        for (int i = 0; i < lines.length; i++) {
            String lower = lines[i].toLowerCase();

            // Check if this line is in the header area or has "regn" context or is an upper/color pass marker
            boolean isHeader = lower.contains("certificate of registration")
                    || lower.contains("registration certificate")
                    || lower.contains("transport department")
                    || lower.contains("telangana state")
                    || lower.contains("upper region")
                    || lower.contains("red contrast")
                    || lower.contains("red binary");

            boolean isRegnContext = lower.contains("regn") || lower.contains("registration");

            if (isHeader || isRegnContext) {
                // 1. Inspect the line itself (e.g. if registration number is mixed with red header text)
                Matcher mExactSameLine = EXACT_PROJECT_PATTERN.matcher(lines[i].toUpperCase());
                while (mExactSameLine.find()) {
                    addCandidate.accept(mExactSameLine.group(), 200);
                }

                // 2. Inspect nearby lines in this upper zone (preceding line, next 1 to 4 lines)
                int startRange = Math.max(0, i - 1);
                int endRange = Math.min(lines.length - 1, i + 4);
                for (int r = startRange; r <= endRange; r++) {
                    String targetLine = lines[r].trim();
                    if (targetLine.isBlank()) continue;

                    // Skip lines clearly into owner name
                    if (targetLine.toLowerCase().contains("regd. owner") || targetLine.toLowerCase().contains("registered owner")) {
                        continue;
                    }

                    Matcher mExact = EXACT_PROJECT_PATTERN.matcher(targetLine.toUpperCase());
                    while (mExact.find()) {
                        addCandidate.accept(mExact.group(), 180);
                    }

                    Matcher mGen = REG_NUMBER_PATTERN.matcher(targetLine.toUpperCase());
                    while (mGen.find()) {
                        addCandidate.accept(mGen.group(), 140);
                    }

                    String cand = findRegInText(targetLine);
                    if (cand != null) {
                        addCandidate.accept(cand, 130);
                    }
                }
            }
        }

        // Pass 1: Check lines containing registration labels (and immediate lines after)
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            String lower = line.toLowerCase();
            for (String label : REG_LABELS) {
                if (lower.contains(label)) {
                    // Check remainder of the current line after label
                    String candidate = findRegInLineOrValue(line, label);
                    if (candidate != null) {
                        addCandidate.accept(candidate, 80);
                    }

                    // Check next 1-2 lines
                    for (int next = i + 1; next < lines.length && next <= i + 2; next++) {
                        String nextLine = lines[next].trim();
                        String nextCandidate = findRegInText(nextLine);
                        if (nextCandidate != null) {
                            addCandidate.accept(nextCandidate, 70);
                        }
                    }
                }
            }
        }

        // Pass 2: Line-by-line regex search
        for (String line : lines) {
            // Check exact project format first
            Matcher mExact = EXACT_PROJECT_PATTERN.matcher(line.toUpperCase());
            while (mExact.find()) {
                addCandidate.accept(mExact.group(), 60);
            }
            // General format
            Matcher mGeneral = REG_NUMBER_PATTERN.matcher(line.toUpperCase());
            while (mGeneral.find()) {
                addCandidate.accept(mGeneral.group(), 40);
            }
        }

        // Pass 3: Token merge pass per line (handles spaced-out characters like "T S 0 9 A B 1 2 3 4" or "TS 09 AB 1234")
        for (String line : lines) {
            String cleanCompact = line.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
            if (cleanCompact.length() >= 6 && cleanCompact.length() <= 20) {
                for (int i = 0; i <= cleanCompact.length() - 6; i++) {
                    String sub = cleanCompact.substring(i);
                    String candidate = findRegInText(sub);
                    if (candidate != null) {
                        addCandidate.accept(candidate, 50);
                    }
                }
            }
        }

        // Pass 4: Full text scan
        Matcher mAllExact = EXACT_PROJECT_PATTERN.matcher(rawText.toUpperCase());
        while (mAllExact.find()) {
            addCandidate.accept(mAllExact.group(), 50);
        }

        // Pass 5: Lenient OCR digit repair across whole text
        String repairedRaw = fixRegistrationNumberOcrNoise(rawText.toUpperCase());
        String repairedCandidate = findRegInText(repairedRaw);
        if (repairedCandidate != null) {
            addCandidate.accept(repairedCandidate, 30);
        }

        // Check if rawText directly contains the target normalized number
        if (targetNormalized != null && !targetNormalized.isEmpty()) {
            String compactAll = rawText.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
            if (compactAll.contains(targetNormalized) && isValidIndianRegNumber(targetNormalized)) {
                addCandidate.accept(targetNormalized, 1500);
            }
        }

        // Select candidate with the highest score
        String bestCandidate = null;
        int maxScore = -1;
        for (java.util.Map.Entry<String, Integer> entry : candidates.entrySet()) {
            if (entry.getValue() > maxScore) {
                maxScore = entry.getValue();
                bestCandidate = entry.getKey();
            }
        }

        if (bestCandidate != null) {
            data.setRegistrationNumber(bestCandidate);
        }
    }

    private String findRegInLineOrValue(String line, String label) {
        String lower = line.toLowerCase();
        int idx = lower.indexOf(label);
        if (idx >= 0) {
            String after = line.substring(idx + label.length()).trim();
            while (after.startsWith(":") || after.startsWith("-") || after.startsWith(".") || after.startsWith("/")) {
                after = after.substring(1).trim();
            }
            String cand = findRegInText(after);
            if (cand != null) return cand;
        }
        return findRegInText(line);
    }

    private String findRegInText(String text) {
        if (text == null || text.isBlank()) return null;

        String upper = text.toUpperCase();

        // Check standard State format (e.g. TS09AB1234, TS09A1234, TS09AB123, DL1A1234)
        Matcher m1 = REG_NUMBER_PATTERN.matcher(upper);
        while (m1.find()) {
            String cand = stripSeparators(m1.group());
            String fixed = fixRegistrationNumberOcrNoise(cand);
            if (isValidIndianRegNumber(fixed)) {
                return fixed;
            }
        }

        // Check Bharat series format (e.g. 22BH1234AA)
        Matcher m2 = BH_SERIES_PATTERN.matcher(upper);
        while (m2.find()) {
            String cand = stripSeparators(m2.group());
            if (cand.matches("^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$")) {
                return cand;
            }
        }

        // Lenient token scan
        String[] tokens = upper.split("[\\s,;:]+");
        for (String tok : tokens) {
            String clean = tok.replaceAll("[^A-Za-z0-9]", "");
            if (clean.length() >= 6 && clean.length() <= 12) {
                String fixed = fixRegistrationNumberOcrNoise(clean);
                if (isValidIndianRegNumber(fixed)) {
                    return fixed;
                }
            }
        }

        return null;
    }

    public static boolean isValidIndianRegNumber(String reg) {
        return DocumentIdentifierUtil.isValidRegistrationNumber(reg);
    }

    /**
     * Fixes common OCR misreads on Indian vehicle registration numbers (e.g. TSU2EY4494 -> TS02EY4494, TS09ABl234 -> TS09AB1234)
     */
    public static String fixRegistrationNumberOcrNoise(String raw) {
        if (raw == null) return null;
        String clean = raw.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        if (clean.length() < 6) return clean;

        if (DocumentIdentifierUtil.isExactProjectRcFormat(clean)) {
            return clean;
        }

        String stateCode = clean.substring(0, 2);
        String rest = clean.substring(2);

        StringBuilder sb = new StringBuilder(stateCode);
        int len = rest.length();

        for (int i = 0; i < len; i++) {
            char c = rest.charAt(i);
            boolean isRtoSlot = (i < 2);
            boolean isTrailingDigitSlot = (i >= Math.max(2, len - 4));

            if (isRtoSlot || isTrailingDigitSlot) {
                if (c == 'O' || c == 'o' || c == 'U' || c == 'Q' || c == 'D') {
                    sb.append('0');
                } else if (c == 'I' || c == 'L' || c == 'l' || c == '|') {
                    sb.append('1');
                } else if (c == 'Z') {
                    sb.append('2');
                } else if (c == 'S') {
                    sb.append('5');
                } else if (c == 'B' && isRtoSlot) {
                    sb.append('8');
                } else {
                    sb.append(c);
                }
            } else {
                sb.append(c);
            }
        }

        String repaired = sb.toString();
        if (DocumentIdentifierUtil.isExactProjectRcFormat(repaired)) {
            return repaired;
        }
        if (isValidIndianRegNumber(repaired)) {
            return repaired;
        }

        return isValidIndianRegNumber(clean) ? clean : repaired;
    }

    private String stripSeparators(String value) {
        if (value == null) return null;
        return value.replaceAll("[\\s-./]", "").toUpperCase();
    }

    //-------------------------------------------------------
    // Owner Name
    //-------------------------------------------------------

    private void extractOwnerName(String[] lines, RCData data) {

        // Pass 1: Label matching via OWNER_LABEL_PATTERN
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();

            Matcher m = OWNER_LABEL_PATTERN.matcher(line);
            if (m.find()) {
                String value = line.substring(m.end()).trim();
                while (value.startsWith(":") || value.startsWith("-") || value.startsWith(".")) {
                    value = value.substring(1).trim();
                }

                if ((value.isBlank() || !isPlausibleName(value)) && i + 1 < lines.length) {
                    i++;
                    value = lines[i].trim();
                }

                value = truncateAtJunk(value);

                if (isPlausibleName(value)) {
                    StringBuilder fullOwnerName = new StringBuilder(value);

                    // Check up to next 2 lines for surname or multi-line name (e.g., Line 1: K LATHA, Line 2: PRAKASH)
                    int nextIdx = i + 1;
                    while (nextIdx < lines.length && nextIdx <= i + 2) {
                        String nextLine = lines[nextIdx].trim();
                        while (nextLine.startsWith(":") || nextLine.startsWith("-")) {
                            nextLine = nextLine.substring(1).trim();
                        }
                        String nextLower = nextLine.toLowerCase();

                        if (isPlausibleName(nextLine) && !isKnownLabelOrAddress(nextLower)) {
                            fullOwnerName.append(" ").append(cleanText(nextLine));
                            nextIdx++;
                        } else {
                            break;
                        }
                    }

                    data.setOwnerName(cleanText(fullOwnerName.toString()));
                    return;
                }
            }
        }

        // Pass 2: Positional extraction (lines located between "Regn. Number" and "Address")
        int regnIdx = -1;
        int addressIdx = -1;
        for (int i = 0; i < lines.length; i++) {
            String lower = lines[i].toLowerCase();
            if (regnIdx == -1 && (lower.contains("regn") || lower.contains("registration") || lower.contains("reg."))) {
                regnIdx = i;
            }
            if (addressIdx == -1 && lower.contains("address")) {
                addressIdx = i;
            }
        }

        if (regnIdx != -1 && addressIdx > regnIdx) {
            StringBuilder nameBetween = new StringBuilder();
            for (int i = regnIdx + 1; i < addressIdx; i++) {
                String candidate = lines[i].trim();
                // Strip labels like Regd. Owner :
                candidate = candidate.replaceAll("(?i)reg[a-z0-9]*\\.?", "")
                        .replaceAll("(?i)owner[s]?", "")
                        .replaceAll("^[\\s:-]+", "").trim();

                candidate = truncateAtJunk(candidate);
                if (isPlausibleName(candidate) && !isKnownLabelOrAddress(candidate.toLowerCase())) {
                    if (nameBetween.length() > 0) nameBetween.append(" ");
                    nameBetween.append(cleanText(candidate));
                }
            }
            if (nameBetween.length() >= 2) {
                data.setOwnerName(nameBetween.toString());
                return;
            }
        }

        // Pass 3: Check 1-3 lines immediately above "Address" label if label parsing was garbled
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().contains("address")) {
                for (int j = i - 1; j >= 0 && j >= i - 3; j--) {
                    String candidate = lines[j].trim();
                    candidate = candidate.replaceAll("(?i)reg[a-z0-9]*\\.?", "")
                            .replaceAll("(?i)owner[s]?", "")
                            .replaceAll("^[\\s:-]+", "").trim();
                    candidate = truncateAtJunk(candidate);
                    if (isPlausibleName(candidate) && !isKnownLabelOrAddress(candidate.toLowerCase())) {
                        data.setOwnerName(cleanText(candidate));
                        return;
                    }
                }
            }
        }
    }

    private boolean isKnownLabelOrAddress(String text) {
        return text.contains("address") || text.contains("h.no") || text.contains("hno")
                || text.contains("vehicle") || text.contains("maker") || text.contains("model")
                || text.contains("mfg") || text.contains("fuel") || text.contains("type")
                || text.contains("regn") || text.contains("registration") || text.contains("chassis")
                || text.contains("engine") || text.contains("signature") || text.contains("valid");
    }

    private String valueAfterLabelFlexible(String line, String label) {
        String lower = line.toLowerCase();
        int idx = lower.indexOf(label);
        if (idx < 0) return null;

        String rest = line.substring(idx + label.length()).trim();
        while (rest.startsWith(":") || rest.startsWith("-") || rest.startsWith(".")) {
            rest = rest.substring(1).trim();
        }
        return rest;
    }

    private String truncateAtJunk(String value) {

        if (value == null) {
            return null;
        }

        String lower = value.toLowerCase();
        int cutAt = value.length();

        for (String marker : NAME_JUNK_MARKERS) {
            int idx = lower.indexOf(marker);
            if (idx >= 0 && idx < cutAt) {
                cutAt = idx;
            }
        }

        return value.substring(0, cutAt).trim();
    }

    private static final String[] JUNK_LABEL_WORDS = {
            "owner", "regd", "registered", "address", "number", "transport",
            "department", "certificate", "registration", "h.no", "hno", "signature",
            "vehicle", "maker", "model", "class", "fuel", "body"
    };

    private boolean isPlausibleName(String value) {
        if (value == null || value.isBlank()) return false;

        String cleaned = value.replaceAll("(?i)\\b(owner|regd|registered|address|number|transport|department|certificate|registration|h\\.no|hno|signature|vehicle|maker|model|class|fuel|body)\\b", "").trim();

        return cleaned.replaceAll("[^A-Za-z]", "").length() >= 2;
    }

    //-------------------------------------------------------
    // Chassis / Engine Number
    //-------------------------------------------------------

    private void extractChassisNumber(String[] lines, RCData data) {

        for (String line : lines) {
            String lower = line.toLowerCase();
            if (lower.contains("chassis")) {
                String value = valueAfterAnyLabel(line, "chassis number", "chassis no", "chassis");
                Matcher m = ALNUM_CODE_PATTERN.matcher(
                        (value != null ? value : line).toUpperCase());
                if (m.find()) {
                    data.setChassisNumber(m.group());
                    return;
                }
            }
        }
    }

    private void extractEngineNumber(String[] lines, RCData data) {

        for (String line : lines) {
            String lower = line.toLowerCase();
            if (lower.contains("engine")) {
                String value = valueAfterAnyLabel(line, "engine number", "engine no", "engine");
                Matcher m = ALNUM_CODE_PATTERN.matcher(
                        (value != null ? value : line).toUpperCase());
                if (m.find()) {
                    data.setEngineNumber(m.group());
                    return;
                }
            }
        }
    }

    //-------------------------------------------------------
    // Maker's Name / Model / Vehicle Class
    //-------------------------------------------------------

    private void extractMakerName(String[] lines, RCData data) {

        for (String line : lines) {
            String lower = line.toLowerCase().trim();
            if (lower.contains("maker")) {
                int colonIndex = line.indexOf(':');
                String value = colonIndex >= 0 ? line.substring(colonIndex + 1).trim() : null;
                if (value != null && !value.isBlank()) {
                    // Clean quote marks or extra noise
                    value = value.replaceAll("[\"']", "").trim();
                    data.setMakerName(cleanText(value));
                    return;
                }
            }
        }
    }

    private void extractModel(String[] lines, RCData data) {

        for (String line : lines) {
            String lower = line.toLowerCase().trim();
            if (lower.contains("model")) {
                String value = valueAfterLabel(line, "model");
                if (value != null && !value.isBlank()) {
                    data.setModel(cleanText(value));
                    return;
                }
            }
        }
    }

    private void extractVehicleClass(String[] lines, RCData data) {

        for (String line : lines) {
            String lower = line.toLowerCase().trim();
            if (lower.contains("vehicle class") || lower.contains("vehicle")) {
                int colonIndex = line.indexOf(':');
                String value = colonIndex >= 0 ? line.substring(colonIndex + 1).trim() : valueAfterLabel(line, "vehicle class");
                if (value != null && !value.isBlank()) {
                    data.setVehicleClass(cleanText(value));
                    return;
                }
            }
        }
    }

    //-------------------------------------------------------
    // Dates
    //-------------------------------------------------------

    private void extractRegistrationDate(String[] lines, RCData data) {

        for (int i = 0; i < lines.length; i++) {
            String lower = lines[i].toLowerCase();
            if (lower.contains("registration date") || lower.contains("reg. date") || lower.contains("reg date")) {
                LocalDate date = findDateNear(lines, i);
                if (date != null) {
                    data.setRegistrationDate(date);
                    return;
                }
            }
        }

        for (String line : lines) {
            String lower = line.toLowerCase();
            if (lower.contains("mfg") || lower.contains("mth")) {
                Matcher m = MFG_DATE_PATTERN.matcher(line);
                if (m.find()) {
                    try {
                        int month = Integer.parseInt(m.group(1));
                        int year = Integer.parseInt(m.group(2));
                        data.setRegistrationDate(LocalDate.of(year, Math.min(Math.max(month, 1), 12), 1));
                        return;
                    } catch (Exception ignored) {
                    }
                }
            }
        }
    }

    private void extractInsuranceValidUpto(String[] lines, RCData data) {

        for (int i = 0; i < lines.length; i++) {
            String lower = lines[i].toLowerCase();
            if (lower.contains("insurance valid") || lower.contains("ins valid")) {
                LocalDate date = findDateNear(lines, i);
                if (date != null) {
                    data.setInsuranceValidUpto(date);
                    return;
                }
            }
        }
    }

    private void extractPuccValidUpto(String[] lines, RCData data) {

        for (int i = 0; i < lines.length; i++) {
            String lower = lines[i].toLowerCase();
            if (lower.contains("pucc valid") || lower.contains("puc valid")) {
                LocalDate date = findDateNear(lines, i);
                if (date != null) {
                    data.setPuccValidUpto(date);
                    return;
                }
            }
        }
    }

    private void extractFitnessValidUpto(String[] lines, RCData data) {

        for (int i = 0; i < lines.length; i++) {
            String lower = lines[i].toLowerCase();
            if (lower.contains("fitness valid") || lower.contains("fit valid")) {
                LocalDate date = findDateNear(lines, i);
                if (date != null) {
                    data.setFitnessValidUpto(date);
                    return;
                }
            }
        }
    }

    private LocalDate findDateNear(String[] lines, int labelIndex) {

        LocalDate date = parseFirstDate(lines[labelIndex]);
        if (date != null) {
            return date;
        }

        if (labelIndex + 1 < lines.length) {
            return parseFirstDate(lines[labelIndex + 1]);
        }

        return null;
    }

    private LocalDate parseFirstDate(String line) {

        Matcher m = DATE_PATTERN.matcher(line);
        if (!m.find()) {
            return null;
        }

        return parseDate(m.group());
    }

    private LocalDate parseDate(String rawDate) {

        String raw = rawDate.replace('/', '-');

        try {
            return LocalDate.parse(raw, DateTimeFormatter.ofPattern("d-M-yyyy"));
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    //-------------------------------------------------------
    // Address
    //-------------------------------------------------------

    private static final String[] ADDRESS_STOP_WORDS = {
            "vehicle class", "fuel used", "maker", "model", "body type",
            "signature", "hologram", "seating capacity", "wheel base"
    };

    private static final int MAX_ADDRESS_LINES = 8;

    private void extractAddress(String[] lines, RCData data) {

        StringBuilder address = new StringBuilder();
        boolean start = false;
        int collected = 0;
        int consecutiveBlanks = 0;

        for (String line : lines) {

            String lower = line.toLowerCase();

            if (!start && lower.trim().startsWith("address")) {

                start = true;

                String value = valueAfterLabel(line, "address");
                value = cleanAddressLine(value);

                if (value != null && !value.isBlank()) {
                    address.append(value).append(" ");
                    collected++;
                }

                continue;
            }

            if (start) {

                if (collected >= MAX_ADDRESS_LINES) {
                    break;
                }

                if (containsAny(lower, ADDRESS_STOP_WORDS)) {
                    break;
                }

                if (line.isBlank()) {

                    consecutiveBlanks++;

                    if (consecutiveBlanks >= 2) {
                        break;
                    }

                    continue;
                }

                consecutiveBlanks = 0;

                String cleaned = cleanAddressLine(line);

                if (cleaned != null && !cleaned.isBlank()) {
                    address.append(cleaned).append(" ");
                    collected++;
                }
            }
        }

        if (!address.toString().isBlank()) {
            data.setAddress(address.toString().trim());
        }
    }

    private String cleanAddressLine(String line) {

        if (line == null) {
            return null;
        }

        String trimmed = line.trim();

        if (trimmed.length() <= 2 && !trimmed.matches("[0-9][0-9,-]*")) {
            return null;
        }

        String cleaned = trimmed.replaceAll("(^|\\s)[A-Za-z0-9](\\s|$)", " ")
                .replaceAll("\\s+", " ")
                .trim();

        return cleaned.isBlank() ? null : cleaned;
    }

    private boolean containsAny(String text, String[] words) {

        for (String word : words) {
            if (text.contains(word)) {
                return true;
            }
        }

        return false;
    }

    //-------------------------------------------------------
    // Shared helpers
    //-------------------------------------------------------

    private String valueAfterLabel(String line, String label) {

        String trimmed = line.trim();
        String lower = trimmed.toLowerCase();

        if (!lower.startsWith(label)) {
            return null;
        }

        String rest = trimmed.substring(label.length()).trim();

        if (rest.startsWith(":")) {
            rest = rest.substring(1).trim();
        }

        return rest;
    }

    private String valueAfterAnyLabel(String line, String... labels) {

        for (String label : labels) {

            String value = valueAfterLabel(line, label);

            if (value != null) {
                return value;
            }
        }

        String lower = line.toLowerCase();

        for (String label : labels) {

            int idx = lower.indexOf(label);

            if (idx >= 0) {

                String rest = line.substring(idx + label.length()).trim();

                if (rest.startsWith(":")) {
                    rest = rest.substring(1).trim();
                }

                return rest;
            }
        }

        return null;
    }

    private String cleanText(String value) {

        return value.replaceAll("[^A-Za-z0-9 .]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}

