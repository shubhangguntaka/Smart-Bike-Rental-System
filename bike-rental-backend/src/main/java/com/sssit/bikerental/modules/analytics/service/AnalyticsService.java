package com.sssit.bikerental.modules.analytics.service;

import com.sssit.bikerental.modules.analytics.dto.DashboardAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.dto.RevenueAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.dto.RideAnalyticsDTO;

import java.time.LocalDate;
import java.util.Map;

public interface AnalyticsService {

    DashboardAnalyticsDTO getDashboardAnalytics();

    RevenueAnalyticsDTO getRevenueAnalytics(
            LocalDate from,
            LocalDate to
    );

    Map<String, Long> getBookingAnalytics(
            LocalDate from,
            LocalDate to
    );

    Map<String, Long> getUserAnalytics(
            LocalDate from,
            LocalDate to
    );

    Map<String, Long> getBikeAnalytics(
            LocalDate from,
            LocalDate to
    );

    RideAnalyticsDTO getRideAnalytics(
            LocalDate from,
            LocalDate to
    );
}