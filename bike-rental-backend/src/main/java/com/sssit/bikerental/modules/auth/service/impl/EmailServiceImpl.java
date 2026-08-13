package com.sssit.bikerental.modules.auth.service.impl;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.sssit.bikerental.modules.auth.service.EmailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String to, String name, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Bike Rental System - OTP Verification");
            message.setText(buildOtpMessage(name, otp));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email notification send skipped/failed: " + e.getMessage());
        }
    }

    /**
     * Builds the email body.
     */
    private String buildOtpMessage(String name, String otp) {

        return """
                Dear %s,

                Welcome to Smart Bike Rental System.

                Your One-Time Password (OTP) is:

                %s

                This OTP will expire in 10 minutes.

                If you did not request this OTP, please ignore this email.

                Regards,
                Smart Bike Rental Team
                """.formatted(name, otp);
    }
}