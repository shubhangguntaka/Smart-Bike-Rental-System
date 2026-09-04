package com.sssit.bikerental.modules.payment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long paymentId;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private Long customerId;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal baseRentalAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal lateCharge;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal eligibleTransactionAmount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal platformFeePercent;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal platformFeeAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal taxAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 50)
    private PaymentStatus paymentStatus;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    private String transactionId;

    private String paymentMethod;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private LocalDateTime paidAt;

    private String invoiceNumber;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (paymentDate == null) {
            paymentDate = createdAt;
        }
        if (amount == null && finalAmount != null) {
            amount = finalAmount;
        }
        if (status == null && paymentStatus != null) {
            status = paymentStatus.name();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
        if (amount == null && finalAmount != null) {
            amount = finalAmount;
        }
        if (paymentStatus != null) {
            status = paymentStatus.name();
        }
        if (paidAt != null) {
            paymentDate = paidAt;
        }
    }
}