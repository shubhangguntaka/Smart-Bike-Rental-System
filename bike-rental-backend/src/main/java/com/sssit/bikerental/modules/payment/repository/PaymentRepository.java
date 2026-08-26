package com.sssit.bikerental.modules.payment.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;

@Repository
public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(
            Long bookingId
    );

    List<Payment> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    Optional<Payment> findByRazorpayOrderId(
            String razorpayOrderId
    );

    Optional<Payment> findByTransactionId(
            String transactionId
    );

    /*
     * Owner earnings.
     *
     * Payment → Booking → Bike
     *
     * Payment stores bookingId.
     * Booking stores bikeId.
     * Bike stores ownerId.
     */
    @Query("""
        SELECT COALESCE(SUM(p.finalAmount), 0)
        FROM Payment p, Booking b, Bike bike
        WHERE p.bookingId = b.id
          AND b.bikeId = bike.bikeId
          AND bike.ownerId = :ownerId
          AND p.paymentStatus = :status
        """)
    BigDecimal sumCompletedEarningsByOwnerId(
            @Param("ownerId") Long ownerId,
            @Param("status") PaymentStatus status
    );

    @Query("""
        SELECT COALESCE(SUM(p.finalAmount), 0)
        FROM Payment p, Booking b, Bike bike
        WHERE p.bookingId = b.id
          AND b.bikeId = bike.bikeId
          AND bike.ownerId = :ownerId
          AND p.paymentStatus = :status
          AND p.paidAt >= :date
        """)
    BigDecimal sumCompletedEarningsByOwnerIdAndPaymentDateAfter(
            @Param("ownerId") Long ownerId,
            @Param("status") PaymentStatus status,
            @Param("date") LocalDateTime date
    );
}