package com.sssit.bikerental.modules.owner.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EarningsDTO {
    private BigDecimal today;
    private BigDecimal weekly;
    private BigDecimal monthly;
    private BigDecimal total;
    private BigDecimal pendingPayments;
}
