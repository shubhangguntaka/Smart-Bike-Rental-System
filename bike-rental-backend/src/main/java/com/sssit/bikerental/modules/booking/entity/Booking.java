package com.sssit.bikerental.modules.booking.entity;

import com.sssit.bikerental.common.entity.BaseEntity;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.enums.PaymentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "bookings",
        indexes = {
                @Index(name = "idx_bookings_customer_id", columnList = "customerId"),
                @Index(name = "idx_bookings_bike_id", columnList = "bikeId"),
                @Index(name = "idx_bookings_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {

    @Column(nullable = false)
    private Long bikeId;

    @Column(nullable = false)
    private Long customerId;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "return_time")
    private LocalDateTime returnTime;

    @Column(name = "pickup_date")
    private LocalDateTime pickupDate;

    @Column(name = "return_date")
    private LocalDateTime returnDate;

    @Column(nullable = false)
    private BigDecimal rentalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus bookingStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "qr_code", length = 1000)
    private String qrCode;

    @jakarta.persistence.PrePersist
    @jakarta.persistence.PreUpdate
    public void syncDates() {
        if (startTime != null && pickupDate == null) {
            pickupDate = startTime;
        }
        if (pickupDate != null && startTime == null) {
            startTime = pickupDate;
        }
        if (returnTime != null && returnDate == null) {
            returnDate = returnTime;
        }
        if (returnDate != null && returnTime == null) {
            returnTime = returnDate;
        }
    }

    // Backward-compatible wrapper getter
    public String getStatus() {
        return bookingStatus != null ? bookingStatus.name() : null;
    }

    // Backward-compatible wrapper setter
    public void setStatus(String statusStr) {
        if (statusStr != null) {
            try {
                this.bookingStatus = BookingStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                if ("APPROVED".equalsIgnoreCase(statusStr)) {
                    this.bookingStatus = BookingStatus.APPROVED;
                } else if ("REJECTED".equalsIgnoreCase(statusStr)) {
                    this.bookingStatus = BookingStatus.REJECTED;
                } else {
                    this.bookingStatus = BookingStatus.PENDING;
                }
            }
        } else {
            this.bookingStatus = null;
        }
    }
}
