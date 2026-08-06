package com.sssit.bikerental.modules.bike.enums;

/**
 * Lifecycle / availability status of a listed bike.
 */
public enum BikeStatus {
    AVAILABLE,
    BOOKED,
    UNDER_MAINTENANCE,
    NOT_AVAILABLE;

    public static BikeStatus from(String value) {
        if (value == null || value.isBlank()) {
            return AVAILABLE;
        }
        String normalized = value.trim().toUpperCase().replace(' ', '_');
        if ("MAINTENANCE".equals(normalized)) {
            return UNDER_MAINTENANCE;
        }
        try {
            return BikeStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            return AVAILABLE;
        }
    }
}
