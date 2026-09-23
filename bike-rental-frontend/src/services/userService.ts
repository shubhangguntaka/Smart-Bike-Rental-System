import api from "../api/axios";

export interface UpdateProfileRequest {
    fullName: string;
    email?: string;
    phoneNumber: string;
}

export interface ChangePasswordRequest {
    oldPassword?: string;
    newPassword?: string;
}

export const getProfile = () => {
    return api.get("/users/profile");
};

export const updateProfile = (data: UpdateProfileRequest) => {
    return api.put("/users/profile", data);
};

export const changePassword = (data: ChangePasswordRequest) => {
    return api.put("/users/change-password", data);
};

export const uploadProfileImage = (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/users/profile-image", fd, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const deleteMyAccount = () => {
    return api.delete("/users/me");
};
