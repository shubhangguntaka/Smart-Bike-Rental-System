import env from "../config/env";

// ===============================
// API Configuration
// ===============================

export const API = {
  BASE_URL: env.API_BASE_URL,
  TIMEOUT: 10000,
};

// ===============================
// User Roles
// ===============================

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  OWNER: "OWNER",
  ADMIN: "ADMIN",
};

// ===============================
// Booking Status
// ===============================

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
};

// ===============================
// Payment Status
// ===============================

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

// ===============================
// Verification Status
// ===============================

export const VERIFICATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

// ===============================
// Bike Status
// ===============================

export const BIKE_STATUS = {
  AVAILABLE: "AVAILABLE",
  BOOKED: "BOOKED",
  MAINTENANCE: "MAINTENANCE",
  UNAVAILABLE: "UNAVAILABLE",
};

// ===============================
// Notification Types
// ===============================

export const NOTIFICATION_TYPES = {
  BOOKING: "BOOKING",
  PAYMENT: "PAYMENT",
  VERIFICATION: "VERIFICATION",
  REVIEW: "REVIEW",
  SYSTEM: "SYSTEM",
};

// ===============================
// Local Storage Keys
// ===============================

export const STORAGE_KEYS = {
  TOKEN: "bike_rental_token",
  REFRESH_TOKEN: "bike_rental_refresh_token",
  USER: "bike_rental_user",
  ROLE: "bike_rental_role",
  THEME: "bike_rental_theme",
};

// ===============================
// Pagination
// ===============================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

// ===============================
// Date Formats
// ===============================

export const DATE_FORMATS = {
  DATE: "DD/MM/YYYY",
  DATE_TIME: "DD/MM/YYYY HH:mm",
};

// ===============================
// File Upload
// ===============================

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,

  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ],

  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ],
};

// ===============================
// Bike Pricing
// ===============================

export const PRICING = {
  MIN_HOURLY_RATE: 50,
  MAX_HOURLY_RATE: 5000,
};

// ===============================
// Validation Regex
// ===============================

export const REGEX = {
  NAME: /^[A-Za-z ]{3,50}$/,

  EMAIL:
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,

  PHONE: /^[6-9]\d{9}$/,

  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{8,}$/,

  PINCODE: /^[1-9][0-9]{5}$/,

  VEHICLE_NUMBER:
    /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/,

  AADHAAR: /^[2-9]{1}[0-9]{11}$/,

  DRIVING_LICENSE:
    /^[A-Z]{2}[0-9]{13}$/,

  OTP: /^[0-9]{6}$/,
};

// ===============================
// Common Messages
// ===============================

export const MESSAGES = {
  NETWORK_ERROR: "Network error. Please try again.",
  SERVER_ERROR: "Something went wrong.",
  LOGIN_SUCCESS: "Login successful.",
  LOGOUT_SUCCESS: "Logged out successfully.",
  BOOKING_SUCCESS: "Bike booked successfully.",
  PAYMENT_SUCCESS: "Payment completed successfully.",
};