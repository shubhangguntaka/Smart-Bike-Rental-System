package com.sssit.bikerental.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueAnalyticsDTO {

    private BigDecimal totalRevenue;

    private long successfulPaymentCount;

    private long failedPaymentCount;

    private BigDecimal averagePaymentAmount;

    /**
     * Key:
     * Date in ISO format, for example 2026-08-19
     *
     * Value:
     * Successful payment amount for that date.
     */
    private Map<String, BigDecimal> revenueByDate;
}