package com.sssit.bikerental.modules.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class InvoiceDTO {

    private String invoiceNumber;

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

    private String paymentStatus;

    private String transactionId;

    private String paymentMethod;

    private LocalDateTime paidAt;
}