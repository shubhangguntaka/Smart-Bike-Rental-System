package com.sssit.bikerental.common.util;

import com.sssit.bikerental.common.constants.Constants;

import java.security.SecureRandom;

public final class OTPGenerator {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private OTPGenerator() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Generates a numeric OTP.
     *
     * @return Generated OTP as String
     */
    public static String generateOTP() {

        StringBuilder otp = new StringBuilder(Constants.OTP_LENGTH);

        for (int i = 0; i < Constants.OTP_LENGTH; i++) {
            otp.append(SECURE_RANDOM.nextInt(10));
        }

        return otp.toString();
    }
}