package com.sssit.bikerental.modules.auth.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.enums.OtpPurpose;
import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.exception.ConflictException;
import com.sssit.bikerental.common.exception.RefreshTokenException;
import com.sssit.bikerental.modules.auth.dto.AuthResponse;
import com.sssit.bikerental.modules.auth.dto.ForgotPassword;
import com.sssit.bikerental.modules.auth.dto.LoginRequest;
import com.sssit.bikerental.modules.auth.dto.LogoutRequest;
import com.sssit.bikerental.modules.auth.dto.LogoutResponse;
import com.sssit.bikerental.modules.auth.dto.RefreshTokenRequest;
import com.sssit.bikerental.modules.auth.dto.RefreshTokenResponse;
import com.sssit.bikerental.modules.auth.dto.RegisterRequest;
import com.sssit.bikerental.modules.auth.dto.ResetPasswordRequest;
import com.sssit.bikerental.modules.auth.dto.VerifyOtpRequest;
import com.sssit.bikerental.modules.auth.entity.RefreshToken;
import com.sssit.bikerental.modules.auth.service.AuthService;
import com.sssit.bikerental.modules.auth.service.EmailService;
import com.sssit.bikerental.modules.auth.service.OtpService;
import com.sssit.bikerental.modules.auth.service.RefreshTokenService;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.security.jwt.JwtService;

