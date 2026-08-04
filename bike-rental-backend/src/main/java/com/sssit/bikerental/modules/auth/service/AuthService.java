package com.sssit.bikerental.modules.auth.service;

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

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    String verifyOtp(VerifyOtpRequest request);

    String forgotPassword(ForgotPassword request);

    String resetPassword(ResetPasswordRequest request);

    RefreshTokenResponse refreshToken(RefreshTokenRequest request);

    LogoutResponse logout(LogoutRequest request);

}