package com.sssit.bikerental.modules.gps.dto;

import java.time.LocalDateTime;

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
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private Double accuracy;
}