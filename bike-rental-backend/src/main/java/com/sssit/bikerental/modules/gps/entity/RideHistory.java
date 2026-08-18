package com.sssit.bikerental.modules.gps.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ride_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RideHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long rideId;

    private Long bookingId;

    private Long bikeId;

    private Long customerId;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    private Double startLatitude;

    private Double startLongitude;

    private Double endLatitude;

    private Double endLongitude;

    private Double totalDistance;

    private Long totalDuration;

    private LocalDateTime completedAt;
}