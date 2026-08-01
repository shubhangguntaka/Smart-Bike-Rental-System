package com.sssit.bikerental.modules.auth.service;

import com.sssit.bikerental.common.enums.OtpPurpose;
import com.sssit.bikerental.modules.user.User;

public interface OtpService {

    String generateOtp();

    void saveOtp(
            User user,
            String otp,
            OtpPurpose purpose
    );

    boolean verifyOtp(
            User user,
            String otp,
            OtpPurpose purpose
    );

}