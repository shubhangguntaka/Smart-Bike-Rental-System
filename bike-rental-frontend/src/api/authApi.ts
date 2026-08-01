import api from "./axios";

import API_ENDPOINTS from "../constants/apiEndpoints";
import type { AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, VerifyOtpRequest } from "../types/auth";


export const authApi = {

    register: (data: RegisterRequest) =>

        api.post<AuthResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            data
        ),

    login: (data: LoginRequest) =>

        api.post<AuthResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            data
        ),

    verifyOtp: (data: VerifyOtpRequest) =>

        api.post(
            API_ENDPOINTS.AUTH.VERIFY_OTP,
            data
        ),

    forgotPassword: (data: ForgotPasswordRequest) =>

        api.post(
            API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
            data
        ),

    resetPassword: (data: ResetPasswordRequest) =>

        api.post(
            API_ENDPOINTS.AUTH.RESET_PASSWORD,
            data
        )

};

export default authApi;