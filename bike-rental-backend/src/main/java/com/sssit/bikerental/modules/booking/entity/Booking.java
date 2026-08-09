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

    // Backward-compatible wrapper getter
    public String getStatus() {
        return bookingStatus != null ? bookingStatus.name() : null;
    }

    // Backward-compatible wrapper setter
    public void setStatus(String statusStr) {
        if (statusStr != null) {
            try {
                this.bookingStatus = BookingStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                // Fallback mapping for status strings used in other modules
                if ("APPROVED".equals(statusStr)) {
                    this.bookingStatus = BookingStatus.CONFIRMED;
                } else if ("REJECTED".equals(statusStr)) {
                    this.bookingStatus = BookingStatus.CANCELLED;
                } else {
                    throw e;
                }
            }
        } else {
            this.bookingStatus = null;
        }
    }
}
