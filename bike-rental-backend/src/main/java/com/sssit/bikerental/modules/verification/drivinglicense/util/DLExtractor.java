package com.sssit.bikerental.modules.verification.drivinglicense.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.verification.common.util.DocumentIdentifierUtil;
import com.sssit.bikerental.modules.verification.common.util.IndianStateCodeUtil;
import com.sssit.bikerental.modules.verification.drivinglicense.model.DLData;

/**
 * Extracts structured Driving License fields (Name, License Number,
 * DOB, Issue Date, Valid Till, Address) out of the raw OCR text that
 * OCRService.extractData(file).getRawText() already returns.
 *
 * IMPORTANT: This class only post-processes plain text. It does not
 * touch OCRService, Tesseract config, or anything under the aadhaar
 * package - the existing, working Aadhaar flow is left untouched.
 */
@Component
public class DLExtractor {

    // Primary project format: 2-character Indian state code + 14 digits (Total 16 characters)
    // E.g. TG00220240006700, TS00123456789012
    private static final Pattern DL_EXACT_PATTERN =
            Pattern.compile("(?i)\\b([A-Z]{2})[-\\s/.]*([0-9]{14})\\b");

    // Parivahan & Indian DL formats split by common spaces or slashes
    private static final Pattern DL_TOKENIZED_PATTERN =
            Pattern.compile("(?i)\\b([A-Z]{2})[-\\s/.]*([0-9]{1,4})[-\\s/.]*([0-9]{4})[-\\s/.]*([0-9]{4,8})\\b");

    private static final Pattern DL_GENERAL_PATTERN =
            Pattern.compile("(?i)\\b([A-Z]{2})[-\\s/.]*([0-9A-Z]{10,16})\\b");

    private static final Pattern DATE_PATTERN =
            Pattern.compile("\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}");

    private static final String[] DL_LABELS = {
            "dl no", "dl no.", "dl. no", "dlno", "dl.", "dl number", "dl",
            "licence no", "licence no.", "license no", "license no.", "licence number",
            "license number", "driving licence", "driving license", "lic no", "card no",
            "authorisation no", "authorization no"
    };

    public DLData extract(String rawText) {

        DLData data = new DLData();

        if (rawText == null || rawText.isBlank()) {
            return data;
        }

        String[] lines = rawText.split("\\r?\\n");

        extractLicenseNumber(rawText, lines, data);
        extractName(lines, data);
        extractDob(lines, data);
        extractIssueAndValidity(lines, data);
        extractAddress(lines, data);

        return data;
    }

    //-------------------------------------------------------
    // License Number Candidate Selection
    //-------------------------------------------------------

    private void extractLicenseNumber(String rawText, String[] lines, DLData data) {
        java.util.Map<String, Integer> candidates = new java.util.LinkedHashMap<>();

        java.util.function.BiConsumer<String, Integer> addCandidate = (cand, score) -> {
            if (cand == null) return;
            String norm = DocumentIdentifierUtil.normalizeDrivingLicenseNumber(cand);
            if (isValidDlCandidate(norm)) {
                // Decisive boost for exact project standard AA + 14 digits (length 16)
                if (norm.length() == 16 && DocumentIdentifierUtil.isExactDlFormat(norm)) {
                    score += 300;
                }
                int existing = candidates.getOrDefault(norm, 0);
                if (score > existing) {
                    candidates.put(norm, score);
                }
            }
        };

        // Pass 0: Location-based priority - identify document title and inspect region directly below it
        // e.g. "Indian Union Driving Licence", "Issued by Telangana", "DL TITLE REGION", etc.
        for (int i = 0; i < lines.length; i++) {
            String lower = lines[i].toLowerCase();
            boolean isTitle = lower.contains("driving licence") || lower.contains("driving license")
                    || lower.contains("indian union") || lower.contains("issued by telangana")
                    || lower.contains("issued by") || lower.contains("union of india")
                    || lower.contains("dl title region");

            if (isTitle) {
                // Inspect lines directly below the title (next 1 to 5 lines, before personal details)
                for (int next = i + 1; next < lines.length && next <= i + 5; next++) {
                    String targetLine = lines[next].trim();
                    if (targetLine.isBlank()) continue;

                    // Match exact AA + 14 digits pattern prominently below title
                    Matcher mExact = DL_EXACT_PATTERN.matcher(targetLine.toUpperCase());
                    while (mExact.find()) {
                        addCandidate.accept(mExact.group(), 350);
                    }

                    // Match tokenized or spaced tokens
                    Matcher mTok = DL_TOKENIZED_PATTERN.matcher(targetLine.toUpperCase());
                    while (mTok.find()) {
                        addCandidate.accept(mTok.group(), 300);
                    }

                    String cand = findDlInText(targetLine);
                    if (cand != null) {
                        addCandidate.accept(cand, 250);
                    }
                }
            }
        }

        // Pass 1: Check lines containing DL labels (or next 1-2 lines)
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            String lower = line.toLowerCase();
            for (String label : DL_LABELS) {
                if (lower.contains(label)) {
                    int labelIdx = lower.indexOf(label);
                    String after = line.substring(labelIdx + label.length()).trim();
                    while (after.startsWith(":") || after.startsWith("-") || after.startsWith(".") || after.startsWith("/")) {
                        after = after.substring(1).trim();
                    }
                    String cand = findDlInText(after);
                    if (cand != null) {
                        addCandidate.accept(cand, 100);
                    }

                    cand = findDlInText(line);
                    if (cand != null) {
                        addCandidate.accept(cand, 90);
                    }

                    for (int next = i + 1; next < lines.length && next <= i + 2; next++) {
                        String nextCand = findDlInText(lines[next].trim());
                        if (nextCand != null) {
                            addCandidate.accept(nextCand, 80);
                        }
                    }
                }
            }
        }

