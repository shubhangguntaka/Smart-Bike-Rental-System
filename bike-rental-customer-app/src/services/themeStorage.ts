import * as SecureStore from "expo-secure-store";

export type ThemeMode = "light" | "dark" | "system";

const THEME_KEY = "bike_rental_customer_theme_mode";
const SETTINGS_KEY = "bike_rental_customer_app_settings";

export interface AppCustomerSettings {
  // Rental & Ride Defaults
  preferredHelmetOption: "single" | "dual" | "none";
  preferredBikeCategory: "all" | "sports" | "scooter" | "ev" | "cruiser";
  preferredCity: string;
  autoInstantBooking: boolean;
  maxSpeedWarningAlert: number; // km/h
  lowBatteryThreshold: number; // %

  // Payments & Billing
  defaultPaymentMethod: "upi" | "card" | "wallet" | "netbanking";
  savedUpiId: string;
  autoDebitOvertime: boolean;
  emailInvoicesOnCompletion: boolean;
  requireGstInvoice: boolean;
  gstin: string;

  // Notifications & Alerts
  smsRideAlerts: boolean;
  emailDailyDigest: boolean;
  whatsappAlerts: boolean;
  promoAlerts: boolean;
  soundAlertsEnabled: boolean;
  emergencyContactSms: boolean;

  // Display & UI Appearance
  timezone: string;
  currency: string;
  timeFormat: "12h" | "24h";
  compactTables: boolean;

  // Security & Privacy
  liveGpsSharingEnabled: boolean;
  shareTripWithEmergencyContact: boolean;
  twoFactorEnabled: boolean;
}

export const DEFAULT_APP_SETTINGS: AppCustomerSettings = {
  preferredHelmetOption: "single",
  preferredBikeCategory: "all",
  preferredCity: "Hyderabad",
  autoInstantBooking: true,
  maxSpeedWarningAlert: 80,
  lowBatteryThreshold: 20,

  defaultPaymentMethod: "upi",
  savedUpiId: "",
  autoDebitOvertime: true,
  emailInvoicesOnCompletion: true,
  requireGstInvoice: false,
  gstin: "",

  smsRideAlerts: true,
  emailDailyDigest: true,
  whatsappAlerts: true,
  promoAlerts: false,
  soundAlertsEnabled: true,
  emergencyContactSms: true,

  timezone: "Asia/Kolkata",
  currency: "INR",
  timeFormat: "12h",
  compactTables: false,

  liveGpsSharingEnabled: true,
  shareTripWithEmergencyContact: true,
  twoFactorEnabled: true,
};

export const themeStorage = {
  async getThemeMode(): Promise<ThemeMode> {
    try {
      const saved = await SecureStore.getItemAsync(THEME_KEY);
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved as ThemeMode;
      }
    } catch {
      // ignore
    }
    return "system";
  },

  async setThemeMode(mode: ThemeMode): Promise<void> {
    try {
      await SecureStore.setItemAsync(THEME_KEY, mode);
    } catch {
      // ignore
    }
  },

  async getSettings(): Promise<AppCustomerSettings> {
    try {
      const saved = await SecureStore.getItemAsync(SETTINGS_KEY);
      if (saved) {
        return {
          ...DEFAULT_APP_SETTINGS,
          ...JSON.parse(saved),
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_APP_SETTINGS;
  },

  async saveSettings(settings: AppCustomerSettings): Promise<void> {
    try {
      await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  },

  async resetSettings(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SETTINGS_KEY);
    } catch {
      // ignore
    }
  },
};

export default themeStorage;
