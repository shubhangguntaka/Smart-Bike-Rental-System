package com.sssit.bikerental.modules.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.payment.config.PaymentProperties;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.service.impl.PaymentCalculationServiceImpl;
import com.sssit.bikerental.modules.user.User;

@ExtendWith(MockitoExtension.class)
class PaymentCalculationServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    private PaymentProperties paymentProperties;
    private PaymentCalculationServiceImpl paymentCalculationService;
    private Booking booking;

    @BeforeEach
    void setUp() {
        paymentProperties = new PaymentProperties();
        paymentProperties.setPlatformFeeThreshold(new BigDecimal("1000"));
        paymentProperties.setLowerPlatformFeePercent(new BigDecimal("3"));
        paymentProperties.setUpperPlatformFeePercent(new BigDecimal("5"));
        paymentProperties.setLateGraceMinutes(15);
        paymentProperties.setLateChargeRate(new BigDecimal("50.00"));

        paymentCalculationService = new PaymentCalculationServiceImpl(
                bookingRepository,
                paymentProperties);

        booking = new Booking();
        booking.setId(1L);
        booking.setCustomerId(100L);
        booking.setRentalAmount(new BigDecimal("100"));
        booking.setReturnTime(LocalDateTime.of(2026, 8, 26, 12, 0));
        booking.setBookingStatus(BookingStatus.CONFIRMED);

        authenticateAs(100L, Role.CUSTOMER);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long userId, Role role) {
        User user = User.builder()
                .email("customer@example.com")
                .password("password")
                .role(role)
                .build();
        user.setId(userId);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities()));
    }

    @Nested
    @DisplayName("Base Rental and Duration Tests")
    class BaseRentalTests {

        @Test
        @DisplayName("Should use backend rental amount and calculate final amount accurately")
        void calculatePayment_shouldUseBackendRentalAmountForFinalAmount() {
            booking.setRentalAmount(new BigDecimal("250"));
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("250.00"), response.getBaseRentalAmount());
            assertEquals(new BigDecimal("250.00"), response.getEligibleTransactionAmount());
            assertEquals(new BigDecimal("7.50"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("257.50"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should handle null rental amount by treating it as 0.00")
        void calculatePayment_shouldHandleNullRentalAmount_asZero() {
            booking.setRentalAmount(null);
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("0.00"), response.getBaseRentalAmount());
            assertEquals(new BigDecimal("0.00"), response.getEligibleTransactionAmount());
            assertEquals(new BigDecimal("0.00"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("0.00"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should throw exception when booking is not found")
        void calculatePayment_shouldRejectWhenBookingNotFound() {
            when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> paymentCalculationService.calculatePayment(999L));

            assertEquals("Booking not found with id: 999", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Platform Fee Tier and Threshold Boundary Tests")
    class PlatformFeeTierTests {

        @Test
        @DisplayName("Should apply 3% lower tier when eligible amount is below threshold")
        void calculatePayment_shouldUseThreePercentTierBelowThreshold() {
            booking.setRentalAmount(new BigDecimal("100"));
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(PaymentStatus.READY_FOR_PAYMENT, response.getPaymentStatus());
            assertEquals(new BigDecimal("3"), response.getPlatformFeePercent());
            assertEquals(new BigDecimal("3.00"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("103.00"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should apply 3% lower tier when eligible amount is exactly at threshold (1000.00)")
        void calculatePayment_shouldUseLowerFeeTier_whenEligibleAmountExactlyAtThreshold() {
            booking.setRentalAmount(new BigDecimal("1000.00"));
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("3"), response.getPlatformFeePercent());
            // 1000.00 * 3% = 30.00
            assertEquals(new BigDecimal("30.00"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("1030.00"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should apply 3% lower tier when eligible amount is just below threshold (999.99)")
        void calculatePayment_shouldUseLowerFeeTier_whenEligibleAmountJustBelowThreshold() {
            booking.setRentalAmount(new BigDecimal("999.99"));
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("3"), response.getPlatformFeePercent());
            // 999.99 * 3% = 29.9997 -> 30.00 (HALF_UP)
            assertEquals(new BigDecimal("30.00"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("1029.99"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should apply 5% upper tier when eligible amount is just above threshold (1000.01)")
        void calculatePayment_shouldUseUpperFeeTier_whenEligibleAmountJustAboveThreshold() {
            booking.setRentalAmount(new BigDecimal("1000.01"));
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("5"), response.getPlatformFeePercent());
            // 1000.01 * 5% = 50.0005 -> 50.00 (HALF_UP)
            assertEquals(new BigDecimal("50.00"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("1050.01"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should apply 5% upper tier when eligible amount is well above threshold (1001.00)")
        void calculatePayment_shouldUseFivePercentTierAboveThreshold() {
            booking.setRentalAmount(new BigDecimal("1001.00"));
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("5"), response.getPlatformFeePercent());
            assertEquals(new BigDecimal("50.05"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("1051.05"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should dynamically use custom configured platform fee threshold and percentages")
        void calculatePayment_shouldRespectDynamicThresholdConfiguration() {
            paymentProperties.setPlatformFeeThreshold(new BigDecimal("500.00"));
            paymentProperties.setLowerPlatformFeePercent(new BigDecimal("2.5"));
            paymentProperties.setUpperPlatformFeePercent(new BigDecimal("6.0"));

            booking.setRentalAmount(new BigDecimal("600.00"));
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("6.0"), response.getPlatformFeePercent());
            // 600.00 * 6.0% = 36.00
            assertEquals(new BigDecimal("36.00"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("636.00"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should reject when platform fee threshold configuration is missing")
        void calculatePayment_shouldRejectMissingPlatformFeeThresholdConfiguration() {
            booking.setActualReturnTime(booking.getReturnTime());
            paymentProperties.setPlatformFeeThreshold(null);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            IllegalStateException exception = assertThrows(
                    IllegalStateException.class,
                    () -> paymentCalculationService.calculatePayment(1L));

            assertEquals(
                    "Payment platform fee configuration is missing: threshold, lower fee, and upper fee are required",
                    exception.getMessage());
        }

        @Test
        @DisplayName("Should reject when lower platform fee percent is missing")
        void calculatePayment_shouldRejectMissingLowerFeePercentConfiguration() {
            booking.setActualReturnTime(booking.getReturnTime());
            paymentProperties.setLowerPlatformFeePercent(null);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            IllegalStateException exception = assertThrows(
                    IllegalStateException.class,
                    () -> paymentCalculationService.calculatePayment(1L));

            assertEquals(
                    "Payment platform fee configuration is missing: threshold, lower fee, and upper fee are required",
                    exception.getMessage());
        }

        @Test
        @DisplayName("Should reject when upper platform fee percent is missing")
        void calculatePayment_shouldRejectMissingUpperFeePercentConfiguration() {
            booking.setActualReturnTime(booking.getReturnTime());
            paymentProperties.setUpperPlatformFeePercent(null);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            IllegalStateException exception = assertThrows(
                    IllegalStateException.class,
                    () -> paymentCalculationService.calculatePayment(1L));

            assertEquals(
                    "Payment platform fee configuration is missing: threshold, lower fee, and upper fee are required",
                    exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Late Charge Calculation and Grace Period Tests")
    class LateChargeTests {

        @Test
        @DisplayName("Should have zero late charge when customer returns before scheduled time")
        void calculatePayment_shouldHaveZeroLateCharge_whenReturnedBeforeScheduledTime() {
            // Scheduled: 12:00, Actual: 11:30 (30 mins early)
            booking.setActualReturnTime(booking.getReturnTime().minusMinutes(30));
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("0.00"), response.getLateCharge());
            assertEquals(new BigDecimal("100.00"), response.getEligibleTransactionAmount());
            assertEquals(new BigDecimal("3.00"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("103.00"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should have zero late charge when customer returns exactly at scheduled time")
        void calculatePayment_shouldHaveZeroLateCharge_whenReturnedExactlyAtScheduledTime() {
            // Scheduled: 12:00, Actual: 12:00
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("0.00"), response.getLateCharge());
            assertEquals(new BigDecimal("100.00"), response.getEligibleTransactionAmount());
        }

        @Test
        @DisplayName("Should have zero late charge when customer returns exactly at end of grace period")
        void calculatePayment_shouldHaveZeroLateCharge_whenReturnedExactlyAtEndOfGracePeriod() {
            // Scheduled: 12:00, Grace: 15 min -> Allowed: 12:15. Actual: 12:15
            paymentProperties.setLateGraceMinutes(15);
            booking.setActualReturnTime(booking.getReturnTime().plusMinutes(15));
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("0.00"), response.getLateCharge());
            assertEquals(new BigDecimal("100.00"), response.getEligibleTransactionAmount());
        }

        @Test
        @DisplayName("Should apply configured late charge when returned 1 minute after grace period")
        void calculatePayment_shouldApplyLateCharge_whenReturnedOneMinuteAfterGracePeriod() {
            // Scheduled: 12:00, Grace: 15 min -> Allowed: 12:15. Actual: 12:16 (1 min late)
            paymentProperties.setLateGraceMinutes(15);
            paymentProperties.setLateChargeRate(new BigDecimal("50.00"));
            booking.setActualReturnTime(booking.getReturnTime().plusMinutes(16));
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("50.00"), response.getLateCharge());
            assertEquals(new BigDecimal("150.00"), response.getEligibleTransactionAmount());
            assertEquals(new BigDecimal("4.50"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("154.50"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should apply configured late charge when returned significantly past grace period")
        void calculatePayment_shouldIncludeLateChargeWhenReturnedPastGracePeriod() {
            // Scheduled: 12:00, Grace: 15 min -> Allowed: 12:15. Actual: 13:00 (45 mins past grace)
            paymentProperties.setLateGraceMinutes(15);
            paymentProperties.setLateChargeRate(new BigDecimal("50.00"));
            booking.setActualReturnTime(booking.getReturnTime().plusMinutes(60));
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("50.00"), response.getLateCharge());
            assertEquals(new BigDecimal("150.00"), response.getEligibleTransactionAmount());
            assertEquals(new BigDecimal("4.50"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("154.50"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Should have zero late charge when grace minutes is unconfigured or negative")
        void calculatePayment_shouldHaveZeroLateCharge_whenGraceMinutesNullOrNegative() {
            paymentProperties.setLateGraceMinutes(null);
            booking.setActualReturnTime(booking.getReturnTime().plusMinutes(60));
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("0.00"), response.getLateCharge());
        }

        @Test
        @DisplayName("Should have zero late charge when late charge rate is unconfigured or non-positive")
        void calculatePayment_shouldHaveZeroLateCharge_whenLateRateNullOrZero() {
            paymentProperties.setLateChargeRate(BigDecimal.ZERO);
            booking.setActualReturnTime(booking.getReturnTime().plusMinutes(60));
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("0.00"), response.getLateCharge());
        }

        @Test
        @DisplayName("Should dynamically use custom configured late charge rate")
        void calculatePayment_shouldUseConfiguredLateChargeRate() {
            paymentProperties.setLateChargeRate(new BigDecimal("75.50"));
            booking.setActualReturnTime(booking.getReturnTime().plusMinutes(30));
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("75.50"), response.getLateCharge());
            assertEquals(new BigDecimal("175.50"), response.getEligibleTransactionAmount());
        }

        @Test
        @DisplayName("Should have zero late charge when scheduled return time is null")
        void calculatePayment_shouldHaveZeroLateCharge_whenScheduledReturnTimeIsNull() {
            booking.setReturnTime(null);
            booking.setActualReturnTime(LocalDateTime.now());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("0.00"), response.getLateCharge());
        }
    }

    @Nested
    @DisplayName("Payment Preparation and Return Confirmation Validation")
    class PreparationValidationTests {

        @Test
        @DisplayName("Should reject payment preparation when bike return is not confirmed (pre-return active booking)")
        void calculatePayment_shouldRejectWhenReturnIsNotConfirmed() {
            booking.setActualReturnTime(null);
            booking.setBookingStatus(BookingStatus.ACTIVE);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> paymentCalculationService.calculatePayment(1L));

            assertEquals(
                    "Payment cannot be prepared before bike return is confirmed",
                    exception.getMessage());
        }

        @Test
        @DisplayName("Owner approval alone without return confirmation must NOT allow payment preparation")
        void calculatePayment_shouldRejectOwnerApprovalAlone_withoutReturnTime() {
            booking.setBookingStatus(BookingStatus.APPROVED);
            booking.setActualReturnTime(null);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> paymentCalculationService.calculatePayment(1L));

            assertEquals(
                    "Payment cannot be prepared before bike return is confirmed",
                    exception.getMessage());
        }

        @Test
        @DisplayName("Missing actualReturnTime must NOT unlock payment even if booking is marked COMPLETED")
        void calculatePayment_shouldRejectWhenActualReturnTimeIsMissingEvenIfCompletedStatus() {
            booking.setBookingStatus(BookingStatus.COMPLETED);
            booking.setActualReturnTime(null);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> paymentCalculationService.calculatePayment(1L));

            assertEquals(
                    "Payment cannot be prepared before bike return is confirmed",
                    exception.getMessage());
        }

        @Test
        @DisplayName("Confirmed return with actualReturnTime allows payment preparation")
        void calculatePayment_shouldAllowWhenConfirmedReturnExists() {
            booking.setBookingStatus(BookingStatus.COMPLETED);
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertNotNull(response);
            assertEquals(PaymentStatus.READY_FOR_PAYMENT, response.getPaymentStatus());
        }
    }

    @Nested
    @DisplayName("Authorization and Ownership Security Tests")
    class SecurityTests {

        @Test
        @DisplayName("Should reject when customer attempts to prepare payment for another customer's booking")
        void calculatePayment_shouldRejectUnauthorizedCustomer() {
            booking.setCustomerId(999L);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            assertThrows(
                    AccessDeniedException.class,
                    () -> paymentCalculationService.calculatePayment(1L));
        }

        @Test
        @DisplayName("Should allow Admin role to prepare payment for any customer's booking")
        void calculatePayment_shouldAllowAdminRole_forAnyCustomerBooking() {
            authenticateAs(999L, Role.ADMIN);
            booking.setCustomerId(100L);
            booking.setActualReturnTime(booking.getReturnTime());
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertNotNull(response);
            assertEquals(PaymentStatus.READY_FOR_PAYMENT, response.getPaymentStatus());
        }

        @Test
        @DisplayName("Should reject when unauthenticated request attempts to calculate payment")
        void calculatePayment_shouldRejectWhenUnauthenticated() {
            SecurityContextHolder.clearContext();
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            assertThrows(
                    AccessDeniedException.class,
                    () -> paymentCalculationService.calculatePayment(1L));
        }
    }

    @Nested
    @DisplayName("Early Return and Actual Duration Billing Tests")
    class EarlyReturnAndActualUsageTests {

        @Test
        @DisplayName("Scenario 1: 4-hour booking returned after 2 hours should calculate reduced rental charge")
        void earlyReturn_4HourBookingReturnedAfter2Hours_shouldReduceRentalAmount() {
            booking.setStartTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setReturnTime(LocalDateTime.of(2026, 8, 26, 14, 0));
            booking.setRentalAmount(new BigDecimal("200.00")); // 50.00/hour
            booking.setActualPickupTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setActualReturnTime(LocalDateTime.of(2026, 8, 26, 12, 0)); // 2 hours used

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("100.00"), response.getBaseRentalAmount());
            assertEquals(new BigDecimal("0.00"), response.getLateCharge());
            assertEquals(new BigDecimal("100.00"), response.getEligibleTransactionAmount());
            assertEquals(new BigDecimal("3"), response.getPlatformFeePercent());
            assertEquals(new BigDecimal("3.00"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("103.00"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Scenario 2: Booking returned exactly at scheduled return time charges full scheduled amount")
        void onTimeReturn_shouldChargeFullScheduledAmount() {
            booking.setStartTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setReturnTime(LocalDateTime.of(2026, 8, 26, 14, 0));
            booking.setRentalAmount(new BigDecimal("200.00"));
            booking.setActualPickupTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setActualReturnTime(LocalDateTime.of(2026, 8, 26, 14, 0));

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("200.00"), response.getBaseRentalAmount());
            assertEquals(new BigDecimal("0.00"), response.getLateCharge());
            assertEquals(new BigDecimal("200.00"), response.getEligibleTransactionAmount());
            assertEquals(new BigDecimal("6.00"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("206.00"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Scenario 3: Booking returned 1 minute before scheduled return calculates accurate duration")
        void earlyReturn_oneMinuteBeforeScheduledReturn_shouldCalculateAccurateAmount() {
            booking.setStartTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setReturnTime(LocalDateTime.of(2026, 8, 26, 14, 0)); // 240 mins
            booking.setRentalAmount(new BigDecimal("200.00")); // 50.00/hour
            booking.setActualPickupTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setActualReturnTime(LocalDateTime.of(2026, 8, 26, 13, 59)); // 239 mins

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            // 239 / 60 * 50 = 199.1666... -> 199.17
            assertEquals(new BigDecimal("199.17"), response.getBaseRentalAmount());
            assertEquals(new BigDecimal("0.00"), response.getLateCharge());
            assertEquals(new BigDecimal("199.17"), response.getEligibleTransactionAmount());
        }

        @Test
        @DisplayName("Scenario 4: Booking returned after scheduled return but within grace period has no late charge")
        void returnWithinGracePeriod_shouldChargeScheduledAmount_withoutLateCharge() {
            booking.setStartTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setReturnTime(LocalDateTime.of(2026, 8, 26, 14, 0));
            booking.setRentalAmount(new BigDecimal("200.00"));
            booking.setActualPickupTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setActualReturnTime(LocalDateTime.of(2026, 8, 26, 14, 10)); // within 15 min grace

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("200.00"), response.getBaseRentalAmount());
            assertEquals(new BigDecimal("0.00"), response.getLateCharge());
            assertEquals(new BigDecimal("200.00"), response.getEligibleTransactionAmount());
            assertEquals(new BigDecimal("206.00"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Scenario 5: Booking returned after grace period charges scheduled amount plus late charge")
        void lateReturnPastGracePeriod_shouldChargeScheduledAmount_plusLateCharge() {
            booking.setStartTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setReturnTime(LocalDateTime.of(2026, 8, 26, 14, 0));
            booking.setRentalAmount(new BigDecimal("200.00"));
            booking.setActualPickupTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setActualReturnTime(LocalDateTime.of(2026, 8, 26, 14, 30)); // 30 min late

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("200.00"), response.getBaseRentalAmount());
            assertEquals(new BigDecimal("50.00"), response.getLateCharge());
            assertEquals(new BigDecimal("250.00"), response.getEligibleTransactionAmount());
            assertEquals(new BigDecimal("7.50"), response.getPlatformFeeAmount()); // 3% of 250
            assertEquals(new BigDecimal("257.50"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Scenario 6: Very short actual rental duration calculates proportionally")
        void earlyReturn_veryShortRentalDuration_shouldChargeAccurately() {
            booking.setStartTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setReturnTime(LocalDateTime.of(2026, 8, 26, 14, 0));
            booking.setRentalAmount(new BigDecimal("200.00"));
            booking.setActualPickupTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setActualReturnTime(LocalDateTime.of(2026, 8, 26, 10, 0)); // 0 minutes

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("0.00"), response.getBaseRentalAmount());
            assertEquals(new BigDecimal("0.00"), response.getEligibleTransactionAmount());
            assertEquals(new BigDecimal("0.00"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Scenario 7: Missing actualPickupTime safely falls back to scheduled startTime")
        void earlyReturn_missingActualPickupTime_fallsBackToScheduledStartTime() {
            booking.setStartTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setReturnTime(LocalDateTime.of(2026, 8, 26, 14, 0));
            booking.setRentalAmount(new BigDecimal("200.00"));
            booking.setActualPickupTime(null); // missing pickup time
            booking.setActualReturnTime(LocalDateTime.of(2026, 8, 26, 12, 0)); // 2 hours

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("100.00"), response.getBaseRentalAmount());
            assertEquals(new BigDecimal("103.00"), response.getFinalAmount());
        }

        @Test
        @DisplayName("Scenario 8: Early return causing eligible amount to cross below threshold applies lower platform fee tier")
        void earlyReturn_crossingThreshold_appliesLowerPlatformFeeTier() {
            booking.setStartTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setReturnTime(LocalDateTime.of(2026, 8, 27, 10, 0)); // 24 hours
            booking.setRentalAmount(new BigDecimal("1200.00")); // 50/hour, above 1000 threshold
            booking.setActualPickupTime(LocalDateTime.of(2026, 8, 26, 10, 0));
            booking.setActualReturnTime(LocalDateTime.of(2026, 8, 26, 20, 0)); // 10 hours used = 500.00

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentCalculationService.calculatePayment(1L);

            assertEquals(new BigDecimal("500.00"), response.getBaseRentalAmount());
            assertEquals(new BigDecimal("500.00"), response.getEligibleTransactionAmount());
            // 500.00 is <= 1000 threshold, so 3% applies instead of 5%
            assertEquals(new BigDecimal("3"), response.getPlatformFeePercent());
            assertEquals(new BigDecimal("15.00"), response.getPlatformFeeAmount());
            assertEquals(new BigDecimal("515.00"), response.getFinalAmount());
        }
    }
}
