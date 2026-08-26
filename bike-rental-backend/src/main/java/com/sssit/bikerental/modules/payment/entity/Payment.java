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
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

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
}