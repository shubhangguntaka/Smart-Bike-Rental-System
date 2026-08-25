package com.sssit.bikerental.modules.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.enums.PaymentStatus;

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
public class BookingResponse {

    private Long bookingId;

    private Long bikeId;

    private Long customerId;

    private String bookingReference;

    private LocalDateTime startTime;

    private LocalDateTime returnTime;

    private String bikeName;

    private String bikeImage;

    private String customerName;

    private String registrationNumber;

    private Long ownerId;

    private String ownerName;

    private LocalDateTime actualPickupTime;

    private LocalDateTime actualReturnTime;

    private Integer totalDays;

    private BigDecimal totalAmount; // Kept for frontend compatibility

    private BigDecimal rentalAmount; // Added as requested

    private BookingStatus bookingStatus;

    private PaymentStatus paymentStatus;

    private String qrCode;

    private Double latitude;

    private Double longitude;

    private String location;

    private LocalDateTime bookingDate; // Kept for frontend compatibility

    private LocalDateTime createdAt; // Added as requested
}
