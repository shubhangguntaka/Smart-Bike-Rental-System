package com.sssit.bikerental.modules.verification.drivinglicense.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

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

    // Typical Indian DL formats: TS0920210012345 / TS-09 20210012345
    // RTO code can be 2 or 3 digits and the serial 6 or 7 digits
    // depending on the issuing state, so both are kept flexible.
    private static final Pattern DL_NUMBER_PATTERN =
            Pattern.compile("\\b[A-Z]{2}[-\\s]?[0-9]{2,3}[-\\s]?[0-9]{4}[-\\s]?[0-9]{6,7}\\b");

    private static final Pattern DATE_PATTERN =
            Pattern.compile("\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}");

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
    // License Number
    //-------------------------------------------------------

    private void extractLicenseNumber(String rawText, String[] lines, DLData data) {

        // Prefer a labelled line ("DL No", "Licence No", "License No")
        for (String line : lines) {

            String lower = line.toLowerCase();

            if (lower.contains("dl no") || lower.contains("dlno")
                    || lower.contains("licence no") || lower.contains("license no")) {

                Matcher m = DL_NUMBER_PATTERN.matcher(line.toUpperCase());

                if (m.find()) {
                    data.setLicenseNumber(stripSeparators(m.group()));
                    return;
                }
            }
        }

        // Fallback: search the whole document for anything matching
        // the license-number shape.
        Matcher m = DL_NUMBER_PATTERN.matcher(rawText.toUpperCase());

        if (m.find()) {
            data.setLicenseNumber(stripSeparators(m.group()));
        }
    }

    private String stripSeparators(String value) {
        return value.replaceAll("[\\s-]", "");
    }

    //-------------------------------------------------------
    // Name
    //-------------------------------------------------------

    private void extractName(String[] lines, DLData data) {

        for (String line : lines) {

            String lower = line.toLowerCase().trim();

            // Avoid matching "S/o", "D/o", "W/o" (relative's name) lines
            if (lower.startsWith("name")) {

                String value = valueAfterLabel(line, "name");
                value = truncateAtJunk(value);

                if (isPlausibleName(value)) {
                    data.setCustomerName(cleanText(value));
                    return;
                }
            }
        }
    }

    // Labels that sometimes get OCR'd onto the same line as the name
    // (e.g. "Holder's Signature" sitting to the right of "Name" on
    // the card image). Anything from here onward is discarded.
    private static final String[] NAME_JUNK_MARKERS = {
            "holder", "signature", "organ", "donor", "blood",
            "son/daughter", "s/o", "d/o", "w/o", "dob", "address"
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
