import userApi, {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "../api/userApi";
import { UploadFileParam } from "../api/verificationApi";
import { User } from "../types/auth";

export const userService = {
  getProfile: async (): Promise<User> => {
    const res = await userApi.getProfile();
    return (res.data as any)?.data ?? res.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const res = await userApi.updateProfile(data);
    return (res.data as any)?.data ?? res.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await userApi.changePassword(data);
  },

  uploadProfileImage: async (file: UploadFileParam): Promise<User> => {
    const res = await userApi.uploadProfileImage(file);
    return (res.data as any)?.data ?? res.data;
  },

  deleteMyAccount: async (): Promise<void> => {
    await userApi.deleteMyAccount();
  },
};

export default userService;
