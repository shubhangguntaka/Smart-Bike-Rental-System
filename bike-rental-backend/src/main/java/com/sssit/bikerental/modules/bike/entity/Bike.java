package com.sssit.bikerental.modules.bike.entity;

import com.sssit.bikerental.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bikes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bike extends BaseEntity {

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String status; // "AVAILABLE", "BOOKED", "MAINTENANCE"

    @Column(nullable = false)
    private BigDecimal pricePerHour;
}
