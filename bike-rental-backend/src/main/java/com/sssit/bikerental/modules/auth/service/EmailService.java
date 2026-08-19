package com.sssit.bikerental.modules.auth.service;

public interface EmailService {

    void sendOtpEmail(
            String to,
            String name,
            String otp
    );

    void sendAdminMessageEmail(
            String to,
            String name,
            String subject,
            String message
    );
}