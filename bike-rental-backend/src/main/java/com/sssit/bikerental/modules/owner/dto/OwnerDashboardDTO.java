package com.sssit.bikerental.modules.owner.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerDashboardDTO {

    private Long ownerId;

    private String ownerName;

    private Integer totalBikes;

    private Integer availableBikes;

    private Integer bookedBikes;

    private Integer pendingBookings;

    private Integer completedBookings;

    private Integer totalBookings;

    private BigDecimal todayEarnings;

    private BigDecimal weeklyEarnings;

    private BigDecimal monthlyEarnings;

    private BigDecimal totalEarnings;

    private BigDecimal pendingPayments;

    private Boolean aadhaarVerified;

    private Boolean rcVerified;

    private String aadhaarStatus;

    private String rcStatus;

}