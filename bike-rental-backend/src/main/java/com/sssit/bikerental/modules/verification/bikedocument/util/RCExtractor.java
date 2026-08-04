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
 *
 * Mirrors drivinglicense.util.DLExtractor - only post-processes plain
 * text, doesn't touch OCRService or anything under aadhaar/
 * drivinglicense.
 */
@Component
public class RCExtractor {

    // Indian vehicle registration number, e.g. AP39KA1234, TS09EF4321
    private static final Pattern REG_NUMBER_PATTERN =
            Pattern.compile("\\b[A-Z]{2}[-\\s]?[0-9]{1,2}[-\\s]?[A-Z]{0,3}[-\\s]?[0-9]{4}\\b");

    private static final Pattern DATE_PATTERN =
            Pattern.compile("\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}");

    // Chassis/engine numbers are alphanumeric, typically 5-20 chars
    private static final Pattern ALNUM_CODE_PATTERN =
            Pattern.compile("\\b[A-Z0-9]{5,20}\\b");

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

    private void extractRegistrationNumber(String rawText, String[] lines, RCData data) {

        for (String line : lines) {

            String lower = line.toLowerCase();

            if (lower.contains("registration no")) {

                Matcher m = REG_NUMBER_PATTERN.matcher(line.toUpperCase());

                if (m.find()) {
                    data.setRegistrationNumber(stripSeparators(m.group()));
                    return;
                }
            }
        }

        // Fallback: search the whole document for anything matching
        // the registration-number shape.
        Matcher m = REG_NUMBER_PATTERN.matcher(rawText.toUpperCase());

        if (m.find()) {
            data.setRegistrationNumber(stripSeparators(m.group()));
        }
    }

    private String stripSeparators(String value) {
        return value.replaceAll("[\\s-]", "");
    }

    //-------------------------------------------------------
    // Owner Name
    //-------------------------------------------------------

    private void extractOwnerName(String[] lines, RCData data) {

        for (String line : lines) {

            String lower = line.toLowerCase().trim();

            if (lower.startsWith("owner name")) {

                String value = valueAfterLabel(line, "owner name");
                value = truncateAtJunk(value);

                if (isPlausibleName(value)) {
                    data.setOwnerName(cleanText(value));
                    return;
                }
            }
        }
    }

    private static final String[] NAME_JUNK_MARKERS = {
            "son/daughter", "s/o", "d/o", "w/o", "address", "signature"
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
    // Chassis / Engine Number
    //-------------------------------------------------------

    private void extractChassisNumber(String[] lines, RCData data) {

        for (String line : lines) {

            String lower = line.toLowerCase();

            if (lower.contains("chassis number") || lower.contains("chassis no")) {

                String value = valueAfterAnyLabel(line, "chassis number", "chassis no");

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

            if (lower.contains("engine number") || lower.contains("engine no")) {

                String value = valueAfterAnyLabel(line, "engine number", "engine no");

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

            if (lower.startsWith("maker")) {

                // Deliberately NOT using valueAfterAnyLabel's
                // label-length arithmetic here: OCR frequently
                // mangles/drops the apostrophe in "MAKER'S NAME"
                // (reads it as "MAKERS NAME", "MAKER S NAME", or
                // just "MAKER NAME"), which made the bare "maker"
                // fallback label match at the wrong offset and
                // extract junk like "'S NAME : BAJAJ AUTO LTD"
                // instead of "BAJAJ AUTO LTD". Every real RC prints
                // this as "LABEL : VALUE", so splitting on the first
                // colon is robust regardless of exactly how the
                // apostrophe/label text itself came out of OCR.
                int colonIndex = line.indexOf(':');

                String value = colonIndex >= 0
                        ? line.substring(colonIndex + 1).trim()
                        : null;

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

            if (lower.startsWith("model")) {

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

            if (lower.startsWith("vehicle class")) {

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

            if (lower.contains("registration date")) {

                LocalDate date = findDateNear(lines, i);

                if (date != null) {
                    data.setRegistrationDate(date);
                    return;
                }
            }
        }
    }

    private void extractInsuranceValidUpto(String[] lines, RCData data) {

        for (int i = 0; i < lines.length; i++) {

            String lower = lines[i].toLowerCase();

            if (lower.contains("insurance valid")) {

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

            if (lower.contains("fitness valid")) {

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

        // Label may not be at the very start of the line (e.g. it
        // follows a leading section marker) - fall back to a plain
        // indexOf + colon-strip.
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
