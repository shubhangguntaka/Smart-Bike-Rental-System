package com.sssit.bikerental.modules.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.sssit.bikerental.common.response.ApiResponse;
import com.sssit.bikerental.modules.auth.dto.AuthResponse;
import com.sssit.bikerental.modules.auth.dto.ForgotPassword;
import com.sssit.bikerental.modules.auth.dto.LoginRequest;
import com.sssit.bikerental.modules.auth.dto.LogoutRequest;
import com.sssit.bikerental.modules.auth.dto.LogoutResponse;
import com.sssit.bikerental.modules.auth.dto.RefreshTokenRequest;
import com.sssit.bikerental.modules.auth.dto.RefreshTokenResponse;
import com.sssit.bikerental.modules.auth.dto.RegisterRequest;
import com.sssit.bikerental.modules.auth.dto.ResendOtpRequest;
import com.sssit.bikerental.modules.auth.dto.ResetPasswordRequest;
import com.sssit.bikerental.modules.auth.dto.VerifyOtpRequest;
import com.sssit.bikerental.modules.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

        private final AuthService authService;

        /**
         * Register User
         */
        @PostMapping("/register")
        public ResponseEntity<ApiResponse<AuthResponse>> register(
                        @Valid @RequestBody RegisterRequest request) {

                AuthResponse response = authService.register(request);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                "Registration successful. OTP sent successfully.",
                                                response));
        }

        /**
         * Login
         */
        @PostMapping("/login")
        public ResponseEntity<ApiResponse<AuthResponse>> login(
                        @Valid @RequestBody LoginRequest request) {

                AuthResponse response = authService.login(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Login successful.",
                                                response));
        }

        /**
         * Verify OTP
         */
        @PostMapping("/verify-otp")
        public ResponseEntity<ApiResponse<String>> verifyOtp(
                        @Valid @RequestBody VerifyOtpRequest request) {

                String response = authService.verifyOtp(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                response,
                                                null));
        }

        /**
         * Resend OTP
         */
        @PostMapping("/resend-otp")
        public ResponseEntity<ApiResponse<String>> resendOtp(
                        @Valid @RequestBody ResendOtpRequest request) {

                String response = authService.resendOtp(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                response,
                                                null));
        }

        /**
         * Forgot Password
         */
        @PostMapping("/forgot-password")
        public ResponseEntity<ApiResponse<String>> forgotPassword(
                        @Valid @RequestBody ForgotPassword request) {

                String response = authService.forgotPassword(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                response,
                                                null));
        }

        /**
         * Reset Password
         */
        @PostMapping("/reset-password")
        public ResponseEntity<ApiResponse<String>> resetPassword(
                        @Valid @RequestBody ResetPasswordRequest request) {

                String response = authService.resetPassword(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                response,
                                                null));
        }

        /**
         * Refresh Token
         */
        @PostMapping("/refresh-token")
        public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(
                        @Valid @RequestBody RefreshTokenRequest request) {

                RefreshTokenResponse response = authService.refreshToken(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Token refreshed successfully.",
                                                response));
        }

        @PostMapping("/logout")
        public ResponseEntity<LogoutResponse> logout(

                        @Valid @RequestBody LogoutRequest request

        ) {

                return ResponseEntity.ok(

                                authService.logout(request)

                );

        }

}