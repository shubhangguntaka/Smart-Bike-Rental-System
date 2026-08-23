package com.sssit.bikerental.modules.analytics.repository;

import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.gps.entity.Ride;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsRepository extends JpaRepository<Booking, Long> {

  // =========================================================
  // BOOKING ANALYTICS
  // =========================================================

  @Query("""
      SELECT COUNT(b)
      FROM Booking b
      WHERE b.createdAt >= :startDate
        AND b.createdAt < :endDate
      """)
  long countBookingsBetween(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  @Query("""
      SELECT COUNT(b)
      FROM Booking b
      WHERE b.bookingStatus = :status
        AND b.createdAt >= :startDate
        AND b.createdAt < :endDate
      """)
  long countBookingsByStatusBetween(
      @Param("status") BookingStatus status,
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  @Query("""
      SELECT b.bookingStatus, COUNT(b)
      FROM Booking b
      WHERE b.createdAt >= :startDate
        AND b.createdAt < :endDate
      GROUP BY b.bookingStatus
      """)
  List<Object[]> countBookingsGroupedByStatus(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  // =========================================================
  // REVENUE ANALYTICS
  // =========================================================

  @Query("""
      SELECT COALESCE(SUM(b.rentalAmount), 0)
      FROM Booking b
      WHERE b.bookingStatus =
            com.sssit.bikerental.modules.booking.enums.BookingStatus.COMPLETED
        AND b.createdAt >= :startDate
        AND b.createdAt < :endDate
      """)
  BigDecimal calculateCompletedBookingRevenue(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  // =========================================================
  // PAYMENT ANALYTICS
  // =========================================================

  @Query("""
      SELECT COALESCE(SUM(p.amount), 0)
      FROM Payment p
      WHERE p.status = 'SUCCESS'
        AND p.paymentDate >= :startDate
        AND p.paymentDate < :endDate
      """)
  BigDecimal calculateSuccessfulPaymentRevenue(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  @Query("""
      SELECT COUNT(p)
      FROM Payment p
      WHERE p.status = 'SUCCESS'
        AND p.paymentDate >= :startDate
        AND p.paymentDate < :endDate
      """)
  long countSuccessfulPayments(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

      @Query("""
    SELECT COUNT(p)
    FROM Payment p
    WHERE p.status = 'FAILED'
      AND p.paymentDate >= :startDate
      AND p.paymentDate < :endDate
    """)
long countFailedPayments(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

  // =========================================================
  // RIDE ANALYTICS
  // =========================================================

  @Query("""
      SELECT COUNT(r)
      FROM Ride r
      WHERE r.startedAt IS NOT NULL
        AND r.startedAt >= :startDate
        AND r.startedAt < :endDate
      """)
  long countRidesBetween(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

      @Query("""
    SELECT COUNT(r)
    FROM Ride r
    WHERE r.startedAt IS NOT NULL
      AND r.endedAt IS NULL
      AND r.startedAt >= :startDate
      AND r.startedAt < :endDate
    """)
long countActiveRidesBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

@Query("""
    SELECT COUNT(r)
    FROM Ride r
    WHERE r.startedAt IS NOT NULL
      AND r.endedAt IS NOT NULL
      AND r.startedAt >= :startDate
      AND r.startedAt < :endDate
    """)
long countCompletedRidesBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

@Query("""
    SELECT FUNCTION('DATE', r.startedAt), COUNT(r)
    FROM Ride r
    WHERE r.startedAt IS NOT NULL
      AND r.startedAt >= :startDate
      AND r.startedAt < :endDate
    GROUP BY FUNCTION('DATE', r.startedAt)
    ORDER BY FUNCTION('DATE', r.startedAt)
    """)
List<Object[]> countRidesByDate(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

  @Query("""
      SELECT COALESCE(SUM(r.totalDistance), 0)
      FROM Ride r
      WHERE r.startedAt IS NOT NULL
        AND r.startedAt >= :startDate
        AND r.startedAt < :endDate
      """)
  Double calculateTotalDistance(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  @Query("""
      SELECT COALESCE(SUM(r.totalDuration), 0)
      FROM Ride r
      WHERE r.startedAt IS NOT NULL
        AND r.startedAt >= :startDate
        AND r.startedAt < :endDate
      """)
  Long calculateTotalRideDuration(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  // =========================================================
  // BIKE ANALYTICS
  // =========================================================

  @Query("""
      SELECT COUNT(b)
      FROM Bike b
      """)
  long countTotalBikes();

  @Query("""
      SELECT COUNT(b)
      FROM Bike b
      WHERE b.bikeStatus = :status
      """)
  long countBikesByStatus(
      @Param("status") BikeStatus status);

  @Query("""
      SELECT b.bikeStatus, COUNT(b)
      FROM Bike b
      GROUP BY b.bikeStatus
      """)
  List<Object[]> countBikesGroupedByStatus();

  @Query("""
      SELECT COUNT(b)
      FROM Bike b
      WHERE b.createdAt >= :startDate
        AND b.createdAt < :endDate
      """)
  long countBikesCreatedBetween(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  // =========================================================
  // USER ANALYTICS
  // =========================================================

  @Query("""
      SELECT COUNT(u)
      FROM User u
      """)
  long countTotalUsers();

  @Query("""
      SELECT COUNT(u)
      FROM User u
      WHERE u.createdAt >= :startDate
        AND u.createdAt < :endDate
      """)
  long countUsersCreatedBetween(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  @Query("""
      SELECT u.role, COUNT(u)
      FROM User u
      GROUP BY u.role
      """)
  List<Object[]> countUsersGroupedByRole();

  @Query("""
      SELECT COUNT(u)
      FROM User u
      WHERE u.enabled = true
      """)
  long countEnabledUsers();

  // =========================================================
  // DATE-BASED BOOKING SUMMARY
  // =========================================================

  @Query("""
      SELECT FUNCTION('DATE', b.createdAt), COUNT(b)
      FROM Booking b
      WHERE b.createdAt >= :startDate
        AND b.createdAt < :endDate
      GROUP BY FUNCTION('DATE', b.createdAt)
      ORDER BY FUNCTION('DATE', b.createdAt)
      """)
  List<Object[]> countBookingsByDate(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  // =========================================================
  // DATE-BASED REVENUE SUMMARY
  // =========================================================

  @Query("""
      SELECT FUNCTION('DATE', b.createdAt),
             COALESCE(SUM(b.rentalAmount), 0)
      FROM Booking b
      WHERE b.bookingStatus =
            com.sssit.bikerental.modules.booking.enums.BookingStatus.COMPLETED
        AND b.createdAt >= :startDate
        AND b.createdAt < :endDate
      GROUP BY FUNCTION('DATE', b.createdAt)
      ORDER BY FUNCTION('DATE', b.createdAt)
      """)
  List<Object[]> revenueByDate(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);
}