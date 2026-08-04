package com.sssit.bikerental.modules.verification.aadhaar.validator;

import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

/**
 * Decides whether the OCR text extracted from an uploaded image
 * actually looks like an Aadhaar card, or some other document
 * (PAN card, Passport, Driving Licence, Voter ID, etc.).
 *
 * This runs BEFORE any name/number matching, so users get a clear
 * "please upload your Aadhaar card" message instead of a confusing
 * "Aadhaar Number Mismatch" when they upload the wrong document.
 */
@Component
public class DocumentTypeValidator {

    // A 12 digit Aadhaar number, grouped as 4-4-4
    private static final Pattern AADHAAR_NUMBER_PATTERN =
            Pattern.compile("\\b\\d{4}\\s?\\d{4}\\s?\\d{4}\\b");

    // A PAN number, e.g. ABCDE1234F
    private static final Pattern PAN_NUMBER_PATTERN =
            Pattern.compile("\\b[A-Z]{5}\\d{4}[A-Z]\\b");

    public boolean isAadhaarDocument(String rawText) {

        if (rawText == null || rawText.isBlank()) {
            return false;
        }

        String lower = rawText.toLowerCase();

        //-----------------------------------
        // Reject if it clearly belongs to
        // another document type
        //-----------------------------------

        if (lower.contains("income tax department")
                || lower.contains("permanent account number")
                || lower.contains("income tax")
                || PAN_NUMBER_PATTERN.matcher(rawText).find()) {
            return false;
        }

        if (lower.contains("passport")) {
            return false;
        }

        if (lower.contains("driving licence")
                || lower.contains("driving license")
                || lower.contains("transport department")
                || lower.contains("dl no")) {
            return false;
        }

        if (lower.contains("election commission")
                || lower.contains("voter id")
                || lower.contains("elector")) {
            return false;
        }

        //-----------------------------------
        // Accept if it looks like Aadhaar
        //-----------------------------------

        boolean hasAadhaarKeyword =
                lower.contains("aadhaar")
                        || lower.contains("aadhar")
                        || lower.contains("uidai")
                        || lower.contains("unique identification");

        boolean hasAadhaarNumberPattern =
                AADHAAR_NUMBER_PATTERN.matcher(rawText).find();

        return hasAadhaarKeyword || hasAadhaarNumberPattern;
    }
}
