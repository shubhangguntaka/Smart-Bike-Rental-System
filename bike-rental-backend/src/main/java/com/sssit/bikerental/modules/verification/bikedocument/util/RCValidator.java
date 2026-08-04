package com.sssit.bikerental.modules.verification.bikedocument.util;

import java.time.LocalDate;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.verification.bikedocument.model.RCData;

/**
 * Validates the fields extracted off an RC image, mirroring
 * drivinglicense.util.DLValidator: required fields present, correct
 * format, and not expired.
 */
@Component
public class RCValidator {

    private static final Pattern REG_NUMBER_PATTERN =
            Pattern.compile("^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$");

    public String validate(RCData data) {

        if (data == null)
            return "Unable to extract Registration Certificate details.";

        if (isBlank(data.getOwnerName()))
            return "Owner name not found.";

        if (isBlank(data.getRegistrationNumber()))
            return "Registration number not found.";

        if (!REG_NUMBER_PATTERN.matcher(data.getRegistrationNumber()).matches())
            return "Invalid registration number format.";

        if (isBlank(data.getChassisNumber()))
            return "Chassis number not found.";

        if (isBlank(data.getEngineNumber()))
            return "Engine number not found.";

        if (data.getRegistrationDate() == null)
            return "Registration date not found.";

        if (data.getRegistrationDate().isAfter(LocalDate.now()))
            return "Registration date cannot be in the future.";

        // Insurance/PUCC are optional fields on some RC scans (older
        // cards, partial crops) - only enforced when actually
        // extracted, same "don't hard-fail on a field OCR simply
        // couldn't read" philosophy as DLValidator applies to
        // issue/validity dates. When present, though, an expired one
        // is a real reason to reject: this platform can't legally
        // list an uninsured/unfit bike for rent.
        if (data.getInsuranceValidUpto() != null
                && data.getInsuranceValidUpto().isBefore(LocalDate.now())) {
            return RCConstants.ERROR_INSURANCE_EXPIRED;
        }

        if (data.getPuccValidUpto() != null
                && data.getPuccValidUpto().isBefore(LocalDate.now())) {
            return RCConstants.ERROR_PUCC_EXPIRED;
        }

        return "VALID";
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
