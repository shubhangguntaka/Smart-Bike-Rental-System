package com.sssit.bikerental.modules.gps.dto;

import java.time.LocalDateTime;

import com.sssit.bikerental.modules.gps.entity.RideStatus;

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

    private Long bookingId;

    private Long bikeId;

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