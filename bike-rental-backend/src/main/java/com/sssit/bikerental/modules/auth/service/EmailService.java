package com.sssit.bikerental.modules.auth.service;

public interface EmailService {

    void sendOtpEmail(
            String to,
            String name,
            String otp
    );

    void sendPasswordResetEmail(
            String to,
            String name,
            String otp
    );

    void sendWelcomeEmail(
            String to,
            String name
    );

    void sendAdminMessageEmail(
            String to,
            String name,
            String subject,
            String message
    );

    void sendVerificationSuccessEmail(
            String to,
            String name,
            String documentName
    );

    void sendVerificationFailureEmail(
            String to,
            String name,
            String documentName,
            String failureReason,
            String suggestion
    );

    void sendAccountDeletedEmail(
            String to,
            String name
    );
}