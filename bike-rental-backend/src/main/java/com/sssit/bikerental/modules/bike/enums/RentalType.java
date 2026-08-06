package com.sssit.bikerental.modules.bike.enums;

public enum RentalType {
    DAILY,
    HOURLY,
    BOTH;

    public static RentalType from(String value) {
        if (value == null || value.isBlank()) {
            return DAILY;
        }
        for (RentalType type : RentalType.values()) {
            if (type.name().equalsIgnoreCase(value.trim())) {
                return type;
            }
        }
        return DAILY;
    }
}
