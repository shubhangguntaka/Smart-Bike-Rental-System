package com.sssit.bikerental.modules.verification.common.util;

import java.util.regex.Pattern;

/**
 * Centralized utility for extracting, normalizing, validating, and masking
 * document-specific identifiers:
 * 1. Bike Registration Number / RC Number (AA 00 AA 0000)
 * 2. Driving License Number (AA + 14 digits)
 * 3. Aadhaar Number (12 digits)
 */
public final class DocumentIdentifierUtil {

    // RC Registration Number Patterns
    // Primary project format: AA 00 AA 0000 (State + 2 RTO digits + 2 series letters + 4 vehicle digits)
    private static final Pattern RC_PROJECT_EXACT_PATTERN =
            Pattern.compile("^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$");

    // Standard Indian Vehicle Registration Pattern: State (2 letters) + RTO (1-2 digits) + Series (1-3 letters) + Number (1-4 digits)
    private static final Pattern RC_STANDARD_INDIAN_PATTERN =
            Pattern.compile("^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$");

    // Bharat (BH) Series Pattern: e.g. 22BH1234AA
    private static final Pattern RC_BHARAT_SERIES_PATTERN =
            Pattern.compile("^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$");

    // Driving License Pattern: 2-character State Code + 14 digits = 16 characters
    private static final Pattern DL_EXACT_PATTERN =
            Pattern.compile("^[A-Z]{2}[0-9]{14}$");

    // Flexible DL Pattern for regional format variations (11 to 15 digits following state code)
    private static final Pattern DL_FLEXIBLE_PATTERN =
            Pattern.compile("^[A-Z]{2}[0-9]{11,15}$");

    // Aadhaar Pattern: 12 numeric digits (Aadhaar numbers standardly begin with 2-9)
    private static final Pattern AADHAAR_NORMALIZED_PATTERN =
            Pattern.compile("^[2-9][0-9]{11}$");

    // Permissive 12-digit pattern if leading digit variation occurs in older documentation
    private static final Pattern AADHAAR_12_DIGIT_PATTERN =
            Pattern.compile("^[0-9]{12}$");

    private DocumentIdentifierUtil() {
        // Utility class
    }

    // =========================================================================
    // RC / Bike Registration Number Methods
    // =========================================================================

    /**
     * Normalizes a vehicle registration number by uppercasing and stripping
     * spaces, hyphens, dots, slashes, and harmless separators.
     *
     * Example: "TS 09 AB 1234" -> "TS09AB1234"
     *          "ts-09-ab-1234" -> "TS09AB1234"
     */
    public static String normalizeRegistrationNumber(String raw) {
        if (raw == null) return null;
        return raw.replaceAll("[^A-Za-z0-9]", "").toUpperCase().trim();
    }

    /**
     * Checks if the normalized string matches the exact project standard:
     * AA00AA0000 (State Code + 2-digit RTO + 2 letters + 4-digit number).
     */
    public static boolean isExactProjectRcFormat(String normalized) {
        if (normalized == null || normalized.length() != 10) return false;
        if (!RC_PROJECT_EXACT_PATTERN.matcher(normalized).matches()) return false;
        String state = normalized.substring(0, 2);
        return IndianStateCodeUtil.isValidStateCode(state);
    }

    /**
     * Checks if the normalized string is a valid Indian registration number,
     * checking recognized state code or Bharat Series.
     * Rejects postal PIN-based sequences (like AR505001 or any trailing 6-digit numbers)
     * and strings without series letters.
     */
    public static boolean isValidRegistrationNumber(String normalized) {
        if (normalized == null || normalized.length() < 7 || normalized.length() > 11) {
            return false;
        }

        // Exclude 17-character chassis numbers, engine numbers, or obvious non-reg strings
        if (normalized.startsWith("CHASSIS") || normalized.startsWith("ENGINE") || normalized.startsWith("VIN")) {
            return false;
        }

        // Reject postal PIN patterns or strings with 6 or more consecutive digits (e.g. AR505001, 505001)
        if (normalized.matches(".*[0-9]{5,}.*")) {
            return false;
        }

        // Bharat Series check
        if (RC_BHARAT_SERIES_PATTERN.matcher(normalized).matches()) {
            return true;
        }

        // Exact Project Format
        if (isExactProjectRcFormat(normalized)) {
            return true;
        }

        // State code check
        String state = normalized.substring(0, 2);
        if (!IndianStateCodeUtil.isValidStateCode(state)) {
            return false;
        }

        return RC_STANDARD_INDIAN_PATTERN.matcher(normalized).matches();
    }

