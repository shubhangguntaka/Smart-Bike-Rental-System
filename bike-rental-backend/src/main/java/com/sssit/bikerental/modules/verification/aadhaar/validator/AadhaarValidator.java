package com.sssit.bikerental.modules.verification.aadhaar.validator;

import org.springframework.stereotype.Component;

@Component
public class AadhaarValidator {

    public boolean validate(String enteredNumber,
                            String ocrNumber,
                            String qrNumber) {

        if (enteredNumber == null)
            return false;

        if (ocrNumber == null)
            return false;

        if (qrNumber == null)
            return false;

        return enteredNumber.equals(ocrNumber)
                && enteredNumber.equals(qrNumber);

    }

}