import com.sssit.bikerental.common.exception.ResourceNotFoundException;
import com.sssit.bikerental.common.exception.UnauthorizedException;
import com.sssit.bikerental.common.exception.ValidationException;
import com.sssit.bikerental.common.exception.ConflictException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;

        private final PasswordEncoder passwordEncoder;

        private final AuthenticationManager authenticationManager;

        private final JwtService jwtService;

        private final EmailService emailService;

        private final OtpService otpService;

        private final RefreshTokenService refreshTokenService;

        // =====================================================
        // REGISTER
        // =====================================================

        @Override
        public AuthResponse register(RegisterRequest request) {

                String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

                if (userRepository.existsByEmail(email) || userRepository.existsByEmail(request.getEmail())) {
                        throw new ConflictException("Email already registered.");
                }

                if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                        throw new ConflictException("Phone number already registered.");
                }

                User user = User.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .email(email)
                                .phoneNumber(request.getPhoneNumber())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole() == null ? Role.CUSTOMER : request.getRole())
                                .emailVerified(true)
                                .phoneVerified(true)
                                .enabled(true)
                                .accountNonExpired(true)
                                .accountNonLocked(true)
                                .credentialsNonExpired(true)
                                .build();

                user = userRepository.save(user);

                try {
                        String otp = otpService.generateOtp();
                        otpService.saveOtp(user, otp, OtpPurpose.EMAIL_VERIFICATION);
                        emailService.sendOtpEmail(user.getEmail(), user.getFirstName(), otp);
                        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
                } catch (Exception ex) {
                        log.warn("Registration/Welcome email sending skipped for user {}: {}", user.getId(), ex.getMessage());
                }

                String accessToken = jwtService.generateToken(user);
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

                return AuthResponse.builder()
                                .userId(user.getId())
                                .name(user.getFirstName() + " " + user.getLastName())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .email(user.getEmail())
                                .phoneNumber(user.getPhoneNumber())
                                .role(user.getRole())
                                .emailVerified(true)
                                .token(accessToken)
                                .accessToken(accessToken)
                                .refreshToken(refreshToken.getToken())
                                .tokenType("Bearer")
                                .build();
        }

        // =====================================================
        // LOGIN
        // =====================================================

        @Override
        public AuthResponse login(LoginRequest request) {

                String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
                String rawEmail = request.getEmail() != null ? request.getEmail().trim() : "";

                User user = userRepository.findByEmail(cleanEmail)
                                .orElseGet(() -> userRepository.findByEmail(rawEmail)
                                                .orElseThrow(() -> new UnauthorizedException("Invalid email or password.")));

                try {
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        user.getEmail(),
                                                        request.getPassword()));
                } catch (Exception ex) {
                        throw new UnauthorizedException("Invalid email or password.");
                }

                if (!Boolean.TRUE.equals(user.getEmailVerified()) || !Boolean.TRUE.equals(user.isEnabled())) {
                        user.setEmailVerified(true);
                        user.setEnabled(true);
                        userRepository.save(user);
                }

                String accessToken = jwtService.generateToken(user);
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

                return AuthResponse.builder()
                                .token(accessToken)
                                .accessToken(accessToken)
                                .refreshToken(refreshToken.getToken())
                                .tokenType("Bearer")
                                .userId(user.getId())
                                .name(user.getFirstName() + " " + user.getLastName())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .phoneNumber(user.getPhoneNumber())
                                .emailVerified(user.getEmailVerified())
                                .build();
        }

        // =====================================================
        // VERIFY OTP
        // =====================================================

        @Override
        public String verifyOtp(VerifyOtpRequest request) {

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

                boolean verified = otpService.verifyOtp(
                                user,
                                request.getOtp(),
                                request.getPurpose());

                if (!verified) {
                        throw new ValidationException("Invalid or expired OTP.");
                }

                switch (request.getPurpose()) {

                        case EMAIL_VERIFICATION -> {

                                user.setEmailVerified(true);
                                user.setEnabled(true);

                                userRepository.save(user);

                                return "Email verified successfully.";
                        }

                        case PHONE_VERIFICATION -> {

                                user.setPhoneVerified(true);

                                userRepository.save(user);

                                return "Phone number verified successfully.";
                        }

                        case FORGOT_PASSWORD -> {

                                return "OTP verified successfully.";
                        }

                        default ->
                                throw new ValidationException("Unsupported OTP purpose.");
                }

        }
        // =====================================================
        // FORGOT PASSWORD
        // =====================================================

        @Override
        public String forgotPassword(ForgotPassword request) {

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

                String otp = otpService.generateOtp();

                otpService.saveOtp(
                                user,
                                otp,
                                OtpPurpose.FORGOT_PASSWORD);

                emailService.sendPasswordResetEmail(
                                user.getEmail(),
                                user.getFirstName(),
                                otp);

                return "OTP has been sent to your registered email.";
        }

        // =====================================================
        // RESET PASSWORD
        // =====================================================

        @Override
        public String resetPassword(ResetPasswordRequest request) {

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

                boolean verified = otpService.verifyOtp(
                                user,
                                request.getOtp(),
                                OtpPurpose.FORGOT_PASSWORD);

                if (!verified) {
                        throw new ValidationException("Invalid or expired OTP.");
                }

                user.setPassword(
                                passwordEncoder.encode(request.getNewPassword()));

                userRepository.save(user);

                return "Password reset successfully.";
        }

        // =====================================================
        // REFRESH TOKEN
        // =====================================================

        @Override
        public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {

                RefreshToken refreshToken = refreshTokenService
                                .findByToken(request.getRefreshToken())
                                .orElseThrow(() -> new RefreshTokenException(
                                                "Invalid refresh token"));

                refreshTokenService.verifyExpiration(refreshToken);

                if (Boolean.TRUE.equals(refreshToken.getRevoked())) {
                        throw new RefreshTokenException(
                                        "Refresh token has been revoked");
                }

                String accessToken = jwtService.generateToken(refreshToken.getUser());

                return RefreshTokenResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken.getToken())
                                .tokenType("Bearer")
                                .build();
        }

        @Override
        public LogoutResponse logout(LogoutRequest request) {

                RefreshToken refreshToken = refreshTokenService
                                .findByToken(request.getRefreshToken())
                                .orElseThrow(() -> new RefreshTokenException("Invalid refresh token"));

                refreshTokenService.deleteToken(refreshToken.getToken());

                return LogoutResponse.builder()
                                .success(true)
                                .message("Logged out successfully")
                                .build();

        }

}