package com.sssit.bikerental.modules.payment.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.payment.config.PaymentProperties;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.service.PaymentCalculationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentCalculationServiceImpl
        implements PaymentCalculationService {

    private final BookingRepository bookingRepository;
    private final PaymentProperties paymentProperties;

    @Override
    public PaymentResponse calculatePayment(Long bookingId) {

        /*
         * Find booking
         */
    	Booking booking = bookingRepository.findById(bookingId)
    	        .orElseThrow(() ->
    	                new RuntimeException(
    	                        "Booking not found with id: "
    	                                + bookingId));

    	/*
    	 * Security check:
    	 * Payment can only be prepared for the
    	 * currently authenticated customer's booking.
    	 */
    	validateCustomerOwnership(booking);

    	/*
    	 * Payment can only start after
    	 * the bike has actually been returned.
    	 */
    	validateReturnConfirmed(booking);

        /*
         * Base rental amount comes from the
         * already calculated booking amount.
         *
         * We do NOT accept this amount from frontend.
         */
        BigDecimal baseRentalAmount =
                money(booking.getRentalAmount());

        /*
         * Calculate late charge.
         */
        BigDecimal lateCharge =
                calculateLateCharge(booking);

        /*
         * Eligible transaction amount.
         */
        BigDecimal eligibleTransactionAmount =
                baseRentalAmount
                        .add(lateCharge)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        /*
         * Determine platform fee tier.
         */
        BigDecimal platformFeePercent =
                calculatePlatformFeePercent(
                        eligibleTransactionAmount
                );

        /*
         * Calculate platform fee.
         */
        BigDecimal platformFeeAmount =
                calculatePercentage(
                        eligibleTransactionAmount,
                        platformFeePercent
                );

        /*
         * Tax is zero for now because
         * your specification says tax should
         * only be included if it already exists
         * in the project rules.
         */
        BigDecimal taxAmount =
                BigDecimal.ZERO.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        /*
         * Final payable amount.
         */
        BigDecimal finalAmount =
                eligibleTransactionAmount
                        .add(platformFeeAmount)
                        .add(taxAmount)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        return PaymentResponse.builder()
                .bookingId(booking.getId())
                .customerId(booking.getCustomerId())
                .baseRentalAmount(baseRentalAmount)
                .lateCharge(lateCharge)
                .eligibleTransactionAmount(
                        eligibleTransactionAmount
                )
                .platformFeePercent(
                        platformFeePercent
                )
                .platformFeeAmount(
                        platformFeeAmount
                )
                .taxAmount(taxAmount)
                .finalAmount(finalAmount)
                .paymentStatus(PaymentStatus.READY_FOR_PAYMENT)
                .build();
    }

	/**
     * Payment preparation is allowed only after
     * the actual bike return has been recorded.
     */
    private void validateReturnConfirmed(
            Booking booking) {

        if (booking.getActualReturnTime() == null) {
            throw new RuntimeException(
                    "Payment cannot be prepared before bike return is confirmed"
            );
        }
    }

    /**
     * Calculate late-return charge.
     *
     * The exact late-charge rate and grace period
     * come from PaymentProperties.
     */
    private BigDecimal calculateLateCharge(
            Booking booking) {

        /*
         * We need the configured grace period.
         */
        Integer graceMinutes =
                paymentProperties.getLateGraceMinutes();

        /*
         * If the project has not configured
         * a grace period yet, no late charge
         * is calculated.
         */
        if (graceMinutes == null
                || graceMinutes < 0) {

            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        /*
         * Scheduled return time.
         */
        if (booking.getReturnTime() == null) {

            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        /*
         * Actual return time.
         */
        if (booking.getActualReturnTime() == null) {

            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        /*
         * Calculate allowed return time
         * after applying grace period.
         */
        java.time.LocalDateTime allowedReturnTime =
                booking.getReturnTime()
                        .plusMinutes(graceMinutes);

        /*
         * Returned within allowed time.
         */
        if (!booking.getActualReturnTime()
                .isAfter(allowedReturnTime)) {

            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        /*
         * Late duration in minutes.
         */
        long lateMinutes =
                java.time.Duration
                        .between(
                                allowedReturnTime,
                                booking.getActualReturnTime()
                        )
                        .toMinutes();

        /*
         * If no late duration exists.
         */
        if (lateMinutes <= 0) {

            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        BigDecimal rate = paymentProperties.getLateChargeRate();
        if (rate == null || rate.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        /*
         * Apply configured late charge rate directly without assuming unconfirmed
         * hourly or partial-hour billing rules.
         */
        return rate.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Determine 3% or 5% platform fee.
     */
    private BigDecimal calculatePlatformFeePercent(
            BigDecimal eligibleTransactionAmount) {

        BigDecimal threshold =
                paymentProperties
                        .getPlatformFeeThreshold();

        BigDecimal lowerFee =
                paymentProperties
                        .getLowerPlatformFeePercent();

        BigDecimal upperFee =
                paymentProperties
                        .getUpperPlatformFeePercent();

        /*
         * Configuration is required.
         */
        if (threshold == null
                || lowerFee == null
                || upperFee == null) {

            throw new IllegalStateException(
                    "Payment platform fee configuration is missing: "
                            + "threshold, lower fee, and upper fee are required"
            );
        }

        /*
         * Lower tier.
         */
        if (eligibleTransactionAmount
                .compareTo(threshold) <= 0) {

            return lowerFee;
        }

        /*
         * Higher tier.
         */
        return upperFee;
    }

    /**
     * Calculate percentage amount.
     */
    private BigDecimal calculatePercentage(
            BigDecimal amount,
            BigDecimal percentage) {

        return amount
                .multiply(percentage)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );
    }

    /**
     * Normalize money values.
     */
    private BigDecimal money(
            BigDecimal amount) {

        if (amount == null) {
            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        return amount.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    /**
     * Verify that the logged-in customer owns
     * the booking for which payment is being prepared.
     */
    private void validateCustomerOwnership(
            Booking booking) {

        Long currentUserId =
                SecurityUtils.getCurrentUserId();

        if (currentUserId == null) {

            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        if (SecurityUtils.getCurrentRole() == com.sssit.bikerental.common.enums.Role.ADMIN) {
            return;
        }

        if (!currentUserId.equals(
                booking.getCustomerId())) {

            throw new AccessDeniedException(
                    "You are not authorized to prepare payment for this booking"
            );
        }
    }
}