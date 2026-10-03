import api from "./axios";
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from "../types/auth";

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<User>>("/auth/register", { ...data, role: "OWNER" }),

  verifyOtp: (data: VerifyOtpRequest) =>
    api.post<ApiResponse<string>>("/auth/verify-otp", data),

  resendOtp: (email: string) =>
    api.post<ApiResponse<string>>(`/auth/resend-otp?email=${encodeURIComponent(email)}`),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse<string>>("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<string>>("/auth/reset-password", data),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>("/auth/refresh-token", { refreshToken }),

  logout: (refreshToken?: string) =>
    api.post<ApiResponse<void>>("/auth/logout", { refreshToken }),
};

export default authApi;
