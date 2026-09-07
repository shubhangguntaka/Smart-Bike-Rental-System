package com.sssit.bikerental.modules.payment.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.payment.config.PaymentProperties;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.service.PaymentCalculationService;

@Service
@Transactional(readOnly = true)
public class PaymentCalculationServiceImpl implements PaymentCalculationService {

    private final BookingRepository bookingRepository;
    private final PaymentProperties paymentProperties;
    private final BikeRepository bikeRepository;

    public PaymentCalculationServiceImpl(
            BookingRepository bookingRepository,
            PaymentProperties paymentProperties) {
        this(bookingRepository, null, paymentProperties);
    }

    @Autowired
    public PaymentCalculationServiceImpl(
            BookingRepository bookingRepository,
            @Autowired(required = false) BikeRepository bikeRepository,
            PaymentProperties paymentProperties) {
        this.bookingRepository = bookingRepository;
        this.bikeRepository = bikeRepository;
        this.paymentProperties = paymentProperties;
    }

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
         * Base rental amount determination:
         * If the bike is returned early (actualReturnTime < scheduledReturnTime),
         * charge according to actual usage duration.
         * Otherwise (on-time or late return), use scheduled rental amount.
         */
        BigDecimal baseRentalAmount = calculateBaseRentalAmount(booking);

        /*
         * Calculate late charge.
         */
        BigDecimal lateCharge = calculateLateCharge(booking);

        /*
         * Eligible transaction amount.
         */
        BigDecimal eligibleTransactionAmount = baseRentalAmount
                .add(lateCharge)
                .setScale(2, RoundingMode.HALF_UP);

        /*
         * Determine platform fee tier.
         */
        BigDecimal platformFeePercent = calculatePlatformFeePercent(eligibleTransactionAmount);

        /*
         * Calculate platform fee.
         */
        BigDecimal platformFeeAmount = calculatePercentage(
                eligibleTransactionAmount,
                platformFeePercent);

        /*
         * Tax is zero for now unless configured in project rules.
         */
        BigDecimal taxAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        /*
         * Final payable amount.
         */
        BigDecimal finalAmount = eligibleTransactionAmount
                .add(platformFeeAmount)
                .add(taxAmount)
                .setScale(2, RoundingMode.HALF_UP);

