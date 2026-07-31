package com.sssit.bikerental.Test;

import com.sssit.bikerental.common.util.EmailTemplate;
import com.sssit.bikerental.common.util.OTPGenerator;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MailTestController {

    private final JavaMailSender mailSender;

    @GetMapping("/mail-test")
    public String sendOtpMail(@RequestParam String email) throws Exception {

        String otp = OTPGenerator.generateOTP();

        String html = EmailTemplate.otpVerificationTemplate(
                "Test User",
                otp
        );

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(email);
        helper.setSubject("Bike Rental System - OTP Verification");
        helper.setText(html, true);

        mailSender.send(message);

        return "OTP sent successfully to " + email + ". Generated OTP: " + otp;
    }
}