    /**
     * Compares two registration numbers after normalization.
     *
     * @param regA First registration number
     * @param regB Second registration number
     * @return true if both normalize to the exact same string
     */
    public static boolean registrationNumbersMatch(String regA, String regB) {
        if (regA == null || regB == null) return false;
        String normA = normalizeRegistrationNumber(regA);
        String normB = normalizeRegistrationNumber(regB);
        return !normA.isEmpty() && normA.equals(normB);
    }

    /**
     * Masks registration number for safe logging / display.
     * Example: "TS09AB1234" -> "TS09**1234"
     */
    public static String maskRegistrationNumber(String reg) {
        if (reg == null) return null;
        String clean = normalizeRegistrationNumber(reg);
        if (clean.length() <= 4) return clean;
        if (clean.length() == 10) {
            return clean.substring(0, 4) + "**" + clean.substring(6);
        }
        int half = clean.length() / 2;
        return clean.substring(0, 2) + "****" + clean.substring(Math.min(clean.length(), half + 2));
    }

    // =========================================================================
    // Driving License Number Methods
    // =========================================================================

    /**
     * Normalizes a Driving License number by uppercasing and stripping
     * all non-alphanumeric characters (spaces, hyphens, slashes, etc.).
     *
     * Example: "TG002 2024 0006700" -> "TG00220240006700"
     *          "TG-00220240006700"  -> "TG00220240006700"
     */
    public static String normalizeDrivingLicenseNumber(String raw) {
        if (raw == null) return null;
        return raw.replaceAll("[^A-Za-z0-9]", "").toUpperCase().trim();
    }

    /**
     * Checks if the normalized string matches the exact project standard:
     * AA + 14 digits (Total 16 characters).
     */
    public static boolean isExactDlFormat(String normalized) {
        if (normalized == null) return false;
        String clean = normalizeDrivingLicenseNumber(normalized);
        if (clean.length() != 16) return false;
        String state = clean.substring(0, 2);
        return IndianStateCodeUtil.isValidStateCode(state) && DL_EXACT_PATTERN.matcher(clean).matches();
    }

    /**
     * Validates whether a normalized string is a valid Driving License number
     * matching the project structure: AA + 14 digits (Total 16 characters).
     */
    public static boolean isValidDrivingLicenseNumber(String normalized) {
        if (normalized == null) return false;
        String clean = normalizeDrivingLicenseNumber(normalized);

        // Standard project format: 2 state letters + 14 digits = 16 chars
        if (clean.length() == 16) {
            String state = clean.substring(0, 2);
            return IndianStateCodeUtil.isValidStateCode(state) && DL_EXACT_PATTERN.matcher(clean).matches();
        }

        // Tolerant fallback for 13-17 chars if digits are valid
        if (clean.length() >= 13 && clean.length() <= 17) {
            String state = clean.substring(0, 2);
            return IndianStateCodeUtil.isValidStateCode(state) && DL_FLEXIBLE_PATTERN.matcher(clean).matches();
        }

        return false;
    }

    /**
     * Masks Driving License number for safe logging / display.
     * Example: "TG00220240006700" -> "TG********6700"
     */
    public static String maskDrivingLicenseNumber(String dl) {
        if (dl == null) return null;
        String clean = normalizeDrivingLicenseNumber(dl);
        if (clean.length() < 6) return clean;
        return clean.substring(0, 2) + "********" + clean.substring(clean.length() - 4);
    }

    // =========================================================================
    // Aadhaar Number Methods
    // =========================================================================

    /**
     * Normalizes an Aadhaar number by removing spaces, hyphens, and punctuation.
     *
     * Example: "1234 5678 9012" -> "123456789012"
     */
    public static String normalizeAadhaarNumber(String raw) {
        if (raw == null) return null;
        return raw.replaceAll("[^0-9]", "").trim();
    }

    /**
     * Validates whether a normalized string is a valid 12-digit Aadhaar number.
     */
    public static boolean isValidAadhaarNumber(String normalized) {
        if (normalized == null) return false;
        String clean = normalizeAadhaarNumber(normalized);
        if (clean.length() != 12) return false;
        return AADHAAR_NORMALIZED_PATTERN.matcher(clean).matches()
                || AADHAAR_12_DIGIT_PATTERN.matcher(clean).matches();
    }

    /**
     * Masks Aadhaar number for safe logging / display.
     * Example: "123456789012" -> "********9012"
     */
    public static String maskAadhaarNumber(String aadhaar) {
        if (aadhaar == null) return null;
        String clean = normalizeAadhaarNumber(aadhaar);
        if (clean.length() < 4) return clean;
        if (clean.length() == 12) {
            return "********" + clean.substring(8);
        }
        return "********" + clean.substring(clean.length() - 4);
    }
}
