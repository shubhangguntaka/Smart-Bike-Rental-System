import api from "../api/axios";
import type { LoginRequest, RegisterRequest } from "../types/auth";


export const register = (data:RegisterRequest)=>{

    return api.post("/auth/register",data);

}

export const login=(data:LoginRequest)=>{

    return api.post("/auth/login",data);

}

export const verifyOtp=(data:any)=>{

    return api.post("/auth/verify-otp",data);

}

export const forgotPassword=(data:any)=>{

    return api.post("/auth/forgot-password",data);

}

export const resetPassword=(data:any)=>{

    return api.post("/auth/reset-password",data);

}

export const logout=()=>{

    return api.post("/auth/logout");

}