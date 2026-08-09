package com.sssit.bikerental.modules.booking.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Duration;

import org.springframework.stereotype.Component;

@Component
public class BookingCalculator {

    /**
     * Calculate total rental days.
     */
    public int calculateTotalDays(LocalDateTime startTime, LocalDateTime returnTime) {
        if (startTime == null || returnTime == null) {
            return 0;
        }

        long minutes = Duration.between(startTime, returnTime).toMinutes();
        if (minutes <= 0) {
            return 0;
        }

        return (int) Math.ceil((double) minutes / (24 * 60));
    }

    /**
     * Calculate total rental amount.
     */
    public BigDecimal calculateTotalAmount(
            BigDecimal pricePerDay,
            Integer totalDays) {

        if (pricePerDay == null || totalDays == null) {
            return BigDecimal.ZERO;
        }

        return pricePerDay
                .multiply(BigDecimal.valueOf(totalDays))
                .setScale(2, RoundingMode.HALF_UP);
    }

}