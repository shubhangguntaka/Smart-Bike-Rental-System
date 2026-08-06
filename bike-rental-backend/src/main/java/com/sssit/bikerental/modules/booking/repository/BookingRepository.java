package com.sssit.bikerental.modules.booking.repository;

import com.sssit.bikerental.modules.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT COUNT(bk) FROM Booking bk, Bike b WHERE bk.bikeId = b.id AND b.ownerId = :ownerId")
    long countBookingsByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(bk) FROM Booking bk, Bike b WHERE bk.bikeId = b.id AND b.ownerId = :ownerId AND bk.status = :status")
    long countBookingsByOwnerIdAndStatus(@Param("ownerId") Long ownerId, @Param("status") String status);

    @Query("SELECT bk FROM Booking bk, Bike b WHERE bk.bikeId = b.id AND b.ownerId = :ownerId AND bk.status = 'PENDING'")
    List<Booking> findPendingBookingsByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT bk FROM Booking bk, Bike b WHERE bk.bikeId = b.id AND b.ownerId = :ownerId")
    List<Booking> findAllBookingsByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COALESCE(SUM(bk.rentalAmount), 0) FROM Booking bk, Bike b WHERE bk.bikeId = b.id AND b.ownerId = :ownerId AND bk.status IN ('PENDING', 'APPROVED')")
    BigDecimal sumPendingRentalAmountByOwnerId(@Param("ownerId") Long ownerId);
}
