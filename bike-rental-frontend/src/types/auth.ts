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

    token: string;

    tokenType: string;

    userId: number;

    firstName: string;

    lastName: string;

    email: string;

    role: string;

    emailVerified: boolean;

}

// =========================
// Generic API Response
// =========================

export interface ApiResponse<T> {

    success?: boolean;

    message?: string;

    data: T;

}