package com.sssit.bikerental.modules.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.booking.service.QRCodeService;
import com.sssit.bikerental.modules.booking.service.impl.BookingServiceImpl;
import com.sssit.bikerental.modules.booking.util.BookingCalculator;
import com.sssit.bikerental.modules.booking.validation.BookingValidator;
import com.sssit.bikerental.modules.gps.repository.RideRepository;
import com.sssit.bikerental.modules.notification.entity.NotificationService;
import com.sssit.bikerental.modules.payment.config.PaymentProperties;
import com.sssit.bikerental.modules.payment.dto.InvoiceDTO;
import com.sssit.bikerental.modules.payment.dto.PaymentRequest;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.gateway.RazorpayGateway;
import com.sssit.bikerental.modules.payment.mapper.PaymentMapper;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;
import com.sssit.bikerental.modules.payment.service.PaymentCalculationService;
import com.sssit.bikerental.modules.payment.service.impl.PaymentCalculationServiceImpl;
import com.sssit.bikerental.modules.payment.service.impl.PaymentServiceImpl;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.verification.aadhaar.service.AadhaarService;
import com.sssit.bikerental.modules.verification.drivinglicense.service.DrivingLicenseService;

@ExtendWith(MockitoExtension.class)
class PaymentBookingLifecycleIntegrationTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BikeRepository bikeRepository;

    @Mock
    private RideRepository rideRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private QRCodeService qrCodeService;

    @Mock
    private BookingValidator bookingValidator;

    @Mock
    private BookingCalculator bookingCalculator;

    @Mock
    private AadhaarService aadhaarService;

    @Mock
    private DrivingLicenseService drivingLicenseService;

    @Mock
    private RazorpayGateway razorpayGateway;

    private PaymentProperties paymentProperties;
    private PaymentCalculationService calculationService;
    private PaymentServiceImpl paymentService;
    private BookingServiceImpl bookingService;
    private PaymentMapper paymentMapper;

    private Bike testBike;
    private Booking booking;
    private User customer;
    private User owner;

    @BeforeEach
    void setUp() {
        paymentProperties = new PaymentProperties();
        paymentProperties.setPlatformFeeThreshold(new BigDecimal("1000"));
        paymentProperties.setLowerPlatformFeePercent(new BigDecimal("3"));
        paymentProperties.setUpperPlatformFeePercent(new BigDecimal("5"));
        paymentProperties.setLateGraceMinutes(15);
        paymentProperties.setLateChargeRate(new BigDecimal("50.00"));

        calculationService = new PaymentCalculationServiceImpl(bookingRepository, paymentProperties);
        paymentMapper = new PaymentMapper();
        paymentService = new PaymentServiceImpl(
                paymentRepository,
                bookingRepository,
                userRepository,
                calculationService,
                paymentMapper,
                razorpayGateway);

        bookingService = new BookingServiceImpl(
                bookingRepository,
                bikeRepository,
                userRepository,
                bookingValidator,
                bookingCalculator,
                aadhaarService,
                drivingLicenseService,
                qrCodeService,
                notificationService,
                rideRepository);

        testBike = Bike.builder()
                .bikeId(10L)
                .ownerId(200L)
                .bikeName("Honda Activa")
                .registrationNumber("TS09AB1234")
                .rentalPrice(new BigDecimal("200.00"))
                .bikeStatus(BikeStatus.BOOKED)
                .build();

        booking = Booking.builder()
                .bikeId(10L)
                .customerId(100L)
                .startTime(LocalDateTime.now().minusHours(2))
                .returnTime(LocalDateTime.now())
                .rentalAmount(new BigDecimal("200.00"))
                .bookingStatus(BookingStatus.ACTIVE)
                .paymentStatus(com.sssit.bikerental.modules.booking.enums.PaymentStatus.PENDING)
                .actualPickupTime(LocalDateTime.now().minusHours(2))
                .actualReturnTime(null)
                .build();
        booking.setId(1L);

        customer = User.builder()
                .firstName("Alice")
                .lastName("Customer")
                .email("alice@example.com")
                .role(Role.CUSTOMER)
                .build();
        customer.setId(100L);

        owner = User.builder()
                .firstName("Bob")
                .lastName("Owner")
                .email("bob@example.com")
                .role(Role.OWNER)
                .build();
        owner.setId(200L);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long userId, Role role) {
        User user = User.builder()
                .firstName("User" + userId)
                .lastName("Test")
                .email("user" + userId + "@example.com")
                .password("password")
                .role(role)
                .build();
        user.setId(userId);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    @Test
    @DisplayName("Stage 1: ACTIVE -> returnBooking() transitions Booking to COMPLETED and populates actualReturnTime")
    void lifecycle_stage1_activeReturnBookingCompletesLifecycle() throws Exception {
        authenticateAs(200L, Role.OWNER);

        when(bookingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(booking));
        when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
        when(userRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(200L)).thenReturn(Optional.of(owner));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponse response = bookingService.returnBooking(1L);

        assertNotNull(response);
        assertEquals(BookingStatus.COMPLETED, response.getBookingStatus());
        assertNotNull(response.getActualReturnTime());
        assertEquals(BookingStatus.COMPLETED, booking.getBookingStatus());
        assertNotNull(booking.getActualReturnTime());
        assertEquals(BikeStatus.AVAILABLE, testBike.getBikeStatus());
        verify(bookingRepository, times(1)).save(booking);
        verify(bikeRepository, times(1)).save(testBike);
    }

    @Test
    @DisplayName("Stage 2: CONFIRMED booking without actual return rejects payment preparation")
    void lifecycle_stage2_confirmedBookingWithoutReturnCannotPreparePayment() throws Exception {
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        booking.setActualReturnTime(null);
        authenticateAs(100L, Role.CUSTOMER);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> paymentService.preparePayment(1L));

        assertEquals("Payment cannot be prepared before bike return is confirmed", exception.getMessage());
        verify(razorpayGateway, never()).createOrder(any(), any(), any());
    }

    @Test
    @DisplayName("Stage 3: ACTIVE booking without actual return rejects payment preparation")
    void lifecycle_stage3_activeBookingWithoutReturnCannotPreparePayment() throws Exception {
        booking.setBookingStatus(BookingStatus.ACTIVE);
        booking.setActualPickupTime(LocalDateTime.now().minusHours(2));
        booking.setActualReturnTime(null);
        authenticateAs(100L, Role.CUSTOMER);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> paymentService.preparePayment(1L));

        assertEquals("Payment cannot be prepared before bike return is confirmed", exception.getMessage());
        verify(razorpayGateway, never()).createOrder(any(), any(), any());
    }

    @Test
    @DisplayName("Stage 4: Real BookingService.returnBooking() followed by PaymentService.preparePayment() succeeds")
    void lifecycle_stage4_realReturnFlowFollowedByPaymentPreparation() throws Exception {
        // Step 1: Owner returns the active booking
        authenticateAs(200L, Role.OWNER);
        when(bookingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(booking));
        when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
        when(userRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(200L)).thenReturn(Optional.of(owner));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponse returnResponse = bookingService.returnBooking(1L);

        assertEquals(BookingStatus.COMPLETED, returnResponse.getBookingStatus());
        assertNotNull(returnResponse.getActualReturnTime());
        assertEquals(BookingStatus.COMPLETED, booking.getBookingStatus());
        assertNotNull(booking.getActualReturnTime());

        // Step 2: Customer prepares payment for the returned booking
        authenticateAs(100L, Role.CUSTOMER);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(1L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            if (p.getPaymentId() == null) {
                p.setPaymentId(50L);
            }
            return p;
        });
        when(razorpayGateway.createOrder(eq(50L), any(BigDecimal.class), eq("booking_1")))
                .thenReturn("order_rzp_live_50");

        PaymentResponse paymentResponse = paymentService.preparePayment(1L);

        assertNotNull(paymentResponse);
        assertEquals(PaymentStatus.READY_FOR_PAYMENT, paymentResponse.getPaymentStatus());
        assertEquals(new BigDecimal("200.00"), paymentResponse.getBaseRentalAmount());
        assertEquals(new BigDecimal("0.00"), paymentResponse.getLateCharge());
        assertEquals(new BigDecimal("200.00"), paymentResponse.getEligibleTransactionAmount());
        assertEquals(new BigDecimal("3"), paymentResponse.getPlatformFeePercent());
        assertEquals(new BigDecimal("6.00"), paymentResponse.getPlatformFeeAmount());
        assertEquals(new BigDecimal("206.00"), paymentResponse.getFinalAmount());
        assertEquals("order_rzp_live_50", paymentResponse.getRazorpayOrderId());

        verify(razorpayGateway).createOrder(50L, new BigDecimal("206.00"), "booking_1");
    }

    @Test
    @DisplayName("Stage 5: Real return flow followed by successful payment processing generates invoice and marks Booking SUCCESS")
    void lifecycle_stage5_realReturnFlowFollowedBySuccessfulPayment() throws Exception {
        // Step 1: Real return operation
        authenticateAs(200L, Role.OWNER);
        when(bookingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(booking));
        when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
        when(userRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(200L)).thenReturn(Optional.of(owner));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        bookingService.returnBooking(1L);
        assertEquals(BookingStatus.COMPLETED, booking.getBookingStatus());
        assertNotNull(booking.getActualReturnTime());

        // Step 2: Customer prepares payment
        authenticateAs(100L, Role.CUSTOMER);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        Payment paymentHolder = Payment.builder().build();
        when(paymentRepository.findByBookingId(1L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            if (p.getPaymentId() == null) {
                p.setPaymentId(50L);
            }
            paymentHolder.setPaymentId(p.getPaymentId());
            paymentHolder.setBookingId(p.getBookingId());
            paymentHolder.setCustomerId(p.getCustomerId());
            paymentHolder.setBaseRentalAmount(p.getBaseRentalAmount());
            paymentHolder.setLateCharge(p.getLateCharge());
            paymentHolder.setEligibleTransactionAmount(p.getEligibleTransactionAmount());
            paymentHolder.setPlatformFeePercent(p.getPlatformFeePercent());
            paymentHolder.setPlatformFeeAmount(p.getPlatformFeeAmount());
            paymentHolder.setTaxAmount(p.getTaxAmount());
            paymentHolder.setFinalAmount(p.getFinalAmount());
            paymentHolder.setPaymentStatus(p.getPaymentStatus());
            paymentHolder.setRazorpayOrderId(p.getRazorpayOrderId());
            paymentHolder.setInvoiceNumber(p.getInvoiceNumber());
            paymentHolder.setPaidAt(p.getPaidAt());
            paymentHolder.setTransactionId(p.getTransactionId());
            paymentHolder.setPaymentMethod(p.getPaymentMethod());
            return paymentHolder;
        });
        when(razorpayGateway.createOrder(eq(50L), any(BigDecimal.class), eq("booking_1")))
                .thenReturn("order_rzp_live_50");

        paymentService.preparePayment(1L);

        // Step 3: Customer processes payment with valid signature
        when(paymentRepository.findById(50L)).thenReturn(Optional.of(paymentHolder));
        when(razorpayGateway.verifySignature("order_rzp_live_50", "pay_rzp_50", "sig_valid"))
                .thenReturn(true);

        PaymentRequest request = new PaymentRequest();
        request.setPaymentId(50L);
        request.setPaymentMethod("UPI");
        request.setRazorpayOrderId("order_rzp_live_50");
        request.setRazorpayPaymentId("pay_rzp_50");
        request.setRazorpaySignature("sig_valid");

        PaymentResponse processResponse = paymentService.processPayment(request);

        assertEquals(PaymentStatus.SUCCESS, processResponse.getPaymentStatus());
        assertEquals(PaymentStatus.SUCCESS, paymentHolder.getPaymentStatus());
        assertEquals("pay_rzp_50", paymentHolder.getTransactionId());
        assertEquals("pay_rzp_50", paymentHolder.getRazorpayPaymentId());
        assertEquals("INV-1-50", paymentHolder.getInvoiceNumber());
        assertNotNull(paymentHolder.getPaidAt());

        // Verify booking saved twice: once during returnBooking, once during processPayment
        verify(bookingRepository, times(2)).save(booking);
        assertEquals(com.sssit.bikerental.modules.booking.enums.PaymentStatus.SUCCESS, booking.getPaymentStatus());

        // Verify invoice is available
        InvoiceDTO invoice = paymentService.getInvoice(50L);
        assertNotNull(invoice);
        assertEquals("INV-1-50", invoice.getInvoiceNumber());
        assertEquals(1L, invoice.getBookingId());
        assertEquals("Alice Customer", invoice.getCustomerName());
    }

    @Test
    @DisplayName("Stage 6: Real return flow followed by failed payment leaves Booking PENDING and invoice unavailable")
    void lifecycle_stage6_realReturnFlowFollowedByFailedPayment() throws Exception {
        // Step 1: Real return operation
        authenticateAs(200L, Role.OWNER);
        when(bookingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(booking));
        when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
        when(userRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(200L)).thenReturn(Optional.of(owner));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        bookingService.returnBooking(1L);

        // Step 2: Customer prepares payment
        authenticateAs(100L, Role.CUSTOMER);
        Payment readyPayment = Payment.builder()
                .paymentId(50L)
                .bookingId(1L)
                .customerId(100L)
                .baseRentalAmount(new BigDecimal("200.00"))
                .lateCharge(BigDecimal.ZERO.setScale(2))
                .eligibleTransactionAmount(new BigDecimal("200.00"))
                .platformFeePercent(new BigDecimal("3"))
                .platformFeeAmount(new BigDecimal("6.00"))
                .taxAmount(BigDecimal.ZERO.setScale(2))
                .finalAmount(new BigDecimal("206.00"))
                .paymentStatus(PaymentStatus.READY_FOR_PAYMENT)
                .razorpayOrderId("order_rzp_live_50")
                .build();

        when(paymentRepository.findById(50L)).thenReturn(Optional.of(readyPayment));
        when(razorpayGateway.verifySignature("order_rzp_live_50", "pay_rzp_50", "sig_invalid"))
                .thenReturn(false);

        PaymentRequest request = new PaymentRequest();
        request.setPaymentId(50L);
        request.setPaymentMethod("UPI");
        request.setRazorpayOrderId("order_rzp_live_50");
        request.setRazorpayPaymentId("pay_rzp_50");
        request.setRazorpaySignature("sig_invalid");

        // Step 3: Payment fails
        RuntimeException ex = assertThrows(RuntimeException.class, () -> paymentService.processPayment(request));
        assertEquals("Payment verification failed", ex.getMessage());

        assertEquals(PaymentStatus.FAILED, readyPayment.getPaymentStatus());
        verify(paymentRepository).save(readyPayment);
        assertEquals(com.sssit.bikerental.modules.booking.enums.PaymentStatus.PENDING, booking.getPaymentStatus());

        // Step 4: Invoice cannot be retrieved for failed payment
        RuntimeException invoiceEx = assertThrows(RuntimeException.class, () -> paymentService.getInvoice(50L));
        assertEquals("Invoice is only available for successful payments", invoiceEx.getMessage());

        // Step 5: Failed payment can be retried
        when(razorpayGateway.createOrder(eq(50L), eq(new BigDecimal("206.00")), eq("retry_booking_1")))
                .thenReturn("order_rzp_retry_51");
        when(paymentRepository.save(readyPayment)).thenReturn(readyPayment);

        PaymentResponse retryResponse = paymentService.retryPayment(50L);
        assertEquals(PaymentStatus.READY_FOR_PAYMENT, retryResponse.getPaymentStatus());
        assertEquals("order_rzp_retry_51", readyPayment.getRazorpayOrderId());
    }

    @Test
    @DisplayName("Stage 7: Idempotency - Calling prepare payment twice reuses existing order without duplicate order creation")
    void lifecycle_stage7_preparePaymentIsIdempotent() throws Exception {
        // Return booking
        authenticateAs(200L, Role.OWNER);
        when(bookingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(booking));
        when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
        when(userRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(200L)).thenReturn(Optional.of(owner));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        bookingService.returnBooking(1L);

        // Prepare payment first time already done
        authenticateAs(100L, Role.CUSTOMER);
        Payment existing = Payment.builder()
                .paymentId(50L)
                .bookingId(1L)
                .customerId(100L)
                .baseRentalAmount(new BigDecimal("200.00"))
                .lateCharge(BigDecimal.ZERO.setScale(2))
                .eligibleTransactionAmount(new BigDecimal("200.00"))
                .platformFeePercent(new BigDecimal("3"))
                .platformFeeAmount(new BigDecimal("6.00"))
                .taxAmount(BigDecimal.ZERO.setScale(2))
                .finalAmount(new BigDecimal("206.00"))
                .paymentStatus(PaymentStatus.READY_FOR_PAYMENT)
                .razorpayOrderId("order_rzp_live_50")
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(1L)).thenReturn(Optional.of(existing));

        PaymentResponse response = paymentService.preparePayment(1L);

        assertEquals(PaymentStatus.READY_FOR_PAYMENT, response.getPaymentStatus());
        assertEquals("order_rzp_live_50", response.getRazorpayOrderId());
        verify(razorpayGateway, never()).createOrder(any(), any(), any());
    }

    @Test
    @DisplayName("Stage 8: Customer isolation - Customer B cannot prepare or pay for Customer A's booking")
    void lifecycle_stage8_customerIsolationEnforced() throws Exception {
        // Return booking
        authenticateAs(200L, Role.OWNER);
        when(bookingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(booking));
        when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
        when(userRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(200L)).thenReturn(Optional.of(owner));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        bookingService.returnBooking(1L);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        // Authenticate as a different customer (Customer ID 999)
        authenticateAs(999L, Role.CUSTOMER);

        assertThrows(AccessDeniedException.class, () -> paymentService.preparePayment(1L));
    }

    @Test
    @DisplayName("Stage 9: Early return flow calculates reduced amount and prepares Razorpay order with adjusted total")
    void lifecycle_stage9_earlyReturnFlowReducesPaymentAmount() throws Exception {
        // Booking scheduled for 4 hours (now - 2h to now + 2h) at 200.00 (50/hr)
        booking.setReturnTime(LocalDateTime.now().plusHours(2));

        // Owner returns bike early (after 2 hours)
        authenticateAs(200L, Role.OWNER);
        when(bookingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(booking));
        when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
        when(userRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(200L)).thenReturn(Optional.of(owner));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        bookingService.returnBooking(1L);

        // Customer prepares payment for early return
        authenticateAs(100L, Role.CUSTOMER);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(1L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            if (p.getPaymentId() == null) {
                p.setPaymentId(55L);
            }
            return p;
        });
        when(razorpayGateway.createOrder(eq(55L), eq(new BigDecimal("103.00")), eq("booking_1")))
                .thenReturn("order_rzp_early_55");

        PaymentResponse response = paymentService.preparePayment(1L);

        assertNotNull(response);
        assertEquals(PaymentStatus.READY_FOR_PAYMENT, response.getPaymentStatus());
        assertEquals(new BigDecimal("100.00"), response.getBaseRentalAmount());
        assertEquals(new BigDecimal("0.00"), response.getLateCharge());
        assertEquals(new BigDecimal("100.00"), response.getEligibleTransactionAmount());
        assertEquals(new BigDecimal("3"), response.getPlatformFeePercent());
        assertEquals(new BigDecimal("3.00"), response.getPlatformFeeAmount());
        assertEquals(new BigDecimal("103.00"), response.getFinalAmount());
        assertEquals("order_rzp_early_55", response.getRazorpayOrderId());

        verify(razorpayGateway).createOrder(55L, new BigDecimal("103.00"), "booking_1");
    }
}
