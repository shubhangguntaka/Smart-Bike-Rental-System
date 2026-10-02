export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "CUSTOMER";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose: string;
}

export interface ResendOtpRequest {
  email: string;
  purpose?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
}

export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email: string;
  role: string;
  phoneNumber?: string;
  profileImage?: string;
  enabled?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}
