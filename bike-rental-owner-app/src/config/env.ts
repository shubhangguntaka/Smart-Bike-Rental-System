import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Smart Bike Rental Owner API Configuration
 * Supports:
 * 1. process.env.EXPO_PUBLIC_API_URL
 * 2. Constants.expoConfig.extra.apiUrl
 * 3. Dynamic Expo Go host debugger IP (LAN development)
 * 4. Android Emulator: http://10.0.2.2:8888/api
 * 5. iOS Simulator / Web / Default: http://localhost:8888/api
 */
export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, "");
  }

  const manifest = Constants.expoConfig || (Constants as any).manifest;
  const debuggerHost = manifest?.hostUri || manifest?.debuggerHost;
  if (debuggerHost && typeof debuggerHost === "string") {
    const hostIp = debuggerHost.split(":")[0];
    if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
      return `http://${hostIp}:8888/api`;
    }
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8888/api";
  }

  return "http://localhost:8888/api";
}

export const API_BASE_URL = getApiBaseUrl();

export default {
  API_BASE_URL,
  getApiBaseUrl,
};
