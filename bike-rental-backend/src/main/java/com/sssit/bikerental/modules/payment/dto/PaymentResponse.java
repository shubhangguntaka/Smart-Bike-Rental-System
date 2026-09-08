package com.sssit.bikerental.modules.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.sssit.bikerental.modules.payment.entity.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long paymentId;
    private Long bookingId;
    private Long customerId;
    private Long ownerId;

    private BigDecimal baseRentalAmount;
    private BigDecimal lateCharge;
    private BigDecimal eligibleTransactionAmount;
    private BigDecimal platformFeePercent;
    private BigDecimal platformFeeAmount;
    private BigDecimal taxAmount;
    private BigDecimal finalAmount;

    // Revenue distribution / shares
    private BigDecimal ownerShareAmount;
    private BigDecimal adminShareAmount;

    // Banking settlement snapshots
    private String ownerBankName;
    private String ownerAccountNumber;
    private String ownerIfscCode;
    private String ownerUpiId;
    private String ownerPayoutUtr;

    private String adminBankName;
    private String adminAccountNumber;
    private String adminIfscCode;
    private String adminUpiId;
    private String adminPayoutUtr;

    private String payoutStatus;
    private LocalDateTime payoutSettledAt;

    private PaymentStatus paymentStatus;
    private String transactionId;
    private String paymentMethod;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private LocalDateTime paidAt;
    private String invoiceNumber;
    private LocalDateTime createdAt;
    private String razorpayKeyId;
}