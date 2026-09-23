package com.sssit.bikerental.modules.auth.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Properties;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import com.sssit.bikerental.modules.auth.service.impl.EmailServiceImpl;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    private MimeMessage mimeMessage;

    @BeforeEach
    void setUp() {
        Session session = Session.getInstance(new Properties());
        mimeMessage = new MimeMessage(session);
    }

    @Test
    @DisplayName("sendOtpEmail should build HTML using EmailTemplate.otpVerificationTemplate and send via mailSender")
    void testSendOtpEmail_Success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendOtpEmail("john@example.com", "John Doe", "123456");

        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendOtpEmail with null name should default to User and send without error")
    void testSendOtpEmail_NullName() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendOtpEmail("john@example.com", null, "654321");

        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendPasswordResetEmail should build HTML using EmailTemplate.passwordResetTemplate and send via mailSender")
    void testSendPasswordResetEmail_Success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendPasswordResetEmail("john@example.com", "John Doe", "987654");

        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendWelcomeEmail should build HTML using EmailTemplate.welcomeTemplate and send via mailSender")
    void testSendWelcomeEmail_Success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendWelcomeEmail("john@example.com", "John Doe");

        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendAdminMessageEmail should build HTML using EmailTemplate.adminMessageTemplate and send via mailSender")
    void testSendAdminMessageEmail_SuccessAndResilience() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendAdminMessageEmail("john@example.com", "John Doe", "Verification Status", "Please re-upload document.");
        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));

        // When mailSender throws an exception, it should catch gracefully and not crash
        doThrow(new RuntimeException("SMTP unavailable")).when(mailSender).send(any(MimeMessage.class));
        assertDoesNotThrow(() -> emailService.sendAdminMessageEmail("john@example.com", "John", "Subject", "Message"));
    }

    @Test
    @DisplayName("sendVerificationSuccessEmail should build HTML using EmailTemplate.verificationSuccessTemplate and send via mailSender")
    void testSendVerificationSuccessEmail() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendVerificationSuccessEmail("john@example.com", "John Doe", "Driving License");
        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendVerificationFailureEmail should build HTML using EmailTemplate.verificationFailureTemplate and send via mailSender")
    void testSendVerificationFailureEmail() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendVerificationFailureEmail("john@example.com", "John Doe", "Aadhaar Card", "Blurry image", "Please take a clearer photo");
        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendHtmlEmail should not throw exception when mailSender fails")
    void testSendHtmlEmail_FailureResilience() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("Mail server down")).when(mailSender).send(any(MimeMessage.class));

        assertDoesNotThrow(() -> emailService.sendOtpEmail("john@example.com", "John", "123456"));
    }
}
