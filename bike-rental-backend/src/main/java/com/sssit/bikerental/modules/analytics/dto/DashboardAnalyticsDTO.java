package com.sssit.bikerental.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardAnalyticsDTO {

    // Users
    private long totalUsers;
    private long totalCustomers;
    private long totalOwners;

    // Bikes
    private long totalBikes;
    private long availableBikes;
    private long bookedBikes;
    private long maintenanceBikes;
    private long notAvailableBikes;

    // Bookings
    private long totalBookings;
    private long pendingBookings;
    private long approvedBookings;
    private long confirmedBookings;
    private long activeBookings;
    private long completedBookings;
    private long cancelledBookings;
    private long rejectedBookings;

    // Payments / Revenue
    private BigDecimal totalRevenue;
    private long successfulPayments;
    private long failedPayments;

    // Rides
    private long totalRides;
    private long activeRides;
    private long completedRides;

    // Bike utilization
    private double bikeUtilizationPercentage;

    // Timestamp for the generated dashboard snapshot
    private LocalDateTime generatedAt;
}