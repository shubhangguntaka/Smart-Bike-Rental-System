package com.sssit.bikerental.modules.auth.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.enums.OtpPurpose;
import com.sssit.bikerental.common.enums.Role;
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

import lombok.RequiredArgsConstructor;

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

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already registered.");
                }

                if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                        throw new RuntimeException("Phone number already registered.");
                }

                User user = User.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .email(request.getEmail())
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

                String otp = otpService.generateOtp();

                otpService.saveOtp(
                                user,
                                otp,
                                OtpPurpose.EMAIL_VERIFICATION);

                emailService.sendOtpEmail(
                                user.getEmail(),
                                user.getFirstName(),
                                otp);

                return AuthResponse.builder()
                                .userId(user.getId())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .email(user.getEmail())
                                .phoneNumber(user.getPhoneNumber())
                                .role(user.getRole())
                                .emailVerified(false)
                                .token(null)
                                .tokenType("Bearer")
                                .build();
        }
        // =====================================================
        // LOGIN
        // =====================================================

        @Override
        public AuthResponse login(LoginRequest request) {

                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

                if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                        throw new RuntimeException("Please verify your email before logging in.");
                }

                if (!Boolean.TRUE.equals(user.isEnabled())) {
                        throw new RuntimeException("Your account is disabled.");
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
                                .orElseThrow(() -> new RuntimeException("User not found."));

                boolean verified = otpService.verifyOtp(
                                user,
                                request.getOtp(),
                                request.getPurpose());

                if (!verified) {
                        throw new RuntimeException("Invalid or expired OTP.");
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
                                throw new RuntimeException("Unsupported OTP purpose.");
                }

        }
        // =====================================================
        // FORGOT PASSWORD
        // =====================================================

        @Override
        public String forgotPassword(ForgotPassword request) {

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found."));

                String otp = otpService.generateOtp();

                otpService.saveOtp(
                                user,
                                otp,
                                OtpPurpose.FORGOT_PASSWORD);

                emailService.sendOtpEmail(
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
                                .orElseThrow(() -> new RuntimeException("User not found."));

                boolean verified = otpService.verifyOtp(
                                user,
                                request.getOtp(),
                                OtpPurpose.FORGOT_PASSWORD);

                if (!verified) {
                        throw new RuntimeException("Invalid or expired OTP.");
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