package com.sssit.bikerental.modules.verification.bikedocument.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.verification.bikedocument.model.RCData;

/**
 * Extracts structured Registration Certificate (RC) fields (Owner
 * Name, Registration Number, Chassis Number, Engine Number, Maker's
 * Name, Model, Vehicle Class, Registration Date, Insurance/PUCC/
 * Fitness validity, Address) out of the raw OCR text that
 * OCRService.extractData(file).getRawText() returns.
 */
@Component
public class RCExtractor {

    // Indian vehicle registration number, e.g. AP39KA1234, TS09EF4321, TS02EY4494
    private static final Pattern REG_NUMBER_PATTERN =
            Pattern.compile("\\b[A-Z]{2}[-\\s]?[0-9]{1,2}[-\\s]?[A-Z]{0,3}[-\\s]?[0-9]{4}\\b");

    private static final Pattern DATE_PATTERN =
            Pattern.compile("\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}");

    private static final Pattern MFG_DATE_PATTERN =
            Pattern.compile("\\b(\\d{1,2})[/-](\\d{4})\\b");

    // Chassis/engine numbers are alphanumeric, typically 5-20 chars
    private static final Pattern ALNUM_CODE_PATTERN =
            Pattern.compile("\\b[A-Z0-9]{5,20}\\b");

    private static final Pattern OWNER_LABEL_PATTERN =
            Pattern.compile("(?i)(reg[a-z]*\\.?[\\s:-]*owner|registered[\\s:-]*owner|owner['s\\s]*name|owner)[\\s:-]*");

    private static final String[] NAME_JUNK_MARKERS = {
            "son/daughter", "s/o", "d/o", "w/o", "address", "signature", "h.no", "hno"
    };

    public RCData extract(String rawText) {

        RCData data = new RCData();

        if (rawText == null || rawText.isBlank()) {
            return data;
        }

        String[] lines = rawText.split("\\r?\\n");

        extractRegistrationNumber(rawText, lines, data);
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
    // Registration Number
    //-------------------------------------------------------

    // OCR-lenient pattern that allows common OCR digit misreads (O, U, Q, D, Z, I, L) in digit positions
    private static final Pattern REG_NUMBER_OCR_PATTERN =
            Pattern.compile("\\b[A-Z]{2}[-\\s]?[0-9OQUZIDo]{1,2}[-\\s]?[A-Za-z]{0,3}[-\\s]?[0-9OQUZIDo]{4}\\b");

    private void extractRegistrationNumber(String rawText, String[] lines, RCData data) {

        // 1. Strict regex pass on lines starting with registration labels
        for (String line : lines) {
            String lower = line.toLowerCase();
            if (lower.contains("regn") || lower.contains("registration") || lower.contains("regd") || lower.contains("reg.")) {
                Matcher m = REG_NUMBER_PATTERN.matcher(line.toUpperCase());
                if (m.find()) {
                    data.setRegistrationNumber(stripSeparators(m.group()));
                    return;
                }
            }
        }

        // 2. Strict regex pass over full text
        Matcher m = REG_NUMBER_PATTERN.matcher(rawText.toUpperCase());
        if (m.find()) {
            data.setRegistrationNumber(stripSeparators(m.group()));
            return;
        }

        // 3. Lenient OCR-corrected pass (fixes O/U/Q -> 0, I/L -> 1, Z -> 2 in digit slots on faint/red text)
        Matcher ocrMatcher = REG_NUMBER_OCR_PATTERN.matcher(rawText.toUpperCase());
        if (ocrMatcher.find()) {
            String rawMatch = stripSeparators(ocrMatcher.group());
            String corrected = fixRegistrationNumberOcrNoise(rawMatch);
            if (corrected != null && REG_NUMBER_PATTERN.matcher(corrected).matches()) {
                data.setRegistrationNumber(corrected);
                return;
            }
        }
    }

    /**
     * Fixes common OCR misreads on Indian vehicle registration numbers (e.g. TSU2EY4494 -> TS02EY4494)
     */
    public static String fixRegistrationNumberOcrNoise(String raw) {
        if (raw == null || raw.length() < 8) return raw;

        String stateCode = raw.substring(0, 2);
        String rest = raw.substring(2);

        // Replace OCR digit confusions in rest
        StringBuilder sb = new StringBuilder(stateCode);
        boolean inTrailingDigits = false;
        int len = rest.length();

        for (int i = 0; i < len; i++) {
            char c = rest.charAt(i);
            // Identify if we are in the RTO code (first 1-2 chars) or final serial number (last 4 chars)
            boolean isDigitSlot = (i < 2) || (i >= len - 4);

            if (isDigitSlot) {
                if (c == 'O' || c == 'o' || c == 'U' || c == 'Q' || c == 'D') {
                    sb.append('0');
                } else if (c == 'I' || c == 'l' || c == '|') {
                    sb.append('1');
                } else if (c == 'Z') {
                    sb.append('2');
                } else if (c == 'S') {
                    sb.append('5');
                } else if (c == 'B') {
                    sb.append('8');
                } else {
                    sb.append(c);
                }
            } else {
                sb.append(c);
            }
        }

        return sb.toString();
    }

    private String stripSeparators(String value) {
        return value.replaceAll("[\\s-]", "");
    }

    //-------------------------------------------------------
    // Owner Name
    //-------------------------------------------------------

    private void extractOwnerName(String[] lines, RCData data) {

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();

            Matcher m = OWNER_LABEL_PATTERN.matcher(line);
            if (m.find()) {
                String value = line.substring(m.end()).trim();

                if ((value.isBlank() || !isPlausibleName(value)) && i + 1 < lines.length) {
                    i++;
                    value = lines[i].trim();
                }

                value = truncateAtJunk(value);

                if (isPlausibleName(value)) {
                    StringBuilder fullOwnerName = new StringBuilder(value);

                    if (i + 1 < lines.length) {
                        String nextLine = lines[i + 1].trim();
                        String nextLower = nextLine.toLowerCase();

                        if (isPlausibleName(nextLine) && !isKnownLabelOrAddress(nextLower)) {
                            fullOwnerName.append(" ").append(nextLine);
                        }
                    }

                    data.setOwnerName(cleanText(fullOwnerName.toString()));
                    return;
                }
            }
        }

        // Fallback: Check 1-3 lines immediately above "Address" label if label parsing was garbled
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().contains("address")) {
                for (int j = i - 1; j >= 0 && j >= i - 3; j--) {
                    String candidate = truncateAtJunk(lines[j].trim());
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

        String lower = value.toLowerCase();
        for (String junk : JUNK_LABEL_WORDS) {
            if (lower.contains(junk)) {
                return false;
            }
        }

        return value.replaceAll("[^A-Za-z]", "").length() >= 2;
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
            if (lower.contains("vehicle class")) {
                String value = valueAfterLabel(line, "vehicle class");
                if (value != null && !value.isBlank()) {
                    data.setVehicleClass(value.trim());
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

