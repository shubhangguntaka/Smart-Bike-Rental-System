// =========================
// Register
// =========================

export interface RegisterRequest {

    firstName: string;

    lastName: string;

    email: string;

    phoneNumber: string;

    password: string;

    role: string;

}

// =========================
// Login
// =========================

export interface LoginRequest {

    email: string;

    password: string;

}

// =========================
// Verify OTP
// =========================

export interface VerifyOtpRequest {

    email: string;

    otp: string;

    purpose: string;

}

// =========================
// Resend OTP
// =========================

export interface ResendOtpRequest {

    email: string;

    purpose?: string;

}

// =========================
// Forgot Password
// =========================

export interface ForgotPasswordRequest {

    email: string;

}

// =========================
// Reset Password
// =========================

export interface ResetPasswordRequest {

    email: string;

    otp: string;

    newPassword: string;

}

// =========================
// User
// =========================

export interface User {

    id?: number;

    firstName?: string;

    lastName?: string;

    email: string;

    role: string;

}

// =========================
// Login/Register Response
// =========================

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    userId: number;
    name: string;
    email: string;
    role: string;
}

// =========================
// Generic API Response
// =========================

export interface ApiResponse<T> {

    success?: boolean;

    message?: string;

    data: T;

}