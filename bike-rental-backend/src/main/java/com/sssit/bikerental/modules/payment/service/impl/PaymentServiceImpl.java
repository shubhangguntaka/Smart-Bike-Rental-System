package com.sssit.bikerental.modules.payment.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.notification.entity.NotificationService;
import com.sssit.bikerental.modules.payment.dto.InvoiceDTO;
import com.sssit.bikerental.modules.payment.dto.PaymentRequest;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.entity.BankAccount;
import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.gateway.RazorpayGateway;
import com.sssit.bikerental.modules.payment.mapper.PaymentMapper;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;
import com.sssit.bikerental.modules.payment.service.BankAccountService;
import com.sssit.bikerental.modules.payment.service.PaymentCalculationService;
import com.sssit.bikerental.modules.payment.service.PaymentService;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final BikeRepository bikeRepository;
    private final UserRepository userRepository;
    private final PaymentCalculationService paymentCalculationService;
    private final BankAccountService bankAccountService;
    private final NotificationService notificationService;
    private final PaymentMapper paymentMapper;
    private final RazorpayGateway razorpayGateway;

    /**
     * Prepare payment after confirmed bike return.
     * The final amount is calculated completely by the backend.
     */
    @Override
    @Transactional
    public PaymentResponse preparePayment(Long bookingId) {

        PaymentResponse calculation = paymentCalculationService.calculatePayment(bookingId);

        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        Long ownerId = null;
        if (booking != null && booking.getBikeId() != null) {
            ownerId = bikeRepository.findById(booking.getBikeId())
                    .map(Bike::getOwnerId)
                    .orElse(null);
        }

        Payment payment = paymentRepository.findByBookingId(bookingId).orElse(null);

        BigDecimal ownerShare = calculation.getBaseRentalAmount()
                .add(calculation.getLateCharge() != null ? calculation.getLateCharge() : BigDecimal.ZERO);
        BigDecimal adminShare = calculation.getPlatformFeeAmount()
                .add(calculation.getTaxAmount() != null ? calculation.getTaxAmount() : BigDecimal.ZERO);

        if (payment != null) {
            validateCustomerOwnership(payment);

            if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                throw new RuntimeException("Payment has already been completed");
            }

            if (ownerId != null) {
                payment.setOwnerId(ownerId);
            }
            payment.setOwnerShareAmount(ownerShare);
            payment.setAdminShareAmount(adminShare);

            if (payment.getPaymentStatus() == PaymentStatus.READY_FOR_PAYMENT && payment.getRazorpayOrderId() != null) {
                return paymentMapper.toResponse(payment);
            }

        } else {
            payment = Payment.builder()
                    .bookingId(calculation.getBookingId())
                    .customerId(calculation.getCustomerId())
                    .ownerId(ownerId)
                    .amount(calculation.getFinalAmount())
                    .status(PaymentStatus.READY_FOR_PAYMENT.name())
                    .paymentDate(LocalDateTime.now())
                    .baseRentalAmount(calculation.getBaseRentalAmount())
                    .lateCharge(calculation.getLateCharge())
                    .eligibleTransactionAmount(calculation.getEligibleTransactionAmount())
                    .platformFeePercent(calculation.getPlatformFeePercent())
                    .platformFeeAmount(calculation.getPlatformFeeAmount())
                    .taxAmount(calculation.getTaxAmount())
                    .finalAmount(calculation.getFinalAmount())
                    .ownerShareAmount(ownerShare)
                    .adminShareAmount(adminShare)
                    .paymentStatus(PaymentStatus.READY_FOR_PAYMENT)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            payment = paymentRepository.save(payment);
        }

        String razorpayOrderId;
        try {
            razorpayOrderId = razorpayGateway.createOrder(
                    payment.getPaymentId(),
                    payment.getFinalAmount(),
                    "booking_" + bookingId
            );
        } catch (Exception e) {
            log.error("Failed to create Razorpay order for paymentId {}: {}", payment.getPaymentId(), e.getMessage());
            throw new RuntimeException("Failed to create Razorpay payment order: " + e.getMessage(), e);
        }

        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setPaymentStatus(PaymentStatus.READY_FOR_PAYMENT);
        payment.setUpdatedAt(LocalDateTime.now());

        payment = paymentRepository.save(payment);

        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {

        if (request == null || request.getPaymentId() == null) {
            throw new RuntimeException("Invalid payment request");
        }

        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        validateCustomerOwnership(payment);

        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new RuntimeException("Payment has already been completed");
        }

        if (request.getRazorpayOrderId() == null
                || !request.getRazorpayOrderId().equals(payment.getRazorpayOrderId())) {
            throw new RuntimeException("Razorpay order does not match");
        }

        Booking booking = bookingRepository.findById(payment.getBookingId()).orElse(null);
        if (booking != null) {
            if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
                throw new IllegalStateException("Payment cannot be processed for a cancelled booking");
            }
            if (booking.getBookingStatus() == BookingStatus.ACTIVE || booking.getActualReturnTime() == null) {
                throw new RuntimeException("Payment cannot be processed before bike return is confirmed");
            }
        }

        /*
         * State transition:
         * READY_FOR_PAYMENT -> PROCESSING
         */
        payment.setPaymentStatus(PaymentStatus.PROCESSING);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.saveAndFlush(payment);

        boolean verified = razorpayGateway.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!verified) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            throw new RuntimeException("Payment verification failed");
        }

        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setTransactionId(request.getRazorpayPaymentId());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "ONLINE");
        payment.setPaidAt(LocalDateTime.now());

        if (payment.getInvoiceNumber() == null) {
            payment.setInvoiceNumber(String.format("INV-%d-%d", payment.getBookingId(), payment.getPaymentId()));
        }

        // === Revenue Split and Banking Details Settlement Logic ===
        Long ownerId = payment.getOwnerId();
        if (ownerId == null && booking != null && booking.getBikeId() != null) {
            ownerId = bikeRepository.findById(booking.getBikeId())
                    .map(Bike::getOwnerId)
                    .orElse(null);
            payment.setOwnerId(ownerId);
        }

        BigDecimal base = payment.getBaseRentalAmount() != null ? payment.getBaseRentalAmount() : BigDecimal.ZERO;
        BigDecimal late = payment.getLateCharge() != null ? payment.getLateCharge() : BigDecimal.ZERO;
        BigDecimal platform = payment.getPlatformFeeAmount() != null ? payment.getPlatformFeeAmount() : BigDecimal.ZERO;
        BigDecimal tax = payment.getTaxAmount() != null ? payment.getTaxAmount() : BigDecimal.ZERO;

        BigDecimal ownerShare = base.add(late);
        BigDecimal adminShare = platform.add(tax);

        payment.setOwnerShareAmount(ownerShare);
        payment.setAdminShareAmount(adminShare);

        // Fetch & stamp Owner Bank Snapshot
        if (ownerId != null) {
            try {
                BankAccount ownerBank = bankAccountService.getOrCreateDefaultOwnerBankAccount(ownerId);
                if (ownerBank != null) {
                    payment.setOwnerBankName(ownerBank.getBankName());
                    payment.setOwnerAccountNumber(ownerBank.getAccountNumber());
                    payment.setOwnerIfscCode(ownerBank.getIfscCode());
                    payment.setOwnerUpiId(ownerBank.getUpiId());
                }
            } catch (Exception e) {
                log.warn("Could not load owner bank account for settlement: {}", e.getMessage());
            }
        }
        payment.setOwnerPayoutUtr("UTR-OWNER-" + System.currentTimeMillis() + "-" + payment.getPaymentId());

        // Fetch & stamp Admin Platform Bank Snapshot
        try {
            BankAccount adminBank = bankAccountService.getOrCreateDefaultAdminBankAccount();
            if (adminBank != null) {
                payment.setAdminBankName(adminBank.getBankName());
                payment.setAdminAccountNumber(adminBank.getAccountNumber());
                payment.setAdminIfscCode(adminBank.getIfscCode());
                payment.setAdminUpiId(adminBank.getUpiId());
            }
        } catch (Exception e) {
            log.warn("Could not load admin bank account for settlement: {}", e.getMessage());
        }
        payment.setAdminPayoutUtr("UTR-ADM-" + System.currentTimeMillis() + "-" + payment.getPaymentId());

        payment.setPayoutStatus("SETTLED");
        payment.setPayoutSettledAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        // Update booking payment status
        if (booking != null) {
            booking.setPaymentStatus(com.sssit.bikerental.modules.booking.enums.PaymentStatus.SUCCESS);
            bookingRepository.save(booking);
        }

        // Disburse notifications to Owner and Admin
        try {
            if (ownerId != null) {
                notificationService.paymentReceived(ownerId, ownerShare);
            }
        } catch (Exception e) {
            log.warn("Failed to send payment notification to owner {}: {}", ownerId, e.getMessage());
        }

        return paymentMapper.toResponse(saved);
    }

    /**
     * Get payment by ID.
     */
    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));

        validateCustomerOwnership(payment);

        return paymentMapper.toResponse(payment);
    }

    /**
     * Get customer payment history.
     */
    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentHistory(Long customerId) {

        Long currentUserId = SecurityUtils.getCurrentUserId();

        if (currentUserId == null) {
            throw new AccessDeniedException("Authentication required");
        }

        if (SecurityUtils.getCurrentRole() != com.sssit.bikerental.common.enums.Role.ADMIN
                && !currentUserId.equals(customerId)) {
            throw new AccessDeniedException("You are not authorized to access this payment history");
        }

        return paymentRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    /**
     * Get payment for a booking.
     */
    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(Long bookingId) {

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for booking: " + bookingId));

        validateCustomerOwnership(payment);

        return paymentMapper.toResponse(payment);
    }

    /**
     * Retry a failed payment.
     */
    @Override
    public PaymentResponse retryPayment(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));

        validateCustomerOwnership(payment);

        if (payment.getPaymentStatus() != PaymentStatus.FAILED) {
            throw new RuntimeException("Only failed payments can be retried");
        }

        try {
            String razorpayOrderId = razorpayGateway.createOrder(
                    payment.getPaymentId(),
                    payment.getFinalAmount(),
                    "retry_booking_" + payment.getBookingId()
            );
            payment.setRazorpayOrderId(razorpayOrderId);
        } catch (Exception e) {
            log.error("Failed to create Razorpay order on retry for paymentId {}: {}", payment.getPaymentId(), e.getMessage());
            throw new RuntimeException("Failed to create Razorpay payment order for retry: " + e.getMessage(), e);
        }

        payment.setPaymentStatus(PaymentStatus.READY_FOR_PAYMENT);
        payment.setUpdatedAt(LocalDateTime.now());

        Payment updatedPayment = paymentRepository.save(payment);

        return paymentMapper.toResponse(updatedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoice(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));

        validateCustomerOwnership(payment);

        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new RuntimeException("Invoice is only available for successful payments");
        }

        User customer = null;
        if (payment.getCustomerId() != null) {
            customer = userRepository.findById(payment.getCustomerId()).orElse(null);
        }

        return paymentMapper.toInvoiceDTO(payment, customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    private void validateCustomerOwnership(Payment payment) {

        Long currentUserId = SecurityUtils.getCurrentUserId();

        if (currentUserId == null) {
            throw new AccessDeniedException("Authentication required");
        }

        if (SecurityUtils.getCurrentRole() == com.sssit.bikerental.common.enums.Role.ADMIN) {
            return;
        }

        if (!currentUserId.equals(payment.getCustomerId())) {
            boolean isBikeOwner = false;
            if (payment.getPaymentId() != null) {
                isBikeOwner = paymentRepository.findPaymentByOwnerIdAndPaymentId(currentUserId, payment.getPaymentId()).isPresent();
            }

            if (!isBikeOwner) {
                throw new AccessDeniedException("You are not authorized to access this payment");
            }
        }
    }
}