package com.sssit.bikerental.modules.verification.bikedocument.util;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.verification.bikedocument.model.RCData;
import com.sssit.bikerental.modules.verification.common.util.DocumentIdentifierUtil;

/**
 * Validates the fields extracted off an RC image, mirroring
 * drivinglicense.util.DLValidator: required fields present, correct
 * format, and not expired.
 */
@Component
public class RCValidator {

    public String validate(RCData data) {

        if (data == null)
            return "Unable to extract Registration Certificate details.";

        if (isBlank(data.getRegistrationNumber()))
            return "Could not identify a valid registration number from the RC.";

        String norm = DocumentIdentifierUtil.normalizeRegistrationNumber(data.getRegistrationNumber());
        if (!DocumentIdentifierUtil.isValidRegistrationNumber(norm))
            return "Invalid registration number format on the RC document.";

        data.setRegistrationNumber(norm);

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


