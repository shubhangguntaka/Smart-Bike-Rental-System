package com.sssit.bikerental.modules.bike.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.enums.RentalType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BikeDTO {

    private Long bikeId;

    private Long ownerId;

    private OwnerInfo owner;

    private Double rating;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OwnerInfo {
        private Long ownerId;
        private String ownerName;
    }
    private String ownerName;

    @NotBlank(message = "Bike name is required")
    @Size(max = 120)
    private String bikeName;

    @NotBlank(message = "Brand is required")
    @Size(max = 80)
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(max = 80)
    private String model;

    @NotBlank(message = "Registration number is required")
    @Size(max = 32)
    private String registrationNumber;

    @NotBlank(message = "Fuel type is required")
    @Size(max = 40)
    private String fuelType;

    private BigDecimal rentalPrice;

    @NotBlank(message = "Location is required")
    @Size(max = 120)
    private String location;

    private BikeStatus bikeStatus;

    @NotBlank(message = "RC Number is required")
    @Size(max = 32)
    private String rcNumber;

    /** Internal / primary RC verification flag */
    private Boolean rcVerified;

    /**
     * Spec alias for rcVerified — same value, exposed for API consumers
     * that expect {@code rcVerificationStatus}.
     */
    @JsonProperty("rcVerificationStatus")
    public Boolean getRcVerificationStatus() {
        return rcVerified;
    }

    @JsonProperty("rcVerificationStatus")
    public void setRcVerificationStatus(Boolean rcVerificationStatus) {
        this.rcVerified = rcVerificationStatus;
    }

    private String imageUrl;

    private java.util.List<String> imageUrls;

    @Size(max = 1000)
    private String description;

    @Size(max = 40)
    private String engineCapacity;

    @Size(max = 40)
    private String mileage;

    @Size(max = 40)
    private String transmission;

    private Integer seatingCapacity;

    private Double latitude;

    private Double longitude;

    private RentalType rentalType;

    private BigDecimal hourlyRate;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime availableStartTime;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime availableEndTime;

    @com.fasterxml.jackson.annotation.JsonProperty("availableStartTime")
    public void setAvailableStartTimeJson(Object val) {
        if (val == null) {
            this.availableStartTime = null;
            return;
        }
        if (val instanceof LocalTime lt) {
            this.availableStartTime = lt;
            return;
        }
        String str = val.toString().trim();
        if (str.isEmpty()) {
            this.availableStartTime = null;
            return;
        }
        try {
            String clean = str.toUpperCase();
            if (clean.contains("AM") || clean.contains("PM")) {
                boolean isPM = clean.contains("PM");
                clean = clean.replace("AM", "").replace("PM", "").trim();
                String[] parts = clean.split(":");
                int h = Integer.parseInt(parts[0]);
                int m = Integer.parseInt(parts[1]);
                if (isPM && h < 12) h += 12;
                if (!isPM && h == 12) h = 0;
                this.availableStartTime = LocalTime.of(h, m);
                return;
            }
            if (clean.length() == 5) {
                clean = clean + ":00";
            }
            this.availableStartTime = LocalTime.parse(clean);
        } catch (Exception e) {
            this.availableStartTime = LocalTime.of(9, 0);
        }
    }

    @com.fasterxml.jackson.annotation.JsonProperty("availableEndTime")
    public void setAvailableEndTimeJson(Object val) {
        if (val == null) {
            this.availableEndTime = null;
            return;
        }
        if (val instanceof LocalTime lt) {
            this.availableEndTime = lt;
            return;
        }
        String str = val.toString().trim();
        if (str.isEmpty()) {
            this.availableEndTime = null;
            return;
        }
        try {
            String clean = str.toUpperCase();
            if (clean.contains("AM") || clean.contains("PM")) {
                boolean isPM = clean.contains("PM");
                clean = clean.replace("AM", "").replace("PM", "").trim();
                String[] parts = clean.split(":");
                int h = Integer.parseInt(parts[0]);
                int m = Integer.parseInt(parts[1]);
                if (isPM && h < 12) h += 12;
                if (!isPM && h == 12) h = 0;
                this.availableEndTime = LocalTime.of(h, m);
                return;
            }
            if (clean.length() == 5) {
                clean = clean + ":00";
            }
            this.availableEndTime = LocalTime.parse(clean);
        } catch (Exception e) {
            this.availableEndTime = LocalTime.of(21, 0);
        }
    }
}
