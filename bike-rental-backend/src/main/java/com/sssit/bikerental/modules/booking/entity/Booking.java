package com.sssit.bikerental.modules.booking.entity;

import com.sssit.bikerental.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
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

    @Column(nullable = false)
    private LocalDateTime pickupDate;

    @Column(nullable = false)
    private LocalDateTime returnDate;

    @Column(nullable = false)
    private BigDecimal rentalAmount;

    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED", "COMPLETED"
}
