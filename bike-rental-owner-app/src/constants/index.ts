export const APP_NAME = "Bike Rental Owner";
export const APP_VERSION = "1.0.0";

export const STORAGE_KEYS = {
  AUTH_TOKEN: "bike_rental_owner_jwt_token",
  REFRESH_TOKEN: "bike_rental_owner_refresh_token",
  USER_DATA: "bike_rental_owner_user_data",
  THEME_MODE: "bike_rental_owner_theme_mode",
  SETTINGS: "bike_rental_owner_settings",
};

export const BIKE_CATEGORIES = [
  "COMMUTER",
  "CRUISER",
  "SPORTS",
  "ELECTRIC",
  "SCOOTER",
  "ADVENTURE",
  "TOURING",
];

export const FUEL_TYPES = [
  "PETROL",
  "ELECTRIC",
  "DIESEL",
  "HYBRID",
];

export const TRANSMISSION_TYPES = [
  "MANUAL",
  "AUTOMATIC",
];

export const BIKE_STATUS_OPTIONS = [
  { label: "Available", value: "AVAILABLE" },
  { label: "Booked", value: "BOOKED" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Inactive", value: "INACTIVE" },
];

export const BOOKING_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#FEF3C7", text: "#92400E" },
  CONFIRMED: { bg: "#DEF7EC", text: "#03543F" },
  APPROVED: { bg: "#DEF7EC", text: "#03543F" },
  CANCELLED: { bg: "#FDE8E8", text: "#9B1C1C" },
  COMPLETED: { bg: "#EDF2F7", text: "#2D3748" },
  IN_PROGRESS: { bg: "#E1EFFE", text: "#1E429F" },
  RENTED: { bg: "#E1EFFE", text: "#1E429F" },
};

export const PAYMENT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#FEF3C7", text: "#92400E" },
  PROCESSING: { bg: "#E1EFFE", text: "#1E429F" },
  SUCCESS: { bg: "#DEF7EC", text: "#03543F" },
  FAILED: { bg: "#FDE8E8", text: "#9B1C1C" },
  REFUNDED: { bg: "#F3E8FF", text: "#6B21A8" },
};