        // Pass 2: Line-by-line regex search for exact AA + 14 digits pattern
        for (String line : lines) {
            Matcher mExact = DL_EXACT_PATTERN.matcher(line.toUpperCase());
            while (mExact.find()) {
                addCandidate.accept(mExact.group(), 120);
            }

            Matcher mTok = DL_TOKENIZED_PATTERN.matcher(line.toUpperCase());
            while (mTok.find()) {
                addCandidate.accept(mTok.group(), 90);
            }

            String cand = findDlInText(line);
            if (cand != null) {
                addCandidate.accept(cand, 70);
            }
        }

        // Pass 3: Token merge pass per line (handles spaced-out tokens like "TG002 2024 0006700")
        for (String line : lines) {
            String compactLine = line.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
            if (compactLine.length() >= 13 && compactLine.length() <= 30) {
                for (int i = 0; i <= compactLine.length() - 13; i++) {
                    String sub = compactLine.substring(i);
                    if (sub.length() >= 13) {
                        String state = sub.substring(0, 2);
                        if (IndianStateCodeUtil.isValidStateCode(state)) {
                            // Check exact 16 chars (2 state + 14 digits)
                            if (sub.length() >= 16) {
                                String exact16 = sub.substring(0, 16);
                                String repaired = repairOcrDigits(exact16.substring(2));
                                if (repaired.matches("^[0-9]{14}$")) {
                                    addCandidate.accept(state + repaired, 140);
                                }
                            }
                            // General length
                            for (int len = 13; len <= Math.min(18, sub.length()); len++) {
                                String cand = sub.substring(0, len);
                                String rest = cand.substring(2);
                                String repaired = repairOcrDigits(rest);
                                if (repaired.matches("^[0-9]{11,16}$")) {
                                    addCandidate.accept(state + repaired, 50);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Pass 4: Full text scan for exact pattern
        Matcher mAllExact = DL_EXACT_PATTERN.matcher(rawText.toUpperCase());
        while (mAllExact.find()) {
            addCandidate.accept(mAllExact.group(), 110);
        }

        // Pass 5: Token-level OCR repair across all tokens
        for (String line : lines) {
            String[] tokens = line.split("[\\s,;:]+");
            for (String tok : tokens) {
                String clean = tok.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
                if (clean.length() >= 13 && clean.length() <= 18) {
                    String state = clean.substring(0, 2);
                    if (IndianStateCodeUtil.isValidStateCode(state)) {
                        String rest = clean.substring(2);
                        String repairedDigits = repairOcrDigits(rest);
                        if (repairedDigits.matches("^[0-9]{11,16}$")) {
                            addCandidate.accept(state + repairedDigits, 60);
                        }
                    }
                }
            }
        }

        // Pick highest-scoring candidate
        String bestCandidate = null;
        int maxScore = -1;
        for (java.util.Map.Entry<String, Integer> entry : candidates.entrySet()) {
            if (entry.getValue() > maxScore) {
                maxScore = entry.getValue();
                bestCandidate = entry.getKey();
            }
        }

        if (bestCandidate != null) {
            data.setLicenseNumber(bestCandidate);
        }
    }

    private boolean isValidDlCandidate(String cand) {
        if (cand == null || cand.length() < 13 || cand.length() > 18) return false;
        String state = cand.substring(0, 2);
        if (!IndianStateCodeUtil.isValidStateCode(state)) return false;
        String rest = cand.substring(2);
        return rest.matches("^[0-9]{11,16}$");
    }

    private String findDlInText(String text) {
        if (text == null || text.isBlank()) return null;

        Matcher m1 = DL_EXACT_PATTERN.matcher(text.toUpperCase());
        if (m1.find()) {
            return stripSeparators(m1.group());
        }

        Matcher m2 = DL_GENERAL_PATTERN.matcher(text.toUpperCase());
        while (m2.find()) {
            String found = m2.group();
            String state = found.substring(0, 2);
            if (IndianStateCodeUtil.isValidStateCode(state)) {
                String rest = found.substring(2);
                String repaired = repairOcrDigits(rest);
                if (repaired.matches("^[0-9]{11,16}$")) {
                    return state + repaired;
                }
            }
        }

        return null;
    }

    private String repairOcrDigits(String s) {
        if (s == null) return "";
        return s.replace('O', '0')
                .replace('o', '0')
                .replace('D', '0')
                .replace('Q', '0')
                .replace('I', '1')
                .replace('l', '1')
                .replace('|', '1')
                .replace('S', '5')
                .replace('s', '5')
                .replace('B', '8')
                .replace('Z', '2')
                .replace('z', '2');
    }

    private String stripSeparators(String value) {
        if (value == null) return null;
        String clean = value.replaceAll("[\\s-/:.]", "").toUpperCase();
        if (clean.length() >= 2) {
            String state = clean.substring(0, 2);
            String rest = repairOcrDigits(clean.substring(2));
            return state + rest;
        }
        return clean;
    }

    //-------------------------------------------------------
    // Name
    //-------------------------------------------------------

    private void extractName(String[] lines, DLData data) {

        for (String line : lines) {

            String lower = line.toLowerCase().trim();

            // Avoid matching "S/o", "D/o", "W/o", "Father" lines
            if (lower.contains("s/o") || lower.contains("d/o") || lower.contains("w/o")
                    || lower.contains("son of") || lower.contains("daughter of") || lower.contains("wife of")
                    || lower.contains("father")) {
                continue;
            }

            if (lower.contains("name")) {

                String value = valueAfterLabel(line, "name");
                if (value == null && line.contains(":")) {
                    int colonIdx = line.indexOf(':');
                    value = line.substring(colonIdx + 1).trim();
                }

                value = truncateAtJunk(value);

                if (isPlausibleName(value)) {
                    data.setCustomerName(cleanText(value));
                    return;
                }
            }
        }

        // Fallback: look for line right before "Date of birth" or "Son/Daughter"
        for (int i = 0; i < lines.length; i++) {
            String lower = lines[i].toLowerCase().trim();
            if (lower.contains("date of birth") || lower.contains("dob") || lower.contains("son/daughter")) {
                if (i > 0) {
                    String prevLine = lines[i - 1].trim();
                    if (!prevLine.toLowerCase().contains("indian") && !prevLine.toLowerCase().contains("licence")
                            && !prevLine.toLowerCase().contains("driving") && isPlausibleName(prevLine)) {
                        String clean = cleanText(truncateAtJunk(prevLine));
                        if (clean.length() >= 3) {
                            data.setCustomerName(clean);
                            return;
                        }
                    }
                }
            }
        }
    }

    // Labels that sometimes get OCR'd onto the same line as the name
    // (e.g. "Holder's Signature" sitting to the right of "Name" on
    // the card image). Anything from here onward is discarded.
    private static final String[] NAME_JUNK_MARKERS = {
            "holder's signature", "holder signature", "signature", "organ donor",
            "blood group", "blood", "son/daughter", "s/o", "d/o", "w/o", "dob",
            "date of birth", "address", "validity"
    };

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

    private boolean isPlausibleName(String value) {
        return value != null
                && !value.isBlank()
                && value.replaceAll("[^A-Za-z]", "").length() >= 2;
    }

    //-------------------------------------------------------
    // Dates (DOB / Issue Date / Valid Till)
    //-------------------------------------------------------

    private void extractDob(String[] lines, DLData data) {

        for (int i = 0; i < lines.length; i++) {

            String lower = lines[i].toLowerCase();

            if (lower.contains("dob") || lower.contains("date of birth")) {

                LocalDate date = findDateNear(lines, i);

                if (date != null) {
                    data.setDob(date);
                    return;
                }
            }
        }
    }

    private void extractIssueDate(String[] lines, DLData data) {

        for (int i = 0; i < lines.length; i++) {

            String lower = lines[i].toLowerCase();

            if (lower.contains("issue date")
                    || lower.contains("date of issue")
                    || lower.contains("doi")) {

                LocalDate date = findDateNear(lines, i);

                if (date != null) {
                    data.setIssueDate(date);
                    return;
                }
            }
        }
    }

    private void extractValidTill(String[] lines, DLData data) {

        for (int i = 0; i < lines.length; i++) {

            String lower = lines[i].toLowerCase();

            boolean isValidityLabel =
                    !lower.contains("invalid")
                            && (lower.contains("valid till")
                            || lower.contains("valid upto")
                            || lower.contains("validity")
                            || lower.contains("expiry"));

            if (isValidityLabel) {

                LocalDate date = findDateNear(lines, i);

                if (date != null) {
                    data.setValidTill(date);
                    return;
                }
            }
        }
    }

    /**
     * Handles both layouts seen on real Indian DL cards:
     *
     * 1) Separate lines - "Issue Date: dd/mm/yyyy" and, elsewhere,
     *    "Valid Till: dd/mm/yyyy" - handled by the plain
     *    extractIssueDate/extractValidTill fallback below.
     *
     * 2) A single combined header line - e.g.
     *      "Issue Date  Validity(NT)  Validity(TR)"
     *      "22/10/2022 02/08/2044   00/00/0000"
     *    where extractIssueDate and extractValidTill would otherwise
     *    BOTH grab the first date on the values line. Here we detect
     *    the combined header and assign dates positionally: 1st ->
     *    Issue Date, 2nd -> Valid Till (NT). Unparseable placeholder
     *    dates like 00/00/0000 (Validity TR, when not applicable)
     *    are simply skipped.
     */
    private void extractIssueAndValidity(String[] lines, DLData data) {

        for (int i = 0; i < lines.length; i++) {

            String lower = lines[i].toLowerCase();

            boolean hasIssueLabel = lower.contains("issue date")
                    || lower.contains("date of issue")
                    || lower.contains("doi");

            boolean hasValidityLabel = !lower.contains("invalid")
                    && (lower.contains("valid till")
                    || lower.contains("valid upto")
                    || lower.contains("validity")
                    || lower.contains("expiry"));

            if (hasIssueLabel && hasValidityLabel) {

                java.util.List<LocalDate> dates = allDatesOnLine(lines[i]);

                if (dates.isEmpty() && i + 1 < lines.length) {
                    dates = allDatesOnLine(lines[i + 1]);
                }

                if (!dates.isEmpty()) {
                    data.setIssueDate(dates.get(0));
                }

                if (dates.size() >= 2) {
                    data.setValidTill(dates.get(1));
                }

                break;
            }
        }

        if (data.getIssueDate() == null) {
            extractIssueDate(lines, data);
        }

        if (data.getValidTill() == null) {
            extractValidTill(lines, data);
        }
    }

    private java.util.List<LocalDate> allDatesOnLine(String line) {

        java.util.List<LocalDate> dates = new java.util.ArrayList<>();

        Matcher m = DATE_PATTERN.matcher(line);

        while (m.find()) {

            LocalDate date = parseDate(m.group());

            if (date != null) {
                dates.add(date);
            }
        }

        return dates;
    }

    /**
     * Looks for a date on the labelled line itself, then (if not
     * found there - OCR often puts the value on the next line) on
     * the line immediately after it.
     */
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
            "blood group", "pin code", "signature", "hologram",
            "issuing authority", "rto", "cov", "class of vehicle",
            "organ donor"
    };

    // Safety cap so a card with no clear end-of-address marker (or a
    // run of stray blank lines) doesn't vacuum up the rest of the
    // document.
    private static final int MAX_ADDRESS_LINES = 8;

    private void extractAddress(String[] lines, DLData data) {

        StringBuilder address = new StringBuilder();
        boolean start = false;
        int collected = 0;
        int consecutiveBlanks = 0;

        for (String line : lines) {

            String lower = line.toLowerCase();

            if (!start && (lower.startsWith("add") || lower.contains("address"))) {

                start = true;

                String value = valueAfterLabel(line, "address");

                if (value == null) {
                    value = valueAfterLabel(line, "add");
                }

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

                // A single stray blank line (common OCR artifact
                // between text blocks) is skipped rather than treated
                // as the end of the address; two in a row means we've
                // genuinely run out of address text.
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

    /**
     * Drops lines/tokens that are just OCR noise - e.g. a lone "3" or
     * "x" picked up from the chip icon or a stray mark near the
     * address block - while keeping genuine short address lines like
     * house numbers ("2-125").
     */
    private String cleanAddressLine(String line) {

        if (line == null) {
            return null;
        }

        String trimmed = line.trim();

        // A whole line that's just 1-2 characters and isn't a
        // plausible house/door number (digits with optional -/,) is
        // almost always stray noise.
        if (trimmed.length() <= 2 && !trimmed.matches("[0-9][0-9,-]*")) {
            return null;
        }

        // Strip isolated single-character noise tokens surrounded by
        // spaces (e.g. "3 2-125 3 KESHARAJUPALLY" -> "2-125 KESHARAJUPALLY").
        // Covers both stray letters and stray digits (chip-icon noise
        // commonly OCRs as isolated digits like "3").
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

    /**
     * Returns whatever follows a label on the same line, whether the
     * line uses a colon ("Name: John") or just a space ("Name John").
     * Returns null if the label isn't actually present at the start.
     */
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

    private String cleanText(String value) {

        return value.replaceAll("[^A-Za-z .]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
