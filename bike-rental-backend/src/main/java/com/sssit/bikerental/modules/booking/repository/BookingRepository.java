package com.sssit.bikerental.modules.booking.repository;

import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT COUNT(bk) FROM Booking bk, Bike b WHERE bk.bikeId = b.bikeId AND b.ownerId = :ownerId")
    long countBookingsByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(bk) FROM Booking bk, Bike b WHERE bk.bikeId = b.bikeId AND b.ownerId = :ownerId AND bk.bookingStatus = :status")
    long countBookingsByOwnerIdAndStatusEnum(@Param("ownerId") Long ownerId, @Param("status") BookingStatus status);

    @Query("SELECT bk FROM Booking bk, Bike b WHERE bk.bikeId = b.bikeId AND b.ownerId = :ownerId AND bk.bookingStatus = com.sssit.bikerental.modules.booking.enums.BookingStatus.PENDING")
    List<Booking> findPendingBookingsByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT bk FROM Booking bk, Bike b WHERE bk.bikeId = b.bikeId AND b.ownerId = :ownerId")
    List<Booking> findAllBookingsByOwnerId(@Param("ownerId") Long ownerId);

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByBikeId(Long bikeId);

    List<Booking> findByBookingStatus(BookingStatus bookingStatus);

    @Query("SELECT COALESCE(SUM(bk.rentalAmount), 0) FROM Booking bk, Bike b WHERE bk.bikeId = b.bikeId AND b.ownerId = :ownerId AND bk.bookingStatus IN (com.sssit.bikerental.modules.booking.enums.BookingStatus.PENDING, com.sssit.bikerental.modules.booking.enums.BookingStatus.CONFIRMED)")
    BigDecimal sumPendingRentalAmountByOwnerId(@Param("ownerId") Long ownerId);

    // Backward-compatible query helper for other modules passing string status values
    default List<Booking> findByStatus(String status) {
        if (status == null) {
            return List.of();
        }
        try {
            return findByBookingStatus(BookingStatus.valueOf(status.toUpperCase()));
        } catch (Exception e) {
            return List.of();
        }
    }

    // Backward-compatible count helper for owner dashboard passing string status values
    default long countBookingsByOwnerIdAndStatus(Long ownerId, String status) {
        if (status == null) {
            return 0;
        }
        try {
            return countBookingsByOwnerIdAndStatusEnum(ownerId, BookingStatus.valueOf(status.toUpperCase()));
        } catch (Exception e) {
            return 0;
        }
    }
}
