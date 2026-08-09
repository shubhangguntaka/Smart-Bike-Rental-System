package com.sssit.bikerental.modules.booking.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @NotNull(message = "Bike ID is required")
    private Long bikeId;

    @NotNull(message = "Start time is required")
    private java.time.LocalDateTime startTime;

    @NotNull(message = "Return time is required")
    private java.time.LocalDateTime returnTime;

}
