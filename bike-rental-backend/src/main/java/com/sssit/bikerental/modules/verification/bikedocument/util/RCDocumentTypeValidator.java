package com.sssit.bikerental.modules.verification.bikedocument.util;

import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

/**
 * Decides whether the OCR text extracted from an uploaded image
 * actually looks like a vehicle Registration Certificate (RC), or
 * some other document (Aadhaar, PAN, Driving Licence, Passport,
 * etc.), mirroring aadhaar.validator.DocumentTypeValidator.
 *
 * Runs BEFORE field extraction/validation so the owner gets a clear
 * "please upload your RC" message instead of a confusing field-level
 * rejection when the wrong document is uploaded.
 */
@Component
public class RCDocumentTypeValidator {

    // Indian vehicle registration number, e.g. AP39KA1234, TS09EF4321
    private static final Pattern REG_NUMBER_PATTERN =
            Pattern.compile("\\b[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}\\b");

    // A 12 digit Aadhaar number, grouped as 4-4-4
    private static final Pattern AADHAAR_NUMBER_PATTERN =
            Pattern.compile("\\b\\d{4}\\s?\\d{4}\\s?\\d{4}\\b");

    // A PAN number, e.g. ABCDE1234F
    private static final Pattern PAN_NUMBER_PATTERN =
            Pattern.compile("\\b[A-Z]{5}\\d{4}[A-Z]\\b");

    public boolean isRCDocument(String rawText) {
        return isRCDocument(rawText, null);
    }

    public boolean isRCDocument(String rawText, String registrationNumberParam) {

        if ((rawText == null || rawText.isBlank()) && (registrationNumberParam == null || registrationNumberParam.isBlank())) {
            return false;
        }

        String lower = rawText != null ? rawText.toLowerCase() : "";

        //-----------------------------------
        // Reject if it clearly belongs to another document type
        //-----------------------------------

        if (lower.contains("income tax department")
                || lower.contains("permanent account number")
                || lower.contains("income tax")
                || (rawText != null && PAN_NUMBER_PATTERN.matcher(rawText).find())) {
            return false;
        }

        if (lower.contains("passport")) {
            return false;
        }

        if (lower.contains("driving licence")
                || lower.contains("driving license")
                || lower.contains("dl no")) {
            return false;
        }

        if (lower.contains("election commission")
                || lower.contains("voter id")
                || lower.contains("elector")) {
            return false;
        }

        if ((lower.contains("aadhaar") || lower.contains("aadhar") || lower.contains("uidai"))
                && rawText != null && AADHAAR_NUMBER_PATTERN.matcher(rawText).find()
                && !lower.contains("registration")) {
            return false;
        }

        //-----------------------------------
        // Accept if it looks like an RC
        //-----------------------------------

        boolean hasRCKeyword =
                lower.contains("certificate of registration")
                        || lower.contains("registration certificate")
                        || lower.contains("motor vehicles act")
                        || lower.contains("form 23")
                        || lower.contains("regional transport")
                        || lower.contains("registering authority")
                        || lower.contains("transport department")
                        || lower.contains("transport")
                        || lower.contains("rto")
                        || lower.contains("chassis number")
                        || lower.contains("chassis")
                        || lower.contains("engine number")
                        || lower.contains("engine")
                        || lower.contains("regn. number")
                        || lower.contains("regn")
                        || lower.contains("regd. owner")
                        || lower.contains("regd owner")
                        || lower.contains("vehicle class")
                        || lower.contains("motor cycle")
                        || lower.contains("maker's class")
                        || lower.contains("makers class")
                        || lower.contains("fuel used")
                        || lower.contains("type of body")
                        || lower.contains("registration");

        boolean hasRegNumberPattern = rawText != null && REG_NUMBER_PATTERN.matcher(rawText).find();

        boolean matchesEnteredRegistration = false;
        if (registrationNumberParam != null && !registrationNumberParam.isBlank()) {
            String normEntered = registrationNumberParam.toUpperCase().replaceAll("[\\s-]", "");
            if (REG_NUMBER_PATTERN.matcher(normEntered).find()) {
                matchesEnteredRegistration = true;
            }
        }

        return hasRCKeyword || hasRegNumberPattern || matchesEnteredRegistration;
    }
}
