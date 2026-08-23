package com.sssit.bikerental.modules.analytics.service;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.analytics.dto.DashboardAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.dto.RevenueAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.dto.RideAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.repository.AnalyticsRepository;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceAccuracyTest {

    @Mock
    private AnalyticsRepository analyticsRepository;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    private LocalDate fromDate;
    private LocalDate toDate;

    @BeforeEach
    void setUp() {
        fromDate = LocalDate.of(2026, 8, 1);
        toDate = LocalDate.of(2026, 8, 23);
    }

    @Test
    @DisplayName("Dashboard Analytics: Aggregates real metrics across users, bikes, bookings, revenue and rides accurately")
    void testGetDashboardAnalyticsAccuracy() {
        // Users mock
        when(analyticsRepository.countTotalUsers()).thenReturn(100L);
        List<Object[]> usersByRole = new ArrayList<>();
        usersByRole.add(new Object[]{Role.CUSTOMER.name(), 80L});
        usersByRole.add(new Object[]{Role.OWNER.name(), 18L});
        usersByRole.add(new Object[]{Role.ADMIN.name(), 2L});
        when(analyticsRepository.countUsersGroupedByRole()).thenReturn(usersByRole);

        // Bikes mock
        when(analyticsRepository.countTotalBikes()).thenReturn(50L);
        when(analyticsRepository.countBikesByStatus(BikeStatus.AVAILABLE)).thenReturn(30L);
        when(analyticsRepository.countBikesByStatus(BikeStatus.BOOKED)).thenReturn(10L);
        when(analyticsRepository.countBikesByStatus(BikeStatus.UNDER_MAINTENANCE)).thenReturn(5L);
        when(analyticsRepository.countBikesByStatus(BikeStatus.NOT_AVAILABLE)).thenReturn(5L);

        // Bookings mock
        when(analyticsRepository.countBookingsBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(25L);
        when(analyticsRepository.countBookingsByStatusBetween(eq(BookingStatus.PENDING), any(), any())).thenReturn(2L);
        when(analyticsRepository.countBookingsByStatusBetween(eq(BookingStatus.APPROVED), any(), any())).thenReturn(3L);
        when(analyticsRepository.countBookingsByStatusBetween(eq(BookingStatus.CONFIRMED), any(), any())).thenReturn(4L);
        when(analyticsRepository.countBookingsByStatusBetween(eq(BookingStatus.ACTIVE), any(), any())).thenReturn(5L);
        when(analyticsRepository.countBookingsByStatusBetween(eq(BookingStatus.COMPLETED), any(), any())).thenReturn(8L);
        when(analyticsRepository.countBookingsByStatusBetween(eq(BookingStatus.CANCELLED), any(), any())).thenReturn(2L);
        when(analyticsRepository.countBookingsByStatusBetween(eq(BookingStatus.REJECTED), any(), any())).thenReturn(1L);

        // Revenue mock
        when(analyticsRepository.calculateSuccessfulPaymentRevenue(any(), any())).thenReturn(new BigDecimal("12500.50"));
        when(analyticsRepository.countSuccessfulPayments(any(), any())).thenReturn(15L);
        when(analyticsRepository.countFailedPayments(any(), any())).thenReturn(2L);

        // Rides mock
        when(analyticsRepository.countRidesBetween(any(), any())).thenReturn(12L);
        when(analyticsRepository.countActiveRidesBetween(any(), any())).thenReturn(4L);
        when(analyticsRepository.countCompletedRidesBetween(any(), any())).thenReturn(8L);
        when(analyticsRepository.calculateTotalDistance(any(), any())).thenReturn(145.5);
        when(analyticsRepository.calculateTotalRideDuration(any(), any())).thenReturn(36000L);
        when(analyticsRepository.countRidesByDate(any(), any())).thenReturn(new ArrayList<>());

        DashboardAnalyticsDTO dto = analyticsService.getDashboardAnalytics();

        assertNotNull(dto);
        assertEquals(100L, dto.getTotalUsers());
        assertEquals(80L, dto.getTotalCustomers());
        assertEquals(18L, dto.getTotalOwners());

        assertEquals(50L, dto.getTotalBikes());
        assertEquals(30L, dto.getAvailableBikes());
        assertEquals(10L, dto.getBookedBikes());
        assertEquals(5L, dto.getMaintenanceBikes());
        assertEquals(5L, dto.getNotAvailableBikes());
        // Utilization: 10 booked / 50 total = 20.0%
        assertEquals(20.0, dto.getBikeUtilizationPercentage(), 0.001);

        assertEquals(25L, dto.getTotalBookings());
        assertEquals(2L, dto.getPendingBookings());
        assertEquals(3L, dto.getApprovedBookings());
        assertEquals(4L, dto.getConfirmedBookings());
        assertEquals(5L, dto.getActiveBookings());
        assertEquals(8L, dto.getCompletedBookings());
        assertEquals(2L, dto.getCancelledBookings());
        assertEquals(1L, dto.getRejectedBookings());

        assertEquals(new BigDecimal("12500.50"), dto.getTotalRevenue());
        assertEquals(15L, dto.getSuccessfulPayments());
        assertEquals(2L, dto.getFailedPayments());

        assertEquals(12L, dto.getTotalRides());
        assertEquals(4L, dto.getActiveRides());
        assertEquals(8L, dto.getCompletedRides());
        assertNotNull(dto.getGeneratedAt());
    }

    @Test
    @DisplayName("Revenue Analytics: Calculates total revenue, payment counts, average amount, and date breakdown accurately")
    void testGetRevenueAnalyticsAccuracy() {
        when(analyticsRepository.calculateSuccessfulPaymentRevenue(any(), any())).thenReturn(new BigDecimal("6000.00"));
        when(analyticsRepository.countSuccessfulPayments(any(), any())).thenReturn(4L);
        when(analyticsRepository.countFailedPayments(any(), any())).thenReturn(1L);

        List<Object[]> revenueRows = new ArrayList<>();
        revenueRows.add(new Object[]{"2026-08-10", new BigDecimal("1500.00")});
        revenueRows.add(new Object[]{"2026-08-15", new BigDecimal("2500.00")});
        revenueRows.add(new Object[]{"2026-08-20", new BigDecimal("2000.00")});
        when(analyticsRepository.revenueByDate(any(), any())).thenReturn(revenueRows);

        RevenueAnalyticsDTO dto = analyticsService.getRevenueAnalytics(fromDate, toDate);

        assertNotNull(dto);
        assertEquals(new BigDecimal("6000.00"), dto.getTotalRevenue());
        assertEquals(4L, dto.getSuccessfulPaymentCount());
        assertEquals(1L, dto.getFailedPaymentCount());
        // Average: 6000 / 4 = 1500.00
        assertEquals(new BigDecimal("1500.00"), dto.getAveragePaymentAmount());

        assertEquals(3, dto.getRevenueByDate().size());
        assertEquals(new BigDecimal("1500.00"), dto.getRevenueByDate().get("2026-08-10"));
        assertEquals(new BigDecimal("2500.00"), dto.getRevenueByDate().get("2026-08-15"));
        assertEquals(new BigDecimal("2000.00"), dto.getRevenueByDate().get("2026-08-20"));
    }

    @Test
    @DisplayName("Revenue Analytics: Handles zero revenue and zero payment safely without division by zero")
    void testGetRevenueAnalyticsZeroPayments() {
        when(analyticsRepository.calculateSuccessfulPaymentRevenue(any(), any())).thenReturn(null);
        when(analyticsRepository.countSuccessfulPayments(any(), any())).thenReturn(0L);
        when(analyticsRepository.countFailedPayments(any(), any())).thenReturn(0L);
        when(analyticsRepository.revenueByDate(any(), any())).thenReturn(new ArrayList<>());

        RevenueAnalyticsDTO dto = analyticsService.getRevenueAnalytics(fromDate, toDate);

        assertNotNull(dto);
        assertEquals(BigDecimal.ZERO, dto.getTotalRevenue());
        assertEquals(0L, dto.getSuccessfulPaymentCount());
        assertEquals(0L, dto.getFailedPaymentCount());
        assertEquals(BigDecimal.ZERO, dto.getAveragePaymentAmount());
        assertTrue(dto.getRevenueByDate().isEmpty());
    }

    @Test
    @DisplayName("Booking Analytics: Groups bookings by status correctly")
    void testGetBookingAnalyticsAccuracy() {
        List<Object[]> bookingRows = new ArrayList<>();
        bookingRows.add(new Object[]{BookingStatus.COMPLETED.name(), 15L});
        bookingRows.add(new Object[]{BookingStatus.ACTIVE.name(), 5L});
        bookingRows.add(new Object[]{BookingStatus.PENDING.name(), 3L});
        when(analyticsRepository.countBookingsGroupedByStatus(any(), any())).thenReturn(bookingRows);

        Map<String, Long> result = analyticsService.getBookingAnalytics(fromDate, toDate);

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals(15L, result.get("COMPLETED"));
        assertEquals(5L, result.get("ACTIVE"));
        assertEquals(3L, result.get("PENDING"));
    }

    @Test
    @DisplayName("User Analytics: Returns user counts by role and totals accurately")
    void testGetUserAnalyticsAccuracy() {
        List<Object[]> roleRows = new ArrayList<>();
        roleRows.add(new Object[]{"CUSTOMER", 45L});
        roleRows.add(new Object[]{"OWNER", 10L});
        roleRows.add(new Object[]{"ADMIN", 2L});
        when(analyticsRepository.countUsersGroupedByRole()).thenReturn(roleRows);
        when(analyticsRepository.countTotalUsers()).thenReturn(57L);
        when(analyticsRepository.countEnabledUsers()).thenReturn(55L);
        when(analyticsRepository.countUsersCreatedBetween(any(), any())).thenReturn(12L);

        Map<String, Long> result = analyticsService.getUserAnalytics(fromDate, toDate);

        assertNotNull(result);
        assertEquals(45L, result.get("CUSTOMER"));
        assertEquals(10L, result.get("OWNER"));
        assertEquals(2L, result.get("ADMIN"));
        assertEquals(57L, result.get("TOTAL_USERS"));
        assertEquals(55L, result.get("ACTIVE_USERS"));
        assertEquals(12L, result.get("USERS_CREATED_IN_RANGE"));
    }

    @Test
    @DisplayName("Bike Analytics: Returns fleet counts by status and creations in range accurately")
    void testGetBikeAnalyticsAccuracy() {
        List<Object[]> bikeRows = new ArrayList<>();
        bikeRows.add(new Object[]{"AVAILABLE", 20L});
        bikeRows.add(new Object[]{"BOOKED", 8L});
        bikeRows.add(new Object[]{"UNDER_MAINTENANCE", 2L});
        when(analyticsRepository.countBikesGroupedByStatus()).thenReturn(bikeRows);
        when(analyticsRepository.countTotalBikes()).thenReturn(30L);
        when(analyticsRepository.countBikesCreatedBetween(any(), any())).thenReturn(5L);

        Map<String, Long> result = analyticsService.getBikeAnalytics(fromDate, toDate);

        assertNotNull(result);
        assertEquals(20L, result.get("AVAILABLE"));
        assertEquals(8L, result.get("BOOKED"));
        assertEquals(2L, result.get("UNDER_MAINTENANCE"));
        assertEquals(30L, result.get("TOTAL_BIKES"));
        assertEquals(5L, result.get("BIKES_CREATED_IN_RANGE"));
    }

    @Test
    @DisplayName("Ride Analytics: Calculates rides, active/completed counts, distance, duration, averages and dates accurately")
    void testGetRideAnalyticsAccuracy() {
        when(analyticsRepository.countRidesBetween(any(), any())).thenReturn(10L);
        when(analyticsRepository.countActiveRidesBetween(any(), any())).thenReturn(3L);
        when(analyticsRepository.countCompletedRidesBetween(any(), any())).thenReturn(7L);
        when(analyticsRepository.calculateTotalDistance(any(), any())).thenReturn(150.0);
        when(analyticsRepository.calculateTotalRideDuration(any(), any())).thenReturn(18000L);

        List<Object[]> rideRows = new ArrayList<>();
        rideRows.add(new Object[]{"2026-08-20", 4L});
        rideRows.add(new Object[]{"2026-08-21", 6L});
        when(analyticsRepository.countRidesByDate(any(), any())).thenReturn(rideRows);

        RideAnalyticsDTO dto = analyticsService.getRideAnalytics(fromDate, toDate);

        assertNotNull(dto);
        assertEquals(10L, dto.getTotalRides());
        assertEquals(3L, dto.getActiveRides());
        assertEquals(7L, dto.getCompletedRides());
        assertEquals(150.0, dto.getTotalDistance(), 0.001);
        // Average distance: 150.0 / 10 = 15.0
        assertEquals(15.0, dto.getAverageDistance(), 0.001);
        assertEquals(18000L, dto.getTotalDuration());
        // Average duration: 18000 / 10 = 1800
        assertEquals(1800L, dto.getAverageDuration());

        assertEquals(2, dto.getRidesByDate().size());
        assertEquals(4L, dto.getRidesByDate().get("2026-08-20"));
        assertEquals(6L, dto.getRidesByDate().get("2026-08-21"));
    }

    @Test
    @DisplayName("Date Validation: Rejects invalid date range when from is after to, or dates are null")
    void testDateRangeValidation() {
        LocalDate invalidFrom = LocalDate.of(2026, 8, 25);
        LocalDate invalidTo = LocalDate.of(2026, 8, 20);

        assertThrows(IllegalArgumentException.class, () -> analyticsService.getRevenueAnalytics(invalidFrom, invalidTo));
        assertThrows(IllegalArgumentException.class, () -> analyticsService.getBookingAnalytics(null, invalidTo));
        assertThrows(IllegalArgumentException.class, () -> analyticsService.getUserAnalytics(invalidFrom, null));
        assertThrows(IllegalArgumentException.class, () -> analyticsService.getBikeAnalytics(invalidFrom, invalidTo));
        assertThrows(IllegalArgumentException.class, () -> analyticsService.getRideAnalytics(invalidFrom, invalidTo));
    }
}
