package com.sssit.bikerental.modules.verification.drivinglicense.util;

import java.time.LocalDate;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.verification.drivinglicense.model.DLData;

@Component
public class DLValidator {

    // Indian DL format: 2-letter state code + 11 to 15 digits (total 13-17 chars)
    // E.g. TG00220240006700 (16 chars), TS0920210012345 (15 chars)
    private static final Pattern DL_PATTERN =
            Pattern.compile("^[A-Z]{2}[0-9A-Z]{11,16}$");

    public String validate(DLData data) {

        if (data == null)
            return "Unable to extract Driving License details.";

        if (isBlank(data.getLicenseNumber()))
            return "Could not identify a valid Driving License number from this document.";

        String cleanNum = com.sssit.bikerental.modules.verification.common.util.DocumentIdentifierUtil.normalizeDrivingLicenseNumber(data.getLicenseNumber());
        if (!com.sssit.bikerental.modules.verification.common.util.DocumentIdentifierUtil.isValidDrivingLicenseNumber(cleanNum))
            return "Could not identify a valid Driving License number from this document.";

        if (isBlank(data.getCustomerName())) {
            data.setCustomerName("Driving License Holder");
        }

        if (data.getDob() == null) {
            data.setDob(LocalDate.of(1995, 1, 1));
        }

        if (data.getValidTill() != null && data.getValidTill().isBefore(LocalDate.now()))
            return "Driving License has expired.";

        return "VALID";
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}