import api from "./axios";
import { User } from "../types/auth";
import { UploadFileParam } from "./verificationApi";

export interface UpdateProfileRequest {
  fullName: string;
  email?: string;
  phoneNumber: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

export const userApi = {
  getProfile: () => api.get<User>("/users/profile"),

  updateProfile: (data: UpdateProfileRequest) =>
    api.put<User>("/users/profile", data),

  changePassword: (data: ChangePasswordRequest) =>
    api.put("/users/change-password", data),

  uploadProfileImage: (file: UploadFileParam) => {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type || "image/jpeg",
    } as any);

    return api.post<User>("/users/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteMyAccount: () => api.delete("/users/me"),
};

export default userApi;
