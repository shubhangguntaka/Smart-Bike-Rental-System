package com.sssit.bikerental.modules.owner.dto;

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
public class OwnerPaymentDTO {

    // Internal Identifiers
    private Long paymentId;
    private Long bookingId;
    private Long customerId;
    private String invoiceNumber;

    // Customer Information
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Bike Information
    private Long bikeId;
    private String bikeName;
    private String bikeModel;
    private String bikeRegistrationNumber;

    // Rental Timeline
    private LocalDateTime rentalStart;
    private LocalDateTime scheduledReturn;
    private LocalDateTime actualPickup;
    private LocalDateTime actualReturn;
    private Long rentalDurationDays;

    // Authoritative Billing Breakdown
    private BigDecimal baseRentalAmount;
    private BigDecimal lateCharge;
    private BigDecimal eligibleTransactionAmount;
    private BigDecimal platformFeePercent;
    private BigDecimal platformFeeAmount;
    private BigDecimal taxAmount;
    private BigDecimal finalAmount; // Total paid by customer

    // Authoritative Owner Earnings (Net Rental Revenue)
    private BigDecimal ownerEarnings; // baseRentalAmount + lateCharge
    private BigDecimal adminShareAmount; // platformFeeAmount + taxAmount

    // Owner Settlement & Bank Details
    private String ownerBankName;
    private String ownerAccountNumber;
    private String ownerIfscCode;
    private String ownerUpiId;
    private String payoutUtr;
    private String payoutStatus;
    private LocalDateTime payoutSettledAt;

    // Payment & Razorpay Gateway Details
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private String transactionId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
