package com.sssit.bikerental.modules.booking.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideTrackingDTO {
    private String status;
    private String pickupLocation;
    private String dropLocation;
    private String currentLocation;
    private String rideDuration;
    private String eta;
    private double latitude;
    private double longitude;
}
