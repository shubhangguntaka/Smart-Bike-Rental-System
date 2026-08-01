package com.sssit.bikerental.modules.auth.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.enums.OtpPurpose;
import com.sssit.bikerental.modules.auth.entity.OtpVerification;
import com.sssit.bikerental.modules.auth.repository.OtpRepository;
import com.sssit.bikerental.modules.auth.service.OtpService;
import com.sssit.bikerental.modules.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OtpServiceImpl implements OtpService {

    private final OtpRepository otpRepository;

    private static final int OTP_EXPIRY_MINUTES = 10;

    @Override
    public String generateOtp() {

        Random random = new Random();

        int otp = 100000 + random.nextInt(900000);

        return String.valueOf(otp);
    }

    @Override
    public void saveOtp(User user, String otp, OtpPurpose purpose) {

        otpRepository.deleteByUserAndPurpose(user, purpose);

        OtpVerification otpVerification = OtpVerification.builder()
                .user(user)
                .otp(otp)
                .purpose(purpose)
                .expiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .verified(false)
                .build();

        otpRepository.save(otpVerification);

    }

    @Override
    public boolean verifyOtp(User user,
                             String otp,
                             OtpPurpose purpose) {

        Optional<OtpVerification> optionalOtp =
                otpRepository.findByUserAndOtpAndPurpose(
                        user,
                        otp,
                        purpose
                );

        if (optionalOtp.isEmpty()) {
            return false;
        }

        OtpVerification otpVerification = optionalOtp.get();

        if (otpVerification.getVerified()) {
            return false;
        }

        if (otpVerification.getExpiryTime().isBefore(LocalDateTime.now())) {
            return false;
        }

        otpVerification.setVerified(true);

        otpRepository.save(otpVerification);

        return true;
    }

}