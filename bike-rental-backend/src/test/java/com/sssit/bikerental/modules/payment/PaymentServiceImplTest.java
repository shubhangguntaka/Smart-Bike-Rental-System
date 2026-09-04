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
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.sssit.bikerental.common.enums.Role;
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

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private com.sssit.bikerental.modules.user.repository.UserRepository userRepository;

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
        authenticateAs(100L);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
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
    void processPayment_shouldPersistSuccessDetailsAfterValidSignature() {
        Payment payment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));
        when(razorpayGateway.verifySignature(
                "order_test_1", "pay_test_1", "valid_signature"))
                .thenReturn(true);
        when(paymentRepository.save(payment)).thenReturn(payment);
        when(paymentMapper.toResponse(payment))
                .thenAnswer(invocation -> response(invocation.getArgument(0)));

        PaymentResponse response = paymentService.processPayment(
                request("valid_signature"));

        assertEquals(PaymentStatus.SUCCESS, payment.getPaymentStatus());
        assertEquals("pay_test_1", payment.getRazorpayPaymentId());
        assertEquals("pay_test_1", payment.getTransactionId());
        assertEquals("card", payment.getPaymentMethod());
        assertNotNull(payment.getPaidAt());
        assertEquals(PaymentStatus.SUCCESS, response.getPaymentStatus());
    }

    @Test
    void processPayment_shouldRejectDifferentCustomer() {
        when(paymentRepository.findById(10L))
                .thenReturn(Optional.of(payment(10L, 999L, PaymentStatus.READY_FOR_PAYMENT)));

        assertThrows(AccessDeniedException.class,
                () -> paymentService.processPayment(request("valid_signature")));

        verify(razorpayGateway, never()).verifySignature(any(), any(), any());
    }

    @Test
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
    void retryPayment_shouldRejectNonFailedPayment() {
        Payment pendingPayment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(pendingPayment));

        assertThrows(RuntimeException.class, () -> paymentService.retryPayment(10L));
    }

    @Test
    void getPaymentHistory_shouldReturnHistoryForAuthorizedCustomer() {
        Payment p1 = payment(10L, 100L, PaymentStatus.SUCCESS);
        Payment p2 = payment(11L, 100L, PaymentStatus.FAILED);
        when(paymentRepository.findByCustomerIdOrderByCreatedAtDesc(100L))
                .thenReturn(java.util.List.of(p1, p2));
        when(paymentMapper.toResponse(p1)).thenReturn(response(p1));
        when(paymentMapper.toResponse(p2)).thenReturn(response(p2));

        java.util.List<PaymentResponse> history = paymentService.getPaymentHistory(100L);

        assertEquals(2, history.size());
        verify(paymentRepository).findByCustomerIdOrderByCreatedAtDesc(100L);
    }

    @Test
    void getPaymentHistory_shouldHandleEmptyHistory() {
        when(paymentRepository.findByCustomerIdOrderByCreatedAtDesc(100L))
                .thenReturn(java.util.List.of());

        java.util.List<PaymentResponse> history = paymentService.getPaymentHistory(100L);

        assertNotNull(history);
        assertEquals(0, history.size());
    }

    @Test
    void getPaymentHistory_shouldRejectUnauthorizedCustomer() {
        assertThrows(AccessDeniedException.class,
                () -> paymentService.getPaymentHistory(999L));
        verify(paymentRepository, never()).findByCustomerIdOrderByCreatedAtDesc(any());
    }

    @Test
    void getPaymentById_shouldReturnDetailsForAuthorizedCustomer() {
        Payment payment = payment(10L, 100L, PaymentStatus.SUCCESS);
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));
        when(paymentMapper.toResponse(payment)).thenReturn(response(payment));

        PaymentResponse response = paymentService.getPaymentById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getPaymentId());
    }

    @Test
    void getPaymentById_shouldRejectUnauthorizedCustomer() {
        Payment payment = payment(10L, 999L, PaymentStatus.SUCCESS);
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));

        assertThrows(AccessDeniedException.class,
                () -> paymentService.getPaymentById(10L));
    }

    @Test
    void getPaymentById_shouldThrowWhenNotFound() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> paymentService.getPaymentById(999L));
    }

    @Test
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
    void getInvoice_shouldRejectNonSuccessfulPayment() {
        Payment pendingPayment = payment(10L, 100L, PaymentStatus.READY_FOR_PAYMENT);
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(pendingPayment));

        assertThrows(RuntimeException.class, () -> paymentService.getInvoice(10L));
    }

    @Test
    void getInvoice_shouldRejectFailedPayment() {
        Payment failedPayment = payment(10L, 100L, PaymentStatus.FAILED);
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(failedPayment));

        assertThrows(RuntimeException.class, () -> paymentService.getInvoice(10L));
    }

    @Test
    void getInvoice_shouldRejectUnauthorizedCustomer() {
        Payment payment = payment(10L, 999L, PaymentStatus.SUCCESS);
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));

        assertThrows(AccessDeniedException.class, () -> paymentService.getInvoice(10L));
    }

    @Test
    void getInvoice_shouldThrowWhenPaymentNotFound() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> paymentService.getInvoice(999L));
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
                .platformFeeAmount(new BigDecimal("3.64"))
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
                .build();
    }

    private void authenticateAs(Long userId) {
        User user = User.builder()
                .email("customer@example.com")
                .password("password")
                .role(Role.CUSTOMER)
                .build();
        user.setId(userId);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        user, null, user.getAuthorities()));
    }
}