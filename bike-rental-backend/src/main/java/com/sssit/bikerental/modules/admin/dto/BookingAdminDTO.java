package com.sssit.bikerental.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingAdminDTO {

    private Long bookingId;

    private Long customerId;
    private String customerName;

    private Long ownerId;
    private String ownerName;

    private Long bikeId;
    private String bikeName;

    private String bookingStatus;

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;

    private LocalDateTime actualPickupTime;
    private LocalDateTime actualReturnTime;

    private BigDecimal totalAmount;
}