package com.sssit.bikerental.modules.owner.dto;

import java.math.BigDecimal;

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
public class OwnerEarningsSummaryDTO {

    private BigDecimal totalEarnings; // Total Net Earnings for Owner
    private BigDecimal totalCustomerPaid; // Total paid by customers
    private BigDecimal totalPlatformFees; // Total platform fee retained
    private BigDecimal totalRentalAmount; // Sum of base rental amounts
    private BigDecimal totalLateCharges; // Sum of late charges
    private Long totalSuccessfulPayments; // Count of successful payments
    private Long totalPendingPayments; // Count of pending payments
}
