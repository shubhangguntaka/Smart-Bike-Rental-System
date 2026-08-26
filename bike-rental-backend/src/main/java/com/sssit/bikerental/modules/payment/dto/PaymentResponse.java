package com.sssit.bikerental.modules.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.sssit.bikerental.modules.payment.entity.PaymentStatus;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PaymentResponse {

    private Long paymentId;

    private Long bookingId;

    private Long customerId;

    private BigDecimal baseRentalAmount;

    private BigDecimal lateCharge;

    private BigDecimal eligibleTransactionAmount;

    private BigDecimal platformFeePercent;

    private BigDecimal platformFeeAmount;

    private BigDecimal taxAmount;

    private BigDecimal finalAmount;

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