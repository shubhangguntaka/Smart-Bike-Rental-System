package com.sssit.bikerental.modules.auth.service.impl;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.sssit.bikerental.common.util.EmailTemplate;
import com.sssit.bikerental.modules.auth.service.EmailService;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String to, String name, String otp) {
        String recipientName = (name != null && !name.isBlank()) ? name : "User";
        String html = EmailTemplate.otpVerificationTemplate(recipientName, otp);
        sendHtmlEmail(to, "Bike Rental System - OTP Verification", html);
    }

    @Override
    public void sendPasswordResetEmail(String to, String name, String otp) {
        String recipientName = (name != null && !name.isBlank()) ? name : "User";
        String html = EmailTemplate.passwordResetTemplate(recipientName, otp);
        sendHtmlEmail(to, "Bike Rental System - Password Reset Request", html);
    }

    @Override
    public void sendWelcomeEmail(String to, String name) {
        String recipientName = (name != null && !name.isBlank()) ? name : "User";
        String html = EmailTemplate.welcomeTemplate(recipientName);
        sendHtmlEmail(to, "Welcome to Bike Rental System 🚲", html);
    }

    @Override
    public void sendAdminMessageEmail(String to, String name, String subject, String messageText) {
        String recipientName = (name != null && !name.isBlank()) ? name : "User";
        String emailSubject = (subject != null && !subject.isBlank()) ? subject : "Bike Rental System - Document Verification Update";
        String html = EmailTemplate.adminMessageTemplate(recipientName, emailSubject, messageText);
        sendHtmlEmail(to, emailSubject, html);
    }

    @Override
    public void sendVerificationSuccessEmail(String to, String name, String documentName) {
        String recipientName = (name != null && !name.isBlank()) ? name : "User";
        String html = EmailTemplate.verificationSuccessTemplate(recipientName, documentName);
        sendHtmlEmail(to, "Document Verification Passed - Smart Bike Rental", html);
    }

    @Override
    public void sendVerificationFailureEmail(String to, String name, String documentName, String failureReason, String suggestion) {
        String recipientName = (name != null && !name.isBlank()) ? name : "User";
        String reason = (failureReason != null && !failureReason.isBlank()) ? failureReason : "Information mismatch or unreadable document";
        String tips = (suggestion != null && !suggestion.isBlank()) ? suggestion : "Please upload a clear and current image.";
        String html = EmailTemplate.verificationFailureTemplate(recipientName, documentName, reason, tips);
        sendHtmlEmail(to, "Document Verification Failed - Smart Bike Rental", html);
    }

    @Override
    public void sendAccountDeletedEmail(String to, String name) {
        String recipientName = (name != null && !name.isBlank()) ? name : "User";
        String html = EmailTemplate.accountDeletedTemplate(recipientName);
        sendHtmlEmail(to, "Smart Bike Rental - Account Deleted Confirmation", html);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("HTML email [{}] successfully sent to {}", subject, to);
        } catch (Exception e) {
            log.warn("Email notification send skipped/failed for {}: {}", to, e.getMessage());
        }
    }
}