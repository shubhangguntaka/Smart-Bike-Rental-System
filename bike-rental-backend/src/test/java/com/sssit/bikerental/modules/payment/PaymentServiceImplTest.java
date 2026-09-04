package com.sssit.bikerental.modules.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.payment.dto.InvoiceDTO;
import com.sssit.bikerental.modules.payment.dto.PaymentRequest;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.gateway.RazorpayGateway;
import com.sssit.bikerental.modules.payment.mapper.PaymentMapper;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;
import com.sssit.bikerental.modules.payment.service.PaymentCalculationService;
import com.sssit.bikerental.modules.payment.service.impl.PaymentServiceImpl;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentCalculationService paymentCalculationService;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private RazorpayGateway razorpayGateway;

    private PaymentServiceImpl paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentServiceImpl(
                paymentRepository,
                bookingRepository,
                userRepository,
                paymentCalculationService,
                paymentMapper,
                razorpayGateway);
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
                        user, null, user.getAuthorities()));
    }

    private PaymentResponse calculation(
            Long bookingId, Long customerId, String finalAmount) {
        return PaymentResponse.builder()
                .bookingId(bookingId)
                .customerId(customerId)
                .baseRentalAmount(new BigDecimal("100.00"))
                .lateCharge(BigDecimal.ZERO.setScale(2))
                .eligibleTransactionAmount(new BigDecimal(finalAmount))
                .platformFeePercent(new BigDecimal("3"))
                .platformFeeAmount(new BigDecimal("3.00"))
                .taxAmount(BigDecimal.ZERO.setScale(2))
                .finalAmount(new BigDecimal(finalAmount))
                .build();
    }

    private Payment payment(Long paymentId, Long customerId, PaymentStatus status) {
        return Payment.builder()
                .paymentId(paymentId)
                .bookingId(1L)
                .customerId(customerId)
                .finalAmount(new BigDecimal("125.00"))
                .paymentStatus(status)
                .razorpayOrderId("order_test_1")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private PaymentRequest request(String signature) {
        PaymentRequest request = new PaymentRequest();
        request.setPaymentId(10L);
        request.setPaymentMethod("card");
        request.setRazorpayOrderId("order_test_1");
        request.setRazorpayPaymentId("pay_test_1");
        request.setRazorpaySignature(signature);
        return request;
    }

    private PaymentResponse response(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .paymentStatus(payment.getPaymentStatus())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .finalAmount(payment.getFinalAmount())
                .build();
    }

    @Nested
    @DisplayName("Payment Preparation Tests")
    class PreparePaymentTests {

        @Test
        @DisplayName("Should block payment preparation before return confirmation")
        void preparePayment_shouldRemainBlockedBeforeConfirmedReturn() throws Exception {
            when(paymentCalculationService.calculatePayment(1L))
                    .thenThrow(new RuntimeException(
                            "Payment cannot be prepared before bike return is confirmed"));

            assertThrows(RuntimeException.class,
                    () -> paymentService.preparePayment(1L));

            verify(razorpayGateway, never()).createOrder(
                    any(), any(), any());
        }

        @Test
        @DisplayName("Should create READY_FOR_PAYMENT record and Razorpay order successfully")
        void preparePayment_shouldCreatePendingOrderAndPersistOrderId() throws Exception {
            PaymentResponse calculation = calculation(1L, 100L, "125.00");
            when(paymentCalculationService.calculatePayment(1L))
                    .thenReturn(calculation);
            when(paymentRepository.findByBookingId(1L))
                    .thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class)))
                    .thenAnswer(invocation -> {
                        Payment payment = invocation.getArgument(0);
                        if (payment.getPaymentId() == null) {
                            payment.setPaymentId(10L);
                        }
                        return payment;
                    });
            when(razorpayGateway.createOrder(
                    eq(10L), eq(new BigDecimal("125.00")), eq("booking_1")))
                    .thenReturn("order_test_1");
            when(paymentMapper.toResponse(any(Payment.class)))
                    .thenAnswer(invocation -> response(invocation.getArgument(0)));

            PaymentResponse response = paymentService.preparePayment(1L);

            assertEquals(PaymentStatus.READY_FOR_PAYMENT, response.getPaymentStatus());
            assertEquals("order_test_1", response.getRazorpayOrderId());
            verify(razorpayGateway).createOrder(
                    10L, new BigDecimal("125.00"), "booking_1");
        }

        @Test
        @DisplayName("Should reuse existing READY_FOR_PAYMENT order without regenerating Razorpay order")
        void preparePayment_shouldReuseExistingReadyOrder_withoutRegenerating() throws Exception {
            Payment existingPayment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);
            existingPayment.setRazorpayOrderId("order_existing_123");

            when(paymentCalculationService.calculatePayment(1L))
                    .thenReturn(calculation(1L, 100L, "125.00"));
            when(paymentRepository.findByBookingId(1L))
                    .thenReturn(Optional.of(existingPayment));
            when(paymentMapper.toResponse(existingPayment))
                    .thenReturn(response(existingPayment));

            PaymentResponse response = paymentService.preparePayment(1L);

            assertEquals(PaymentStatus.READY_FOR_PAYMENT, response.getPaymentStatus());
            assertEquals("order_existing_123", response.getRazorpayOrderId());
            verify(razorpayGateway, never()).createOrder(any(), any(), any());
        }

        @Test
        @DisplayName("Should use authoritative backend calculated amount for Razorpay order")
        void preparePayment_shouldUseBackendCalculatedAmount() throws Exception {
            PaymentResponse calculation = calculation(1L, 100L, "125.00");
            when(paymentCalculationService.calculatePayment(1L))
                    .thenReturn(calculation);
            when(paymentRepository.findByBookingId(1L))
                    .thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class)))
                    .thenAnswer(invocation -> {
                        Payment payment = invocation.getArgument(0);
                        payment.setPaymentId(10L);
                        return payment;
                    });
            when(razorpayGateway.createOrder(any(), any(), any()))
                    .thenReturn("order_test_1");
            when(paymentMapper.toResponse(any(Payment.class)))
                    .thenReturn(PaymentResponse.builder().build());

            paymentService.preparePayment(1L);

            verify(razorpayGateway).createOrder(
                    eq(10L), eq(new BigDecimal("125.00")), eq("booking_1"));
        }

        @Test
        @DisplayName("Should gracefully handle Razorpay gateway failure with fallback mock order")
        void preparePayment_shouldGracefullyFallbackToMockOrder_whenGatewayFails() throws Exception {
            PaymentResponse calculation = calculation(1L, 100L, "125.00");
            when(paymentCalculationService.calculatePayment(1L))
                    .thenReturn(calculation);
            when(paymentRepository.findByBookingId(1L))
                    .thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class)))
                    .thenAnswer(invocation -> {
                        Payment payment = invocation.getArgument(0);
                        payment.setPaymentId(10L);
                        return payment;
                    });
            when(razorpayGateway.createOrder(any(), any(), any()))
                    .thenThrow(new RuntimeException("Gateway connection error"));
            when(paymentMapper.toResponse(any(Payment.class)))
                    .thenAnswer(invocation -> response(invocation.getArgument(0)));

            PaymentResponse response = paymentService.preparePayment(1L);

            assertEquals(PaymentStatus.READY_FOR_PAYMENT, response.getPaymentStatus());
            assertNotNull(response.getRazorpayOrderId());
        }

        @Test
        @DisplayName("Should reject payment preparation for another customer's booking")
        void preparePayment_shouldRejectDifferentCustomer() throws Exception {
            PaymentResponse calculation = calculation(1L, 999L, "125.00");
            Payment existingPayment = payment(10L, 999L, PaymentStatus.READY_FOR_PAYMENT);
            when(paymentCalculationService.calculatePayment(1L))
                    .thenReturn(calculation);
            when(paymentRepository.findByBookingId(1L))
                    .thenReturn(Optional.of(existingPayment));

            assertThrows(AccessDeniedException.class,
                    () -> paymentService.preparePayment(1L));

            verify(razorpayGateway, never()).createOrder(
                    any(), any(), any());
        }

        @Test
        @DisplayName("Should not prepare new order for already successful payment")
        void preparePayment_shouldNotCreateAnotherOrderForSuccessfulPayment() throws Exception {
            when(paymentCalculationService.calculatePayment(1L))
                    .thenReturn(calculation(1L, 100L, "125.00"));
            when(paymentRepository.findByBookingId(1L))
                    .thenReturn(Optional.of(payment(10L, 100L, PaymentStatus.SUCCESS)));

            assertThrows(RuntimeException.class,
                    () -> paymentService.preparePayment(1L));

            verify(razorpayGateway, never()).createOrder(
                    any(), any(), any());
        }

        @Test
        @DisplayName("Should allow Admin role to prepare payment for any customer")
        void preparePayment_shouldAllowAdminRole() throws Exception {
            authenticateAs(999L, Role.ADMIN);
            Payment existingPayment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);

            when(paymentCalculationService.calculatePayment(1L))
                    .thenReturn(calculation(1L, 100L, "125.00"));
            when(paymentRepository.findByBookingId(1L))
                    .thenReturn(Optional.of(existingPayment));
            when(paymentMapper.toResponse(existingPayment))
                    .thenReturn(response(existingPayment));

            PaymentResponse response = paymentService.preparePayment(1L);

            assertNotNull(response);
            assertEquals(PaymentStatus.READY_FOR_PAYMENT, response.getPaymentStatus());
        }

        @Test
        @DisplayName("Should reject payment preparation when unauthenticated")
        void preparePayment_shouldRejectWhenUnauthenticated() {
            SecurityContextHolder.clearContext();
            Payment existingPayment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);

            when(paymentCalculationService.calculatePayment(1L))
                    .thenReturn(calculation(1L, 100L, "125.00"));
            when(paymentRepository.findByBookingId(1L))
                    .thenReturn(Optional.of(existingPayment));

            assertThrows(AccessDeniedException.class,
                    () -> paymentService.preparePayment(1L));
        }
    }

    @Nested
    @DisplayName("Payment Processing Tests")
    class ProcessPaymentTests {

        @Test
        @DisplayName("Should transition state to FAILED when Razorpay signature verification fails")
        void processPayment_shouldMarkFailedWhenSignatureIsInvalid() {
            Payment payment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));
            when(razorpayGateway.verifySignature(
                    "order_test_1", "pay_test_1", "bad_signature"))
                    .thenReturn(false);

            PaymentRequest request = request("bad_signature");

            assertThrows(RuntimeException.class,
                    () -> paymentService.processPayment(request));

            assertEquals(PaymentStatus.FAILED, payment.getPaymentStatus());
            verify(paymentRepository).save(payment);
        }

        @Test
        @DisplayName("Should persist success details, update booking, and generate invoice number on valid signature")
        void processPayment_shouldPersistSuccessDetailsAfterValidSignature() {
            Payment payment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);
            Booking booking = new Booking();
            booking.setId(1L);

            when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));
            when(razorpayGateway.verifySignature(
                    "order_test_1", "pay_test_1", "valid_signature"))
                    .thenReturn(true);
            when(paymentRepository.save(payment)).thenReturn(payment);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
            when(paymentMapper.toResponse(payment))
                    .thenAnswer(invocation -> response(invocation.getArgument(0)));

            PaymentResponse response = paymentService.processPayment(
                    request("valid_signature"));

            assertEquals(PaymentStatus.SUCCESS, payment.getPaymentStatus());
            assertEquals("pay_test_1", payment.getRazorpayPaymentId());
            assertEquals("pay_test_1", payment.getTransactionId());
            assertEquals("card", payment.getPaymentMethod());
            assertEquals("INV-1-10", payment.getInvoiceNumber());
            assertNotNull(payment.getPaidAt());
            assertEquals(PaymentStatus.SUCCESS, response.getPaymentStatus());

            verify(bookingRepository).save(booking);
            assertEquals(com.sssit.bikerental.modules.booking.enums.PaymentStatus.SUCCESS,
                    booking.getPaymentStatus());
        }

        @Test
        @DisplayName("Should reject payment processing for another customer's payment")
        void processPayment_shouldRejectDifferentCustomer() {
            when(paymentRepository.findById(10L))
                    .thenReturn(Optional.of(payment(10L, 999L, PaymentStatus.READY_FOR_PAYMENT)));

            assertThrows(AccessDeniedException.class,
                    () -> paymentService.processPayment(request("valid_signature")));

            verify(razorpayGateway, never()).verifySignature(any(), any(), any());
        }

        @Test
        @DisplayName("Should reject processing when payment is already completed")
        void processPayment_shouldRejectAlreadySuccessfulPayment() {
            Payment payment = payment(10L, 100L, PaymentStatus.SUCCESS);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> paymentService.processPayment(request("valid_signature")));

            assertEquals("Payment has already been completed", exception.getMessage());
            verify(razorpayGateway, never()).verifySignature(any(), any(), any());
        }

        @Test
        @DisplayName("Should reject processing when Razorpay order ID does not match stored order ID")
        void processPayment_shouldRejectOrderMismatch() {
            Payment payment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);
            payment.setRazorpayOrderId("order_correct_1");
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));

            PaymentRequest request = request("sig");
            request.setRazorpayOrderId("order_wrong_2");

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> paymentService.processPayment(request));

            assertEquals("Razorpay order does not match", exception.getMessage());
            verify(razorpayGateway, never()).verifySignature(any(), any(), any());
        }

        @Test
        @DisplayName("Should reject processing when request or payment ID is null")
        void processPayment_shouldRejectNullRequest() {
            assertThrows(RuntimeException.class,
                    () -> paymentService.processPayment(null));

            PaymentRequest emptyRequest = new PaymentRequest();
            assertThrows(RuntimeException.class,
                    () -> paymentService.processPayment(emptyRequest));
        }

        @Test
        @DisplayName("Should allow Admin role to process payment")
        void processPayment_shouldAllowAdminRole() {
            authenticateAs(999L, Role.ADMIN);
            Payment payment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));
            when(razorpayGateway.verifySignature(any(), any(), any())).thenReturn(true);
            when(paymentRepository.save(payment)).thenReturn(payment);
            when(bookingRepository.findById(1L)).thenReturn(Optional.empty());
            when(paymentMapper.toResponse(payment)).thenReturn(response(payment));

            PaymentResponse response = paymentService.processPayment(request("sig"));

            assertNotNull(response);
            assertEquals(PaymentStatus.SUCCESS, payment.getPaymentStatus());
        }
    }

    @Nested
    @DisplayName("Payment Retry Tests")
    class RetryPaymentTests {

        @Test
        @DisplayName("Should create new Razorpay order and transition FAILED payment to READY_FOR_PAYMENT")
        void retryPayment_shouldCreateNewRazorpayOrderForFailedPayment() throws Exception {
            Payment failedPayment = payment(10L, 100L, PaymentStatus.FAILED);
            failedPayment.setRazorpayOrderId("old_order_id");

            when(paymentRepository.findById(10L)).thenReturn(Optional.of(failedPayment));
            when(razorpayGateway.createOrder(eq(10L), eq(new BigDecimal("125.00")), eq("retry_booking_1")))
                    .thenReturn("new_retry_order_id");
            when(paymentRepository.save(failedPayment)).thenReturn(failedPayment);
            when(paymentMapper.toResponse(failedPayment))
                    .thenAnswer(invocation -> response(invocation.getArgument(0)));

            PaymentResponse response = paymentService.retryPayment(10L);

            assertEquals(PaymentStatus.READY_FOR_PAYMENT, failedPayment.getPaymentStatus());
            assertEquals("new_retry_order_id", failedPayment.getRazorpayOrderId());
            verify(razorpayGateway).createOrder(10L, new BigDecimal("125.00"), "retry_booking_1");
            verify(paymentRepository).save(failedPayment);
        }

        @Test
        @DisplayName("Should reject retry for payment in READY_FOR_PAYMENT status")
        void retryPayment_shouldRejectReadyPayment() {
            Payment pendingPayment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(pendingPayment));

            RuntimeException exception = assertThrows(
                    RuntimeException.class, () -> paymentService.retryPayment(10L));

            assertEquals("Only failed payments can be retried", exception.getMessage());
        }

        @Test
        @DisplayName("Should reject retry for SUCCESS payment")
        void retryPayment_shouldRejectSuccessfulPayment() {
            Payment successPayment = payment(10L, 100L, PaymentStatus.SUCCESS);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(successPayment));

            RuntimeException exception = assertThrows(
                    RuntimeException.class, () -> paymentService.retryPayment(10L));

            assertEquals("Only failed payments can be retried", exception.getMessage());
        }

        @Test
        @DisplayName("Should reject retry for PROCESSING payment")
        void retryPayment_shouldRejectProcessingPayment() {
            Payment processingPayment = payment(10L, 100L, PaymentStatus.PROCESSING);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(processingPayment));

            RuntimeException exception = assertThrows(
                    RuntimeException.class, () -> paymentService.retryPayment(10L));

            assertEquals("Only failed payments can be retried", exception.getMessage());
        }

        @Test
        @DisplayName("Should reject retry for unauthorized customer")
        void retryPayment_shouldRejectUnauthorizedCustomer() {
            Payment payment = payment(10L, 999L, PaymentStatus.FAILED);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));

            assertThrows(AccessDeniedException.class,
                    () -> paymentService.retryPayment(10L));
        }

        @Test
        @DisplayName("Should fallback gracefully when gateway fails during retry")
        void retryPayment_shouldGracefullyFallbackToMockOrder_whenGatewayFailsOnRetry() throws Exception {
            Payment failedPayment = payment(10L, 100L, PaymentStatus.FAILED);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(failedPayment));
            when(razorpayGateway.createOrder(any(), any(), any()))
                    .thenThrow(new RuntimeException("Gateway error"));
            when(paymentRepository.save(failedPayment)).thenReturn(failedPayment);
            when(paymentMapper.toResponse(failedPayment)).thenReturn(response(failedPayment));

            PaymentResponse response = paymentService.retryPayment(10L);

            assertEquals(PaymentStatus.READY_FOR_PAYMENT, failedPayment.getPaymentStatus());
            assertNotNull(failedPayment.getRazorpayOrderId());
        }

        @Test
        @DisplayName("Should allow Admin role to retry failed payment")
        void retryPayment_shouldAllowAdminRole() throws Exception {
            authenticateAs(999L, Role.ADMIN);
            Payment failedPayment = payment(10L, 100L, PaymentStatus.FAILED);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(failedPayment));
            when(razorpayGateway.createOrder(any(), any(), any())).thenReturn("admin_retry_order");
            when(paymentRepository.save(failedPayment)).thenReturn(failedPayment);
            when(paymentMapper.toResponse(failedPayment)).thenReturn(response(failedPayment));

            PaymentResponse response = paymentService.retryPayment(10L);

            assertNotNull(response);
            assertEquals(PaymentStatus.READY_FOR_PAYMENT, failedPayment.getPaymentStatus());
        }
    }

    @Nested
    @DisplayName("Payment History & Lookup Tests")
    class PaymentLookupTests {

        @Test
        @DisplayName("Should return payment history for authorized customer")
        void getPaymentHistory_shouldReturnHistoryForAuthorizedCustomer() {
            Payment p1 = payment(10L, 100L, PaymentStatus.SUCCESS);
            Payment p2 = payment(11L, 100L, PaymentStatus.FAILED);
            when(paymentRepository.findByCustomerIdOrderByCreatedAtDesc(100L))
                    .thenReturn(List.of(p1, p2));
            when(paymentMapper.toResponse(p1)).thenReturn(response(p1));
            when(paymentMapper.toResponse(p2)).thenReturn(response(p2));

            List<PaymentResponse> history = paymentService.getPaymentHistory(100L);

            assertEquals(2, history.size());
            verify(paymentRepository).findByCustomerIdOrderByCreatedAtDesc(100L);
        }

        @Test
        @DisplayName("Should handle empty payment history")
        void getPaymentHistory_shouldHandleEmptyHistory() {
            when(paymentRepository.findByCustomerIdOrderByCreatedAtDesc(100L))
                    .thenReturn(List.of());

            List<PaymentResponse> history = paymentService.getPaymentHistory(100L);

            assertNotNull(history);
            assertEquals(0, history.size());
        }

        @Test
        @DisplayName("Should reject history request from unauthorized customer")
        void getPaymentHistory_shouldRejectUnauthorizedCustomer() {
            assertThrows(AccessDeniedException.class,
                    () -> paymentService.getPaymentHistory(999L));
            verify(paymentRepository, never()).findByCustomerIdOrderByCreatedAtDesc(any());
        }

        @Test
        @DisplayName("Should allow Admin role to access any customer's payment history")
        void getPaymentHistory_shouldAllowAdminRoleToAccessAnyCustomerHistory() {
            authenticateAs(888L, Role.ADMIN);
            Payment p1 = payment(10L, 100L, PaymentStatus.SUCCESS);
            when(paymentRepository.findByCustomerIdOrderByCreatedAtDesc(100L))
                    .thenReturn(List.of(p1));
            when(paymentMapper.toResponse(p1)).thenReturn(response(p1));

            List<PaymentResponse> history = paymentService.getPaymentHistory(100L);

            assertEquals(1, history.size());
        }

        @Test
        @DisplayName("Should return payment by ID for authorized customer")
        void getPaymentById_shouldReturnDetailsForAuthorizedCustomer() {
            Payment payment = payment(10L, 100L, PaymentStatus.SUCCESS);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));
            when(paymentMapper.toResponse(payment)).thenReturn(response(payment));

            PaymentResponse response = paymentService.getPaymentById(10L);

            assertNotNull(response);
            assertEquals(10L, response.getPaymentId());
        }

        @Test
        @DisplayName("Should reject payment lookup by ID for unauthorized customer")
        void getPaymentById_shouldRejectUnauthorizedCustomer() {
            Payment payment = payment(10L, 999L, PaymentStatus.SUCCESS);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));

            assertThrows(AccessDeniedException.class,
                    () -> paymentService.getPaymentById(10L));
        }

        @Test
        @DisplayName("Should throw exception when payment is not found by ID")
        void getPaymentById_shouldThrowWhenNotFound() {
            when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class,
                    () -> paymentService.getPaymentById(999L));
        }

        @Test
        @DisplayName("Should return payment by booking ID for authorized customer")
        void getPaymentByBookingId_shouldReturnDetailsForAuthorizedCustomer() {
            Payment payment = payment(10L, 100L, PaymentStatus.SUCCESS);
            when(paymentRepository.findByBookingId(1L)).thenReturn(Optional.of(payment));
            when(paymentMapper.toResponse(payment)).thenReturn(response(payment));

            PaymentResponse response = paymentService.getPaymentByBookingId(1L);

            assertNotNull(response);
            assertEquals(10L, response.getPaymentId());
        }

        @Test
        @DisplayName("Should reject payment lookup by booking ID for unauthorized customer")
        void getPaymentByBookingId_shouldRejectUnauthorizedCustomer() {
            Payment payment = payment(10L, 999L, PaymentStatus.SUCCESS);
            when(paymentRepository.findByBookingId(1L)).thenReturn(Optional.of(payment));

            assertThrows(AccessDeniedException.class,
                    () -> paymentService.getPaymentByBookingId(1L));
        }

        @Test
        @DisplayName("Should throw exception when payment is not found by booking ID")
        void getPaymentByBookingId_shouldThrowWhenNotFound() {
            when(paymentRepository.findByBookingId(999L)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class,
                    () -> paymentService.getPaymentByBookingId(999L));
        }

        @Test
        @DisplayName("Should return all payments for admin listing")
        void getAllPayments_shouldReturnAllPayments() {
            Payment p1 = payment(10L, 100L, PaymentStatus.SUCCESS);
            Payment p2 = payment(11L, 200L, PaymentStatus.READY_FOR_PAYMENT);
            when(paymentRepository.findAll()).thenReturn(List.of(p1, p2));
            when(paymentMapper.toResponse(p1)).thenReturn(response(p1));
            when(paymentMapper.toResponse(p2)).thenReturn(response(p2));

            List<PaymentResponse> all = paymentService.getAllPayments();

            assertEquals(2, all.size());
        }
    }

    @Nested
    @DisplayName("Invoice Generation Tests")
    class InvoiceTests {

        @Test
        @DisplayName("Should return invoice with customer details for successful payment")
        void getInvoice_shouldReturnInvoiceWithCustomerDetailsForSuccessfulPayment() {
            Payment successPayment = payment(10L, 100L, PaymentStatus.SUCCESS);
            successPayment.setInvoiceNumber("INV-1-10");
            User customer = User.builder()
                    .firstName("John")
                    .lastName("Doe")
                    .email("customer@example.com")
                    .phoneNumber("9876543210")
                    .build();
            customer.setId(100L);

            InvoiceDTO invoiceDTO = InvoiceDTO.builder()
                    .invoiceNumber("INV-1-10")
                    .paymentId(10L)
                    .bookingId(1L)
                    .customerId(100L)
                    .customerName("John Doe")
                    .customerEmail("customer@example.com")
                    .customerPhone("9876543210")
                    .finalAmount(new BigDecimal("125.00"))
                    .paymentStatus("SUCCESS")
                    .build();

            when(paymentRepository.findById(10L)).thenReturn(Optional.of(successPayment));
            when(userRepository.findById(100L)).thenReturn(Optional.of(customer));
            when(paymentMapper.toInvoiceDTO(successPayment, customer)).thenReturn(invoiceDTO);

            InvoiceDTO result = paymentService.getInvoice(10L);

            assertNotNull(result);
            assertEquals("INV-1-10", result.getInvoiceNumber());
            assertEquals(10L, result.getPaymentId());
            assertEquals("John Doe", result.getCustomerName());
            assertEquals("customer@example.com", result.getCustomerEmail());
        }

        @Test
        @DisplayName("Should handle missing customer user record gracefully without NullPointerException")
        void getInvoice_shouldHandleMissingUserRecordGracefully() {
            Payment successPayment = payment(10L, 100L, PaymentStatus.SUCCESS);
            successPayment.setInvoiceNumber("INV-1-10");

            InvoiceDTO invoiceDTO = InvoiceDTO.builder()
                    .invoiceNumber("INV-1-10")
                    .paymentId(10L)
                    .finalAmount(new BigDecimal("125.00"))
                    .paymentStatus("SUCCESS")
                    .build();

            when(paymentRepository.findById(10L)).thenReturn(Optional.of(successPayment));
            when(userRepository.findById(100L)).thenReturn(Optional.empty());
            when(paymentMapper.toInvoiceDTO(successPayment, null)).thenReturn(invoiceDTO);

            InvoiceDTO result = paymentService.getInvoice(10L);

            assertNotNull(result);
            assertEquals("INV-1-10", result.getInvoiceNumber());
        }

        @Test
        @DisplayName("Should reject invoice request for non-successful READY_FOR_PAYMENT payment")
        void getInvoice_shouldRejectNonSuccessfulPayment() {
            Payment pendingPayment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(pendingPayment));

            assertThrows(RuntimeException.class, () -> paymentService.getInvoice(10L));
        }

        @Test
        @DisplayName("Should reject invoice request for FAILED payment")
        void getInvoice_shouldRejectFailedPayment() {
            Payment failedPayment = payment(10L, 100L, PaymentStatus.FAILED);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(failedPayment));

            assertThrows(RuntimeException.class, () -> paymentService.getInvoice(10L));
        }

        @Test
        @DisplayName("Should reject invoice request from unauthorized customer")
        void getInvoice_shouldRejectUnauthorizedCustomer() {
            Payment payment = payment(10L, 999L, PaymentStatus.SUCCESS);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));

            assertThrows(AccessDeniedException.class, () -> paymentService.getInvoice(10L));
        }

        @Test
        @DisplayName("Should throw exception when payment is not found for invoice")
        void getInvoice_shouldThrowWhenPaymentNotFound() {
            when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> paymentService.getInvoice(999L));
        }

        @Test
        @DisplayName("Should allow Admin role to access any invoice")
        void getInvoice_shouldAllowAdminRole() {
            authenticateAs(888L, Role.ADMIN);
            Payment successPayment = payment(10L, 100L, PaymentStatus.SUCCESS);
            when(paymentRepository.findById(10L)).thenReturn(Optional.of(successPayment));
            when(userRepository.findById(100L)).thenReturn(Optional.empty());
            when(paymentMapper.toInvoiceDTO(eq(successPayment), any()))
                    .thenReturn(InvoiceDTO.builder().invoiceNumber("INV-1-10").build());

            InvoiceDTO result = paymentService.getInvoice(10L);

            assertNotNull(result);
            assertEquals("INV-1-10", result.getInvoiceNumber());
        }
    }
}