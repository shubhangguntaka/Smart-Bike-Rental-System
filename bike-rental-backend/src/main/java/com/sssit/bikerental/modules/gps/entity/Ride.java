package com.sssit.bikerental.modules.gps.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long bookingId;

    private Long bikeId;

    private Long customerId;

    @Enumerated(EnumType.STRING)
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
