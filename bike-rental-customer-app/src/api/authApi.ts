import api from "./axios";
import {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
} from "../types/auth";

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse> | AuthResponse>("/auth/register", data),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse> | AuthResponse>("/auth/login", data),

  verifyOtp: (data: VerifyOtpRequest) =>
    api.post<ApiResponse<string> | string>("/auth/verify-otp", data),

  resendOtp: (data: ResendOtpRequest) =>
    api.post<ApiResponse<string> | string>("/auth/resend-otp", data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse<string> | string>("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<string> | string>("/auth/reset-password", data),

  refreshToken: (data: RefreshTokenRequest) =>
    api.post<ApiResponse<RefreshTokenResponse> | RefreshTokenResponse>("/auth/refresh-token", data),

  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refreshToken }),
};

export default authApi;
