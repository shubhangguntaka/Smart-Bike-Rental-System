package com.sssit.bikerental.modules.analytics.service;

import com.sssit.bikerental.modules.analytics.dto.DashboardAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.dto.RevenueAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.dto.RideAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.repository.AnalyticsRepository;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.common.enums.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsServiceImpl(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    @Override
    public DashboardAnalyticsDTO getDashboardAnalytics() {

        LocalDate today = LocalDate.now();

        LocalDateTime startDate = today.atStartOfDay();
        LocalDateTime endDate = today.plusDays(1).atStartOfDay();

        long totalUsers = analyticsRepository.countTotalUsers();

        Map<String, Long> usersByRole =
                toStringLongMap(analyticsRepository.countUsersGroupedByRole());

        long totalCustomers = getMapValue(usersByRole, Role.CUSTOMER.name());
        long totalOwners = getMapValue(usersByRole, Role.OWNER.name());

        long totalBikes = analyticsRepository.countTotalBikes();

        long availableBikes =
                analyticsRepository.countBikesByStatus(BikeStatus.AVAILABLE);

        long bookedBikes =
                analyticsRepository.countBikesByStatus(BikeStatus.BOOKED);

        long maintenanceBikes =
        analyticsRepository.countBikesByStatus(BikeStatus.UNDER_MAINTENANCE);

        long notAvailableBikes =
                analyticsRepository.countBikesByStatus(BikeStatus.NOT_AVAILABLE);

        long totalBookings =
                analyticsRepository.countBookingsBetween(startDate, endDate);

        long pendingBookings =
                analyticsRepository.countBookingsByStatusBetween(
                        BookingStatus.PENDING, startDate, endDate);

        long approvedBookings =
                analyticsRepository.countBookingsByStatusBetween(
                        BookingStatus.APPROVED, startDate, endDate);

        long confirmedBookings =
                analyticsRepository.countBookingsByStatusBetween(
                        BookingStatus.CONFIRMED, startDate, endDate);

        long activeBookings =
                analyticsRepository.countBookingsByStatusBetween(
                        BookingStatus.ACTIVE, startDate, endDate);

        long completedBookings =
                analyticsRepository.countBookingsByStatusBetween(
                        BookingStatus.COMPLETED, startDate, endDate);

        long cancelledBookings =
                analyticsRepository.countBookingsByStatusBetween(
                        BookingStatus.CANCELLED, startDate, endDate);

        long rejectedBookings =
                analyticsRepository.countBookingsByStatusBetween(
                        BookingStatus.REJECTED, startDate, endDate);

        BigDecimal totalRevenue =
                analyticsRepository.calculateSuccessfulPaymentRevenue(
                        startDate, endDate);

        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        long successfulPayments =
                analyticsRepository.countSuccessfulPayments(
                        startDate, endDate);

        long totalRides =
                analyticsRepository.countRidesBetween(startDate, endDate);

        long activeRides = 0;
        long completedRides = 0;

        RideAnalyticsDTO rideAnalytics =
                getRideAnalytics(today, today);
        
        

        if (rideAnalytics != null) {
            activeRides = rideAnalytics.getActiveRides();
            completedRides = rideAnalytics.getCompletedRides();
        }

        double utilization = calculateBikeUtilization(
                totalBikes,
                bookedBikes
        );

        return DashboardAnalyticsDTO.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalOwners(totalOwners)

                .totalBikes(totalBikes)
                .availableBikes(availableBikes)
                .bookedBikes(bookedBikes)
                .maintenanceBikes(maintenanceBikes)
                .notAvailableBikes(notAvailableBikes)

                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .approvedBookings(approvedBookings)
                .confirmedBookings(confirmedBookings)
                .activeBookings(activeBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .rejectedBookings(rejectedBookings)

                .totalRevenue(totalRevenue)
                .successfulPayments(successfulPayments)
                .failedPayments(0)

                .totalRides(totalRides)
                .activeRides(activeRides)
                .completedRides(completedRides)

                .bikeUtilizationPercentage(utilization)

                .generatedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public RevenueAnalyticsDTO getRevenueAnalytics(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        LocalDateTime startDate = from.atStartOfDay();
        LocalDateTime endDate = to.plusDays(1).atStartOfDay();

        BigDecimal totalRevenue =
                analyticsRepository.calculateSuccessfulPaymentRevenue(
                        startDate,
                        endDate
                );

        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        long successfulPayments =
                analyticsRepository.countSuccessfulPayments(
                        startDate,
                        endDate
                );

        List<Object[]> revenueRows =
                analyticsRepository.revenueByDate(
                        startDate,
                        endDate
                );

        Map<String, BigDecimal> revenueByDate =
                new LinkedHashMap<>();

        for (Object[] row : revenueRows) {

            if (row == null || row.length < 2) {
                continue;
            }

            String date = String.valueOf(row[0]);

            BigDecimal amount = toBigDecimal(row[1]);

            revenueByDate.put(
                    date,
                    amount
            );
        }

        BigDecimal averagePaymentAmount = BigDecimal.ZERO;

        if (successfulPayments > 0) {
            averagePaymentAmount =
                    totalRevenue.divide(
                            BigDecimal.valueOf(successfulPayments),
                            2,
                            java.math.RoundingMode.HALF_UP
                    );
        }

        return RevenueAnalyticsDTO.builder()
                .totalRevenue(totalRevenue)
                .successfulPaymentCount(successfulPayments)
                .failedPaymentCount(0)
                .averagePaymentAmount(averagePaymentAmount)
                .revenueByDate(revenueByDate)
                .build();
    }

    @Override
    public Map<String, Long> getBookingAnalytics(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        LocalDateTime startDate = from.atStartOfDay();
        LocalDateTime endDate = to.plusDays(1).atStartOfDay();

        return toStringLongMap(
                analyticsRepository.countBookingsGroupedByStatus(
                        startDate,
                        endDate
                )
        );
    }

    @Override
    public Map<String, Long> getUserAnalytics(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        Map<String, Long> result = new LinkedHashMap<>();

        Map<String, Long> usersByRole =
                toStringLongMap(
                        analyticsRepository.countUsersGroupedByRole()
                );

        result.putAll(usersByRole);

        result.put(
                "TOTAL_USERS",
                analyticsRepository.countTotalUsers()
        );

        result.put(
                "ACTIVE_USERS",
                analyticsRepository.countEnabledUsers()
        );

        result.put(
                "USERS_CREATED_IN_RANGE",
                analyticsRepository.countUsersCreatedBetween(
                        from.atStartOfDay(),
                        to.plusDays(1).atStartOfDay()
                )
        );

        return result;
    }

    @Override
    public Map<String, Long> getBikeAnalytics(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        Map<String, Long> result = new LinkedHashMap<>();

        Map<String, Long> bikesByStatus =
                toStringLongMap(
                        analyticsRepository.countBikesGroupedByStatus()
                );

        result.putAll(bikesByStatus);

        result.put(
                "TOTAL_BIKES",
                analyticsRepository.countTotalBikes()
        );

        result.put(
                "BIKES_CREATED_IN_RANGE",
                analyticsRepository.countBikesCreatedBetween(
                        from.atStartOfDay(),
                        to.plusDays(1).atStartOfDay()
                )
        );

        return result;
    }

    @Override
    public RideAnalyticsDTO getRideAnalytics(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        LocalDateTime startDate = from.atStartOfDay();
        LocalDateTime endDate = to.plusDays(1).atStartOfDay();

        long totalRides =
                analyticsRepository.countRidesBetween(
                        startDate,
                        endDate
                );

        Double totalDistance =
                analyticsRepository.calculateTotalDistance(
                        startDate,
                        endDate
                );

        Long totalDuration =
                analyticsRepository.calculateTotalRideDuration(
                        startDate,
                        endDate
                );

        if (totalDistance == null) {
            totalDistance = 0.0;
        }

        if (totalDuration == null) {
            totalDuration = 0L;
        }

        double averageDistance = 0.0;
        long averageDuration = 0L;

        if (totalRides > 0) {
            averageDistance =
                    totalDistance / totalRides;

            averageDuration =
                    totalDuration / totalRides;
        }

        Map<String, Long> ridesByDate =
                new LinkedHashMap<>();

        return RideAnalyticsDTO.builder()
                .totalRides(totalRides)
                .activeRides(0)
                .completedRides(0)
                .totalDistance(totalDistance)
                .averageDistance(averageDistance)
                .totalDuration(totalDuration)
                .averageDuration(averageDuration)
                .ridesByDate(ridesByDate)
                .build();
    }

    private void validateDateRange(
            LocalDate from,
            LocalDate to
    ) {

        if (from == null || to == null) {
            throw new IllegalArgumentException(
                    "Both from and to dates are required"
            );
        }

        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "From date cannot be after to date"
            );
        }
    }

    private Map<String, Long> toStringLongMap(
            List<Object[]> rows
    ) {

        Map<String, Long> result =
                new LinkedHashMap<>();

        if (rows == null) {
            return result;
        }

        for (Object[] row : rows) {

            if (row == null || row.length < 2) {
                continue;
            }

            if (row[0] == null || row[1] == null) {
                continue;
            }

            String key = String.valueOf(row[0]);

            long value =
                    ((Number) row[1]).longValue();

            result.put(key, value);
        }

        return result;
    }

    private long getMapValue(
            Map<String, Long> map,
            String key
    ) {

        if (map == null || key == null) {
            return 0L;
        }

        return map.getOrDefault(key, 0L);
    }

    private BigDecimal toBigDecimal(Object value) {

        if (value == null) {
            return BigDecimal.ZERO;
        }

        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }

        if (value instanceof Number) {
            return BigDecimal.valueOf(
                    ((Number) value).doubleValue()
            );
        }

        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException exception) {
            return BigDecimal.ZERO;
        }
    }

    private double calculateBikeUtilization(
            long totalBikes,
            long bookedBikes
    ) {

        if (totalBikes <= 0) {
            return 0.0;
        }

        return (bookedBikes * 100.0) / totalBikes;
    }
}