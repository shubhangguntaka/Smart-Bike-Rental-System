package com.sssit.bikerental.modules.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.booking.entity.Booking;
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

        paymentCalculationService = new PaymentCalculationServiceImpl(
                bookingRepository,
                paymentProperties);

        booking = new Booking();
        booking.setId(1L);
        booking.setCustomerId(100L);
        booking.setRentalAmount(new BigDecimal("100"));
        booking.setReturnTime(LocalDateTime.of(2026, 8, 26, 12, 0));

        User user = User.builder()
                .email("customer@example.com")
                .password("password")
                .role(Role.CUSTOMER)
                .build();
        user.setId(100L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities()));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void calculatePayment_shouldRejectWhenReturnIsNotConfirmed() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> paymentCalculationService.calculatePayment(1L));

        assertEquals(
                "Payment cannot be prepared before bike return is confirmed",
                exception.getMessage());
    }

    @Test
    void calculatePayment_shouldUseThreePercentTierAfterReturnConfirmation() {
        booking.setActualReturnTime(booking.getReturnTime());
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        PaymentResponse response = paymentCalculationService.calculatePayment(1L);

        assertEquals(PaymentStatus.READY_FOR_PAYMENT, response.getPaymentStatus());
        assertEquals(new BigDecimal("3"), response.getPlatformFeePercent());
        assertEquals(new BigDecimal("3.00"), response.getPlatformFeeAmount());
        assertEquals(new BigDecimal("103.00"), response.getFinalAmount());
    }

    @Test
    void calculatePayment_shouldUseFivePercentTierAboveThreshold() {
        booking.setRentalAmount(new BigDecimal("1001"));
        booking.setActualReturnTime(booking.getReturnTime());
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        PaymentResponse response = paymentCalculationService.calculatePayment(1L);

        assertEquals(new BigDecimal("5"), response.getPlatformFeePercent());
        assertEquals(new BigDecimal("50.05"), response.getPlatformFeeAmount());
        assertEquals(new BigDecimal("1051.05"), response.getFinalAmount());
    }

    @Test
    void calculatePayment_shouldUseBackendRentalAmountForFinalAmount() {
        booking.setRentalAmount(new BigDecimal("250"));
        booking.setActualReturnTime(booking.getReturnTime());
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        PaymentResponse response = paymentCalculationService.calculatePayment(1L);

        assertEquals(new BigDecimal("250.00"), response.getBaseRentalAmount());
        assertEquals(new BigDecimal("257.50"), response.getFinalAmount());
    }

    @Test
    void calculatePayment_shouldRejectMissingPlatformFeeConfiguration() {
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
    void calculatePayment_shouldIncludeLateChargeWhenReturnedPastGracePeriod() {
        // Scheduled: 12:00, Grace: 15 min -> Allowed: 12:15. Actual: 13:00 -> 45 min late (1 hour billed)
        paymentProperties.setLateGraceMinutes(15);
        paymentProperties.setLateChargeRate(new BigDecimal("50.00"));
        booking.setActualReturnTime(booking.getReturnTime().plusMinutes(60));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        PaymentResponse response = paymentCalculationService.calculatePayment(1L);

        assertEquals(new BigDecimal("50.00"), response.getLateCharge());
        // Base: 100, Late: 50 -> Eligible: 150. Platform fee 3%: 4.50 -> Final: 154.50
        assertEquals(new BigDecimal("150.00"), response.getEligibleTransactionAmount());
        assertEquals(new BigDecimal("4.50"), response.getPlatformFeeAmount());
        assertEquals(new BigDecimal("154.50"), response.getFinalAmount());
    }
}
