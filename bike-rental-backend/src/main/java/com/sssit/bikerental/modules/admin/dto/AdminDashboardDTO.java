package com.sssit.bikerental.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {

    private long totalUsers;
    private long totalOwners;
    private long totalBikes;
    private long totalBookings;
    private long totalPayments;

    private long activeUsers;
    private long activeBikes;
    private long activeBookings;

    private long pendingBookings;
    private long completedBookings;
    private long cancelledBookings;
}