        return PaymentResponse.builder()
                .bookingId(booking.getId())
                .customerId(booking.getCustomerId())
                .baseRentalAmount(baseRentalAmount)
                .lateCharge(lateCharge)
                .eligibleTransactionAmount(eligibleTransactionAmount)
                .platformFeePercent(platformFeePercent)
                .platformFeeAmount(platformFeeAmount)
                .taxAmount(taxAmount)
                .finalAmount(finalAmount)
                .paymentStatus(PaymentStatus.READY_FOR_PAYMENT)
                .build();
    }

    /**
     * Calculate base rental amount taking early return into account.
     */
    private BigDecimal calculateBaseRentalAmount(Booking booking) {
        BigDecimal scheduledRentalAmount = money(booking.getRentalAmount());

        LocalDateTime scheduledReturnTime = booking.getReturnTime();
        LocalDateTime actualReturnTime = booking.getActualReturnTime();

        // If not returned earlier than scheduled, charge normal scheduled rental amount
        if (actualReturnTime == null || scheduledReturnTime == null || !actualReturnTime.isBefore(scheduledReturnTime)) {
            return scheduledRentalAmount;
        }

        // Authoritative start time is actualPickupTime if present, otherwise scheduled startTime
        LocalDateTime actualStartTime = booking.getActualPickupTime() != null
                ? booking.getActualPickupTime()
                : booking.getStartTime();

        if (actualStartTime == null) {
            return scheduledRentalAmount;
        }

        long actualMinutes = Duration.between(actualStartTime, actualReturnTime).toMinutes();
        if (actualMinutes < 0) {
            actualMinutes = 0;
        }

        BigDecimal hourlyRate = determineHourlyRate(booking);
        if (hourlyRate == null) {
            return scheduledRentalAmount;
        }

        BigDecimal actualMinutesBd = BigDecimal.valueOf(actualMinutes);
        BigDecimal actualUsageAmount = hourlyRate
                .multiply(actualMinutesBd)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        // An early return should reduce the charge and not exceed scheduled rental amount
        if (actualUsageAmount.compareTo(scheduledRentalAmount) < 0) {
            return actualUsageAmount;
        }

        return scheduledRentalAmount;
    }

    /**
     * Determine hourly rate for the booking based on Bike entity or scheduled duration.
     */
    private BigDecimal determineHourlyRate(Booking booking) {
        if (bikeRepository != null && booking.getBikeId() != null) {
            try {
                Bike bike = bikeRepository.findById(booking.getBikeId()).orElse(null);
                if (bike != null) {
                    BigDecimal rate = bike.getHourlyRate();
                    if (rate != null && rate.compareTo(BigDecimal.ZERO) > 0) {
                        return rate;
                    }
                    if (bike.getRentalPrice() != null && bike.getRentalPrice().compareTo(BigDecimal.ZERO) > 0) {
                        return bike.getRentalPrice().divide(BigDecimal.valueOf(24), 2, RoundingMode.HALF_UP);
                    }
                }
            } catch (Exception ignored) {
            }
        }

        if (booking.getStartTime() != null && booking.getReturnTime() != null && booking.getRentalAmount() != null) {
            long scheduledMinutes = Duration.between(booking.getStartTime(), booking.getReturnTime()).toMinutes();
            if (scheduledMinutes > 0) {
                return booking.getRentalAmount()
                        .multiply(BigDecimal.valueOf(60))
                        .divide(BigDecimal.valueOf(scheduledMinutes), 4, RoundingMode.HALF_UP);
            }
        }

        return null;
    }

    /**
     * Payment preparation is allowed only after
     * the actual bike return has been recorded.
     */
    private void validateReturnConfirmed(Booking booking) {
        if (booking.getBookingStatus() == com.sssit.bikerental.modules.booking.enums.BookingStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Payment cannot be prepared for a cancelled booking"
            );
        }
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
    private BigDecimal calculateLateCharge(Booking booking) {

        /*
         * We need the configured grace period.
         */
        Integer graceMinutes = paymentProperties.getLateGraceMinutes();

        /*
         * If the project has not configured
         * a grace period yet, no late charge
         * is calculated.
         */
        if (graceMinutes == null || graceMinutes < 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        /*
         * Scheduled return time.
         */
        if (booking.getReturnTime() == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        /*
         * Actual return time.
         */
        if (booking.getActualReturnTime() == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        /*
         * Calculate allowed return time
         * after applying grace period.
         */
        LocalDateTime allowedReturnTime = booking.getReturnTime().plusMinutes(graceMinutes);

        /*
         * Returned within allowed time.
         */
        if (!booking.getActualReturnTime().isAfter(allowedReturnTime)) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        /*
         * Late duration in minutes.
         */
        long lateMinutes = Duration.between(allowedReturnTime, booking.getActualReturnTime()).toMinutes();

        /*
         * If no late duration exists.
         */
        if (lateMinutes <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal rate = paymentProperties.getLateChargeRate();
        if (rate == null || rate.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        /*
         * Apply configured late charge rate directly without assuming unconfirmed
         * hourly or partial-hour billing rules.
         */
        return rate.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Determine 3% or 5% platform fee based on configured threshold.
     */
    private BigDecimal calculatePlatformFeePercent(BigDecimal eligibleTransactionAmount) {

        BigDecimal threshold = paymentProperties.getPlatformFeeThreshold();
        BigDecimal lowerFee = paymentProperties.getLowerPlatformFeePercent();
        BigDecimal upperFee = paymentProperties.getUpperPlatformFeePercent();

        /*
         * Configuration is required.
         */
        if (threshold == null || lowerFee == null || upperFee == null) {
            throw new IllegalStateException(
                    "Payment platform fee configuration is missing: "
                            + "threshold, lower fee, and upper fee are required"
            );
        }

        /*
         * Lower tier.
         */
        if (eligibleTransactionAmount.compareTo(threshold) <= 0) {
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
    private BigDecimal calculatePercentage(BigDecimal amount, BigDecimal percentage) {
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
    private BigDecimal money(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Verify that the logged-in customer owns
     * the booking for which payment is being prepared.
     */
    private void validateCustomerOwnership(Booking booking) {

        Long currentUserId = SecurityUtils.getCurrentUserId();

        if (currentUserId == null) {
            throw new AccessDeniedException("Authentication required");
        }

        if (SecurityUtils.getCurrentRole() == com.sssit.bikerental.common.enums.Role.ADMIN) {
            return;
        }

        if (!currentUserId.equals(booking.getCustomerId())) {
            throw new AccessDeniedException("You are not authorized to prepare payment for this booking");
        }
    }
}