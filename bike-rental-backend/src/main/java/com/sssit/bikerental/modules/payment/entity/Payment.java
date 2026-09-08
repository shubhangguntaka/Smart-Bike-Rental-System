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

    @Column(name = "owner_id")
    private Long ownerId;

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

    // === Revenue Distribution / Split Fields ===
    @Column(name = "owner_share_amount", precision = 12, scale = 2)
    private BigDecimal ownerShareAmount;

    @Column(name = "admin_share_amount", precision = 12, scale = 2)
    private BigDecimal adminShareAmount;

    // === Owner Bank Settlement Snapshot ===
    @Column(name = "owner_bank_name", length = 100)
    private String ownerBankName;

    @Column(name = "owner_account_number", length = 50)
    private String ownerAccountNumber;

    @Column(name = "owner_ifsc_code", length = 30)
    private String ownerIfscCode;

    @Column(name = "owner_upi_id", length = 100)
    private String ownerUpiId;

    @Column(name = "owner_payout_utr", length = 100)
    private String ownerPayoutUtr;

    // === Admin Platform Bank Settlement Snapshot ===
    @Column(name = "admin_bank_name", length = 100)
    private String adminBankName;

    @Column(name = "admin_account_number", length = 50)
    private String adminAccountNumber;

    @Column(name = "admin_ifsc_code", length = 30)
    private String adminIfscCode;

    @Column(name = "admin_upi_id", length = 100)
    private String adminUpiId;

    @Column(name = "admin_payout_utr", length = 100)
    private String adminPayoutUtr;

    @Builder.Default
    @Column(name = "payout_status", length = 50)
    private String payoutStatus = "SETTLED";

    @Column(name = "payout_settled_at")
    private LocalDateTime payoutSettledAt;

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
        if (ownerShareAmount == null && eligibleTransactionAmount != null) {
            ownerShareAmount = eligibleTransactionAmount;
        }
        if (adminShareAmount == null && platformFeeAmount != null) {
            adminShareAmount = platformFeeAmount.add(taxAmount != null ? taxAmount : BigDecimal.ZERO);
        }
        if (payoutStatus == null) {
            payoutStatus = "SETTLED";
        }
        if (payoutSettledAt == null && paymentStatus == PaymentStatus.SUCCESS) {
            payoutSettledAt = LocalDateTime.now();
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
        if (ownerShareAmount == null && eligibleTransactionAmount != null) {
            ownerShareAmount = eligibleTransactionAmount;
        }
        if (adminShareAmount == null && platformFeeAmount != null) {
            adminShareAmount = platformFeeAmount.add(taxAmount != null ? taxAmount : BigDecimal.ZERO);
        }
        if (payoutSettledAt == null && paymentStatus == PaymentStatus.SUCCESS) {
            payoutSettledAt = LocalDateTime.now();
        }
    }
}