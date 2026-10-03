import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { STORAGE_KEYS } from "../constants";

export type ThemeMode = "light" | "dark" | "system";

const isWeb = Platform.OS === "web";

export const themeStorage = {
  async getThemeMode(): Promise<ThemeMode> {
    try {
      if (isWeb) {
        const val = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
        return (val as ThemeMode) || "system";
      }
      const val = await SecureStore.getItemAsync(STORAGE_KEYS.THEME_MODE);
      return (val as ThemeMode) || "system";
    } catch {
      return "system";
    }
  },

  async setThemeMode(mode: ThemeMode): Promise<void> {
    try {
      if (isWeb) {
        localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
        return;
      }
      await SecureStore.setItemAsync(STORAGE_KEYS.THEME_MODE, mode);
    } catch (err) {
      console.warn("Error saving theme mode:", err);
    }
  },
};

export default themeStorage;
