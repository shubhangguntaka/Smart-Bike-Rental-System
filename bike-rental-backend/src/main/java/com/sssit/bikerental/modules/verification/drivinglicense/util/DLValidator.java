package com.sssit.bikerental.modules.verification.drivinglicense.util;

import java.time.LocalDate;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.verification.drivinglicense.model.DLData;

@Component
public class DLValidator {

    // Examples:
    // TS0920210012345      (2-digit RTO code, 7-digit serial - 15 chars)
    // TS00520220007694     (3-digit RTO code, 7-digit serial - 16 chars)
    private static final Pattern DL_PATTERN =
            Pattern.compile("^[A-Z]{2}[0-9]{2,3}[0-9]{4}[0-9]{6,7}$");

    public String validate(DLData data) {

        if (data == null)
            return "Unable to extract Driving License details.";

        if (isBlank(data.getCustomerName()))
            return "Customer name not found.";

        if (isBlank(data.getLicenseNumber()))
            return "Driving License number not found.";

        if (!DL_PATTERN.matcher(data.getLicenseNumber()).matches())
            return "Invalid Driving License number.";

        if (data.getDob() == null)
            return "Date of Birth not found.";

        if (data.getIssueDate() == null)
            return "Issue Date not found.";

        if (data.getValidTill() == null)
            return "Validity Date not found.";

        if (data.getValidTill().isBefore(LocalDate.now()))
            return "Driving License has expired.";

        return "VALID";
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}