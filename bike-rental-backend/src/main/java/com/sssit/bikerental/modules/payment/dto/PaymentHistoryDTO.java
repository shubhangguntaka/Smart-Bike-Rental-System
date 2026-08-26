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
public class PaymentHistoryDTO {

    private Long paymentId;

    private Long bookingId;

    private BigDecimal finalAmount;

    private PaymentStatus paymentStatus;

    private String paymentMethod;

    private String transactionId;

    private LocalDateTime paidAt;

    private String invoiceNumber;
}