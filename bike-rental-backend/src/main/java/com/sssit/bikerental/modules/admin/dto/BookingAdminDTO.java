package com.sssit.bikerental.modules.admin.dto;

import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.enums.PaymentStatus;
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

    private String registrationNumber;

    private BookingStatus bookingStatus;

    private PaymentStatus paymentStatus;

    private LocalDateTime startTime;

    private LocalDateTime returnTime;

    private LocalDateTime actualPickupTime;

    private LocalDateTime actualReturnTime;

    private BigDecimal rentalAmount;

    private BigDecimal totalAmount;

    private String bookingReference;

    private LocalDateTime createdAt;
}