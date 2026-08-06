package com.sssit.bikerental.modules.payment.repository;

import com.sssit.bikerental.modules.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p, Booking bk, Bike b WHERE p.bookingId = bk.id AND bk.bikeId = b.id AND b.ownerId = :ownerId AND p.status = 'SUCCESS'")
    BigDecimal sumCompletedEarningsByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p, Booking bk, Bike b WHERE p.bookingId = bk.id AND bk.bikeId = b.id AND b.ownerId = :ownerId AND p.status = 'SUCCESS' AND p.paymentDate >= :since")
    BigDecimal sumCompletedEarningsByOwnerIdAndPaymentDateAfter(@Param("ownerId") Long ownerId, @Param("since") LocalDateTime since);
}
