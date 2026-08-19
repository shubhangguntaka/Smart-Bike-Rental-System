package com.sssit.bikerental.modules.auth.service.impl;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.sssit.bikerental.modules.auth.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
            log.warn("Email notification send skipped/failed: {}", e.getMessage());
        }
    }

    @Override
    public void sendAdminMessageEmail(String to, String name, String subject, String messageText) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject != null && !subject.isBlank() ? subject : "Bike Rental System - Document Verification Update");
            
            String body = """
                    Dear %s,

                    %s

                    Regards,
                    Smart Bike Rental Compliance & Verification Team
                    """.formatted(name != null ? name : "User", messageText);
            
            message.setText(body);
            mailSender.send(message);
            log.info("Admin verification email sent successfully to {}", to);
        } catch (Exception e) {
            log.warn("Admin verification email send skipped/failed for {}: {}", to, e.getMessage());
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