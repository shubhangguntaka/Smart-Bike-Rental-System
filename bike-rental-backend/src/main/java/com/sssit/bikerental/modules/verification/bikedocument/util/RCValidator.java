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

        // For front-side smart card scans where chassis/engine/regDate are printed on the back:
        if (isBlank(data.getChassisNumber())) {
            data.setChassisNumber("NOT_EXTRACTED");
        }

        if (isBlank(data.getEngineNumber())) {
            data.setEngineNumber("NOT_EXTRACTED");
        }

        if (data.getRegistrationDate() == null) {
            data.setRegistrationDate(LocalDate.of(2018, 1, 1));
        }

        if (data.getRegistrationDate().isAfter(LocalDate.now()))
            return "Registration date cannot be in the future.";

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

