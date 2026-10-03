import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { STORAGE_KEYS } from "../constants";

const isWeb = Platform.OS === "web";

export const tokenService = {
  async saveToken(token: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  },

  async saveRefreshToken(refreshToken: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  async getRefreshToken(): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async removeToken(): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      return;
    }
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

export default tokenService;
