package com.sssit.bikerental.modules.gps.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GPSLocationDTO {

    private Long rideId;

    @NotNull(message = "Latitude is required")
    @DecimalMin(
            value = "-90.0",
            message = "Latitude must be between -90 and 90"
    )
    @DecimalMax(
            value = "90.0",
            message = "Latitude must be between -90 and 90"
    )
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(
            value = "-180.0",
            message = "Longitude must be between -180 and 180"
    )
    @DecimalMax(
            value = "180.0",
            message = "Longitude must be between -180 and 180"
    )
    private Double longitude;

    @NotNull(message = "Timestamp is required")
    private LocalDateTime timestamp;

    @PositiveOrZero(message = "Accuracy cannot be negative")
    private Double accuracy;
}