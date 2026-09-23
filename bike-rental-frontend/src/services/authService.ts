import api from "../api/axios";
import type {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types/auth";
import { storage } from "../utils/storage";

export const register = (data: RegisterRequest) => {
  return api.post("/auth/register", data);
};

export const login = (data: LoginRequest) => {
  return api.post("/auth/login", data);
};

export const verifyOtp = (data: VerifyOtpRequest) => {
  return api.post("/auth/verify-otp", data);
};

export const resendOtp = (data: ResendOtpRequest) => {
  return api.post("/auth/resend-otp", data);
};

export const forgotPassword = (data: ForgotPasswordRequest) => {
  return api.post("/auth/forgot-password", data);
};

export const resetPassword = (data: ResetPasswordRequest) => {
  return api.post("/auth/reset-password", data);
};

export const logout = (refreshToken?: string) => {
  const token = refreshToken || storage.getRefreshToken() || "";
  return api.post("/auth/logout", { refreshToken: token });
};