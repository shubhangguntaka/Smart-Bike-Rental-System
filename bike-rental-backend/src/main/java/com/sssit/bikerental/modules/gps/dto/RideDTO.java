package com.sssit.bikerental.modules.gps.dto;

import java.time.LocalDateTime;

import com.sssit.bikerental.modules.gps.entity.RideStatus;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RideDTO {

    private Long rideId;

   @NotNull(message = "Booking ID is required")
private Long bookingId;

@NotNull(message = "Bike ID is required")
private Long bikeId;

@NotNull(message = "Customer ID is required")
private Long customerId;

    private RideStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    private Double startLatitude;

    private Double startLongitude;

    private Double endLatitude;

    private Double endLongitude;

    private Double totalDistance;

    private Long totalDuration;
}