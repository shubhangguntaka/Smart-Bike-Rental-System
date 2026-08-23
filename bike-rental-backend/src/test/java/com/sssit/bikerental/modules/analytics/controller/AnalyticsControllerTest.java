package com.sssit.bikerental.modules.analytics.controller;

import com.sssit.bikerental.modules.analytics.dto.DashboardAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.dto.RevenueAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.dto.RideAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.service.AnalyticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsControllerTest {

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private AnalyticsController analyticsController;

    private LocalDate from;
    private LocalDate to;

    @BeforeEach
    void setUp() {
        from = LocalDate.of(2026, 8, 1);
        to = LocalDate.of(2026, 8, 23);
    }

    @Test
    @DisplayName("GET /api/analytics/dashboard: Returns 200 OK with DashboardAnalyticsDTO")
    void testGetDashboardAnalytics() {
        DashboardAnalyticsDTO expectedDto = DashboardAnalyticsDTO.builder()
                .totalUsers(50)
                .totalBikes(20)
                .totalBookings(30)
                .totalRevenue(new BigDecimal("15000.00"))
                .build();

        when(analyticsService.getDashboardAnalytics()).thenReturn(expectedDto);

        ResponseEntity<DashboardAnalyticsDTO> response = analyticsController.getDashboardAnalytics();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(expectedDto, response.getBody());
    }

    @Test
    @DisplayName("GET /api/analytics/revenue: Returns 200 OK with RevenueAnalyticsDTO")
    void testGetRevenueAnalytics() {
        RevenueAnalyticsDTO expectedDto = RevenueAnalyticsDTO.builder()
                .totalRevenue(new BigDecimal("8500.00"))
                .successfulPaymentCount(10)
                .build();

        when(analyticsService.getRevenueAnalytics(eq(from), eq(to))).thenReturn(expectedDto);

        ResponseEntity<RevenueAnalyticsDTO> response = analyticsController.getRevenueAnalytics(from, to);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(expectedDto, response.getBody());
    }

    @Test
    @DisplayName("GET /api/analytics/bookings: Returns 200 OK with Map of status counts")
    void testGetBookingAnalytics() {
        Map<String, Long> expected = Collections.singletonMap("COMPLETED", 12L);
        when(analyticsService.getBookingAnalytics(eq(from), eq(to))).thenReturn(expected);

        ResponseEntity<Map<String, Long>> response = analyticsController.getBookingAnalytics(from, to);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(expected, response.getBody());
    }

    @Test
    @DisplayName("GET /api/analytics/users: Returns 200 OK with Map of user metrics")
    void testGetUserAnalytics() {
        Map<String, Long> expected = Collections.singletonMap("TOTAL_USERS", 40L);
        when(analyticsService.getUserAnalytics(eq(from), eq(to))).thenReturn(expected);

        ResponseEntity<Map<String, Long>> response = analyticsController.getUserAnalytics(from, to);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(expected, response.getBody());
    }

    @Test
    @DisplayName("GET /api/analytics/bikes: Returns 200 OK with Map of bike metrics")
    void testGetBikeAnalytics() {
        Map<String, Long> expected = Collections.singletonMap("TOTAL_BIKES", 15L);
        when(analyticsService.getBikeAnalytics(eq(from), eq(to))).thenReturn(expected);

        ResponseEntity<Map<String, Long>> response = analyticsController.getBikeAnalytics(from, to);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(expected, response.getBody());
    }

    @Test
    @DisplayName("GET /api/analytics/rides: Returns 200 OK with RideAnalyticsDTO")
    void testGetRideAnalytics() {
        RideAnalyticsDTO expectedDto = RideAnalyticsDTO.builder()
                .totalRides(8)
                .totalDistance(95.0)
                .build();

        when(analyticsService.getRideAnalytics(eq(from), eq(to))).thenReturn(expectedDto);

        ResponseEntity<RideAnalyticsDTO> response = analyticsController.getRideAnalytics(from, to);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(expectedDto, response.getBody());
    }
}
