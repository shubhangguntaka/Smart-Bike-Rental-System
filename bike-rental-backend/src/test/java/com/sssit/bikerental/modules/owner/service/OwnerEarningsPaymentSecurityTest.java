package com.sssit.bikerental.modules.owner.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.exception.ResourceNotFoundException;
import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.owner.dto.OwnerEarningsSummaryDTO;
import com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO;
import com.sssit.bikerental.modules.owner.service.serviceimpl.OwnerServiceImpl;
import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.bikedocument.repository.BikeDocumentRepository;

@ExtendWith(MockitoExtension.class)
public class OwnerEarningsPaymentSecurityTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BikeRepository bikeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AadhaarRepository aadhaarRepository;

    @Mock
    private BikeDocumentRepository bikeDocumentRepository;

    @InjectMocks
    private OwnerServiceImpl ownerService;

    private MockedStatic<SecurityUtils> securityUtilsMock;

    private final Long OWNER_ID = 100L;
    private final Long OTHER_OWNER_ID = 200L;
    private final Long CUSTOMER_ID = 300L;

    private User ownerUser;
    private User customerUser;
    private Bike bike;
    private Booking booking;
    private Payment successfulPayment;
    private Payment pendingPayment;
    private Payment failedPayment;

    @BeforeEach
    void setUp() {
        securityUtilsMock = Mockito.mockStatic(SecurityUtils.class);

        ownerUser = User.builder()
                .firstName("Rajesh")
                .lastName("Sharma")
                .email("rajesh.owner@test.com")
                .role(Role.OWNER)
                .build();
        ownerUser.setId(OWNER_ID);

        customerUser = User.builder()
                .firstName("Anita")
                .lastName("Roy")
                .email("anita.cust@test.com")
                .phoneNumber("+919876543210")
                .role(Role.CUSTOMER)
                .build();
        customerUser.setId(CUSTOMER_ID);

        bike = Bike.builder()
                .bikeId(10L)
                .ownerId(OWNER_ID)
                .bikeName("Royal Enfield Classic 350")
                .model("Classic 350")
                .registrationNumber("TS09AB1234")
                .build();

        booking = Booking.builder()
                .bikeId(10L)
                .customerId(CUSTOMER_ID)
                .startTime(LocalDateTime.now().minusDays(2))
                .returnTime(LocalDateTime.now().minusDays(1))
                .actualPickupTime(LocalDateTime.now().minusDays(2))
                .actualReturnTime(LocalDateTime.now().minusDays(1))
                .rentalAmount(new BigDecimal("1200.00"))
                .bookingStatus(BookingStatus.COMPLETED)
                .paymentStatus(com.sssit.bikerental.modules.booking.enums.PaymentStatus.SUCCESS)
                .build();
        booking.setId(50L);

        successfulPayment = Payment.builder()
                .paymentId(1L)
                .bookingId(50L)
                .customerId(CUSTOMER_ID)
                .baseRentalAmount(new BigDecimal("1200.00"))
                .lateCharge(new BigDecimal("50.00"))
                .eligibleTransactionAmount(new BigDecimal("1250.00"))
                .platformFeePercent(new BigDecimal("5.00"))
                .platformFeeAmount(new BigDecimal("62.50"))
                .taxAmount(BigDecimal.ZERO)
                .finalAmount(new BigDecimal("1312.50"))
                .paymentStatus(PaymentStatus.SUCCESS)
                .paymentMethod("UPI")
                .transactionId("pay_RZP987654321")
                .razorpayOrderId("order_RZP123456789")
                .razorpayPaymentId("pay_RZP987654321")
                .invoiceNumber("INV-50-1")
                .paidAt(LocalDateTime.now().minusDays(1))
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        pendingPayment = Payment.builder()
                .paymentId(2L)
                .bookingId(50L)
                .customerId(CUSTOMER_ID)
                .baseRentalAmount(new BigDecimal("800.00"))
                .lateCharge(BigDecimal.ZERO)
                .eligibleTransactionAmount(new BigDecimal("800.00"))
                .platformFeePercent(new BigDecimal("3.00"))
                .platformFeeAmount(new BigDecimal("24.00"))
                .taxAmount(BigDecimal.ZERO)
                .finalAmount(new BigDecimal("824.00"))
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod("Razorpay Online")
                .razorpayOrderId("order_PENDING_001")
                .createdAt(LocalDateTime.now())
                .build();

        failedPayment = Payment.builder()
                .paymentId(3L)
                .bookingId(50L)
                .customerId(CUSTOMER_ID)
                .baseRentalAmount(new BigDecimal("500.00"))
                .lateCharge(BigDecimal.ZERO)
                .eligibleTransactionAmount(new BigDecimal("500.00"))
                .platformFeePercent(new BigDecimal("3.00"))
                .platformFeeAmount(new BigDecimal("15.00"))
                .taxAmount(BigDecimal.ZERO)
                .finalAmount(new BigDecimal("515.00"))
                .paymentStatus(PaymentStatus.FAILED)
                .createdAt(LocalDateTime.now().minusHours(5))
                .build();
    }

    @AfterEach
    void tearDown() {
        if (securityUtilsMock != null) {
            securityUtilsMock.close();
        }
    }

    @Nested
    @DisplayName("1. Owner Authorization & Data Isolation Tests")
    class AuthorizationAndIsolationTests {

        @Test
        @DisplayName("Owner can see payments for own bikes")
        void testOwnerCanSeePaymentsForOwnBikes() {
            securityUtilsMock.when(SecurityUtils::getCurrentUserId).thenReturn(OWNER_ID);
            securityUtilsMock.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(paymentRepository.findAllPaymentsByOwnerId(OWNER_ID)).thenReturn(List.of(successfulPayment));
            when(userRepository.findById(CUSTOMER_ID)).thenReturn(Optional.of(customerUser));
            when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(bike));

            List<OwnerPaymentDTO> payments = ownerService.getOwnerPayments(OWNER_ID, "ALL");

            assertNotNull(payments);
            assertEquals(1, payments.size());
            OwnerPaymentDTO dto = payments.get(0);
            assertEquals(1L, dto.getPaymentId());
            assertEquals(50L, dto.getBookingId());
            assertEquals("Anita Roy", dto.getCustomerName());
            assertEquals("Royal Enfield Classic 350", dto.getBikeName());
            assertEquals(PaymentStatus.SUCCESS, dto.getPaymentStatus());
        }

        @Test
        @DisplayName("Owner cannot see another owner's payment (404/Access Denied)")
        void testOwnerCannotSeeAnotherOwnersPayment() {
            securityUtilsMock.when(SecurityUtils::getCurrentUserId).thenReturn(OWNER_ID);
            securityUtilsMock.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(paymentRepository.findPaymentByOwnerIdAndPaymentId(OWNER_ID, 999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> {
                ownerService.getOwnerPaymentById(OWNER_ID, 999L);
            });
        }

        @Test
        @DisplayName("Owner payment query properly filters by owner ID in repository")
        void testOwnerPaymentQueryEnforcesOwnerId() {
            when(paymentRepository.findAllPaymentsByOwnerId(OTHER_OWNER_ID)).thenReturn(List.of());

            List<OwnerPaymentDTO> payments = ownerService.getOwnerPayments(OTHER_OWNER_ID, "ALL");

            assertNotNull(payments);
            assertTrue(payments.isEmpty());
            verify(paymentRepository).findAllPaymentsByOwnerId(OTHER_OWNER_ID);
        }
    }

    @Nested
    @DisplayName("2. Financial Calculation & Billing Consistency Tests")
    class FinancialCalculationTests {

        @Test
        @DisplayName("Successful payment calculates authoritative Owner Earnings and Customer Paid")
        void testSuccessfulPaymentCalculations() {
            when(paymentRepository.findAllPaymentsByOwnerId(OWNER_ID)).thenReturn(List.of(successfulPayment));
            when(userRepository.findById(CUSTOMER_ID)).thenReturn(Optional.of(customerUser));
            when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(bike));

            List<OwnerPaymentDTO> payments = ownerService.getOwnerPayments(OWNER_ID, "ALL");
            OwnerPaymentDTO dto = payments.get(0);

            // Customer Paid = 1312.50
            assertEquals(new BigDecimal("1312.50"), dto.getFinalAmount());
            // Platform Fee = 62.50
            assertEquals(new BigDecimal("62.50"), dto.getPlatformFeeAmount());
            // Owner Net Earnings = baseRentalAmount (1200) + lateCharge (50) = 1250.00
            assertEquals(new BigDecimal("1250.00"), dto.getOwnerEarnings());
            assertEquals(new BigDecimal("1200.00"), dto.getBaseRentalAmount());
            assertEquals(new BigDecimal("50.00"), dto.getLateCharge());
        }

        @Test
        @DisplayName("Summary metrics only count SUCCESS payments in earnings")
        void testSummaryMetricsOnlyCountSuccessPayments() {
            when(paymentRepository.findAllPaymentsByOwnerId(OWNER_ID))
                    .thenReturn(List.of(successfulPayment, pendingPayment, failedPayment));

            OwnerEarningsSummaryDTO summary = ownerService.getOwnerEarningsSummary(OWNER_ID);

            assertNotNull(summary);
            // Only 1 successful payment
            assertEquals(1L, summary.getTotalSuccessfulPayments());
            assertEquals(1L, summary.getTotalPendingPayments());

            // Earnings should only sum SUCCESS payment: 1200 + 50 = 1250.00
            assertEquals(new BigDecimal("1250.00"), summary.getTotalEarnings());
            // Customer Paid for SUCCESS: 1312.50
            assertEquals(new BigDecimal("1312.50"), summary.getTotalCustomerPaid());
            // Platform Fee for SUCCESS: 62.50
            assertEquals(new BigDecimal("62.50"), summary.getTotalPlatformFees());
            // Base rental for SUCCESS: 1200.00
            assertEquals(new BigDecimal("1200.00"), summary.getTotalRentalAmount());
            // Late charges for SUCCESS: 50.00
            assertEquals(new BigDecimal("50.00"), summary.getTotalLateCharges());
        }

        @Test
        @DisplayName("Failed or Processing payments do NOT count toward successful earnings")
        void testFailedAndProcessingPaymentsExcludedFromEarnings() {
            when(paymentRepository.findAllPaymentsByOwnerId(OWNER_ID))
                    .thenReturn(List.of(pendingPayment, failedPayment));

            OwnerEarningsSummaryDTO summary = ownerService.getOwnerEarningsSummary(OWNER_ID);

            assertEquals(BigDecimal.ZERO, summary.getTotalEarnings());
            assertEquals(BigDecimal.ZERO, summary.getTotalCustomerPaid());
            assertEquals(0L, summary.getTotalSuccessfulPayments());
            assertEquals(1L, summary.getTotalPendingPayments());
        }
    }

    @Nested
    @DisplayName("3. Razorpay Gateway Fields & Internal Metadata Tests")
    class RazorpayAndMetadataTests {

        @Test
        @DisplayName("Razorpay Order ID, Payment ID, Method, and Invoice Number are returned")
        void testRazorpayFieldsPreserved() {
            when(paymentRepository.findPaymentByOwnerIdAndPaymentId(OWNER_ID, 1L)).thenReturn(Optional.of(successfulPayment));
            when(userRepository.findById(CUSTOMER_ID)).thenReturn(Optional.of(customerUser));
            when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(bike));

            OwnerPaymentDTO dto = ownerService.getOwnerPaymentById(OWNER_ID, 1L);

            assertNotNull(dto);
            assertEquals("order_RZP123456789", dto.getRazorpayOrderId());
            assertEquals("pay_RZP987654321", dto.getRazorpayPaymentId());
            assertEquals("pay_RZP987654321", dto.getTransactionId());
            assertEquals("UPI", dto.getPaymentMethod());
            assertEquals("INV-50-1", dto.getInvoiceNumber());
            assertNotNull(dto.getPaidAt());
        }

        @Test
        @DisplayName("Filtering by status returns only payments matching the requested status")
        void testFilteringByStatus() {
            when(paymentRepository.findPaymentsByOwnerIdAndStatus(OWNER_ID, PaymentStatus.SUCCESS))
                    .thenReturn(List.of(successfulPayment));
            when(userRepository.findById(CUSTOMER_ID)).thenReturn(Optional.of(customerUser));
            when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(bike));

            List<OwnerPaymentDTO> payments = ownerService.getOwnerPayments(OWNER_ID, "SUCCESS");

            assertEquals(1, payments.size());
            assertEquals(PaymentStatus.SUCCESS, payments.get(0).getPaymentStatus());
            verify(paymentRepository).findPaymentsByOwnerIdAndStatus(OWNER_ID, PaymentStatus.SUCCESS);
        }
    }
}
