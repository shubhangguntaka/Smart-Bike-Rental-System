package com.sssit.bikerental.common.constants;


/**
 * Application-wide constants used throughout the Bike Rental System.
 */
public final class Constants {

    // Private constructor to prevent instantiation
    private Constants() {
        throw new IllegalStateException("Utility class");
    }
    
    // ==========================
    // User Roles
    // ==========================
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_OWNER = "OWNER";
    public static final String ROLE_CUSTOMER = "CUSTOMER";

    // ==========================
    // Booking Status
    // ==========================
    public static final String BOOKING_PENDING = "PENDING";
    public static final String BOOKING_ACCEPTED = "ACCEPTED";
    public static final String BOOKING_REJECTED = "REJECTED";
    public static final String BOOKING_CANCELLED = "CANCELLED";
    public static final String BOOKING_COMPLETED = "COMPLETED";

    // ==========================
    // Payment Status
    // ==========================
    public static final String PAYMENT_PENDING = "PENDING";
    public static final String PAYMENT_SUCCESS = "SUCCESS";
    public static final String PAYMENT_FAILED = "FAILED";
    public static final String PAYMENT_REFUNDED = "REFUNDED";

    // ==========================
    // Verification Status
    // ==========================
    public static final String VERIFICATION_PENDING = "PENDING";
    public static final String VERIFICATION_APPROVED = "APPROVED";
    public static final String VERIFICATION_REJECTED = "REJECTED";

    // ==========================
    // Bike Status
    // ==========================
    public static final String BIKE_AVAILABLE = "AVAILABLE";
    public static final String BIKE_BOOKED = "BOOKED";
    public static final String BIKE_MAINTENANCE = "MAINTENANCE";
    public static final String BIKE_UNAVAILABLE = "UNAVAILABLE";

    // ==========================
    // OTP	
    // ==========================
    public static final int OTP_LENGTH = 6;
    public static final int OTP_EXPIRY_MINUTES = 10;

    // ==========================
    // File Upload
    // ==========================
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public static final String[] ALLOWED_IMAGE_TYPES = {
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
    };

    public static final String[] ALLOWED_DOCUMENT_TYPES = {
            "application/pdf",
            "image/jpeg",
            "image/png"
    };

    // ==========================
    // API Messages
    // ==========================
    public static final String SUCCESS = "Success";
    public static final String FAILED = "Failed";
    public static final String NOT_FOUND = "Resource not found";
    public static final String INVALID_REQUEST = "Invalid request";
    public static final String UNAUTHORIZED = "Unauthorized access";
}
