export interface User {
  id: number;
  name?: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  role: "OWNER" | "ADMIN" | "CUSTOMER" | string;
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  isVerified?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  statusCode?: number;
  timestamp?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: User;
  role?: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  role?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}
