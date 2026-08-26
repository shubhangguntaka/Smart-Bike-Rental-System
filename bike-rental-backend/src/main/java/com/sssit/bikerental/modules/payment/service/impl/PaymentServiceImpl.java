package com.sssit.bikerental.modules.payment.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.payment.dto.PaymentRequest;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.gateway.RazorpayGateway;
import com.sssit.bikerental.modules.payment.mapper.PaymentMapper;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;
import com.sssit.bikerental.modules.payment.service.PaymentCalculationService;
import com.sssit.bikerental.modules.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentCalculationService paymentCalculationService;
    private final PaymentMapper paymentMapper;
    private final RazorpayGateway razorpayGateway;

    /**
     * Prepare payment after confirmed bike return.
     *
     * The final amount is calculated completely
     * by the backend.
     */
    @Override
    @Transactional
    public PaymentResponse preparePayment(
            Long bookingId) {

        PaymentResponse calculation =
                paymentCalculationService
                        .calculatePayment(
                                bookingId
                        );

        Payment payment =
                paymentRepository
                        .findByBookingId(bookingId)
                        .orElse(null);

        if (payment != null) {

            validateCustomerOwnership(payment);

            if (payment.getPaymentStatus()
                    == PaymentStatus.SUCCESS) {

                throw new RuntimeException(
                        "Payment has already been completed"
                );
            }

            if (payment.getPaymentStatus()
                    == PaymentStatus.PENDING
                    && payment.getRazorpayOrderId()
                    != null) {

                return paymentMapper
                        .toResponse(payment);
            }

        } else {

            payment = Payment.builder()
                    .bookingId(
                            calculation.getBookingId())
                    .customerId(
                            calculation.getCustomerId())
                    .baseRentalAmount(
                            calculation.getBaseRentalAmount())
                    .lateCharge(
                            calculation.getLateCharge())
                    .eligibleTransactionAmount(
                            calculation
                                    .getEligibleTransactionAmount())
                    .platformFeePercent(
                            calculation
                                    .getPlatformFeePercent())
                    .platformFeeAmount(
                            calculation
                                    .getPlatformFeeAmount())
                    .taxAmount(
                            calculation.getTaxAmount())
                    .finalAmount(
                            calculation.getFinalAmount())
                    .paymentStatus(
                            PaymentStatus.PENDING)
                    .createdAt(
                            LocalDateTime.now())
                    .updatedAt(
                            LocalDateTime.now())
                    .build();

            payment =
                    paymentRepository.save(payment);
        }

        String razorpayOrderId;

        try {

            razorpayOrderId =
                    razorpayGateway.createOrder(
                            payment.getPaymentId(),
                            payment.getFinalAmount(),
                            "booking_" + bookingId
                    );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to create Razorpay order",
                    e
            );
        }

        payment.setRazorpayOrderId(
                razorpayOrderId);

        payment.setPaymentStatus(
                PaymentStatus.PENDING);

        payment.setUpdatedAt(
                LocalDateTime.now());

        payment =
                paymentRepository.save(payment);

        return paymentMapper
                .toResponse(payment);
    }
    @Override
    @Transactional
    public PaymentResponse processPayment(
            PaymentRequest request) {

        Payment payment =
                paymentRepository
                        .findById(
                                request.getPaymentId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"
                                ));

        validateCustomerOwnership(payment);

        if (payment.getPaymentStatus()
                == PaymentStatus.SUCCESS) {

            throw new RuntimeException(
                    "Payment has already been completed"
            );
        }

        if (!request.getRazorpayOrderId()
                .equals(
                    payment.getRazorpayOrderId())) {

            throw new RuntimeException(
                    "Razorpay order does not match"
            );
        }

        boolean verified =
                razorpayGateway.verifySignature(
                        request.getRazorpayOrderId(),
                        request.getRazorpayPaymentId(),
                        request.getRazorpaySignature()
                );

        if (!verified) {

            payment.setPaymentStatus(
                    PaymentStatus.FAILED
            );

            payment.setUpdatedAt(
                    LocalDateTime.now()
            );

            paymentRepository.save(payment);

            throw new RuntimeException(
                    "Payment verification failed"
            );
        }

        payment.setPaymentStatus(
                PaymentStatus.SUCCESS
        );

        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId()
        );

        payment.setTransactionId(
                request.getRazorpayPaymentId()
        );

        payment.setPaymentMethod(
                request.getPaymentMethod()
        );

        payment.setPaidAt(
                LocalDateTime.now()
        );

        payment.setUpdatedAt(
                LocalDateTime.now()
        );

        Payment saved =
                paymentRepository.save(payment);

        return paymentMapper.toResponse(saved);
    }

    /**
     * Get payment by ID.
     */
    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(
            Long paymentId) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found with id: "
                                                + paymentId
                                ));

        // Security check:
        // Customer can only view their own payment.
        validateCustomerOwnership(payment);

        return paymentMapper
                .toResponse(payment);
    }

    /**
     * Get customer payment history.
     */
    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentHistory(
            Long customerId) {

        Long currentUserId =
                SecurityUtils.getCurrentUserId();

        if (currentUserId == null) {

            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        if (!currentUserId.equals(customerId)) {

            throw new AccessDeniedException(
                    "You are not authorized to access this payment history"
            );
        }

        return paymentRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customerId
                )
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    /**
     * Get payment for a booking.
     */
    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(
            Long bookingId) {

        Payment payment =
                paymentRepository
                        .findByBookingId(bookingId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found for booking: "
                                                + bookingId
                                ));

        // Security check:
        // Customer can only view payment belonging
        // to their own account.
        validateCustomerOwnership(payment);

        return paymentMapper
                .toResponse(payment);
    }

    /**
     * Retry a failed payment.
     *
     * Razorpay retry/order creation will be
     * implemented later.
     */
    @Override
    public PaymentResponse retryPayment(
            Long paymentId) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found with id: "
                                                + paymentId
                                ));

        // Security check:
        // Only the owner of the payment can retry it.
        validateCustomerOwnership(payment);

        if (payment.getPaymentStatus()
                != PaymentStatus.FAILED) {

            throw new RuntimeException(
                    "Only failed payments can be retried"
            );
        }

        payment.setPaymentStatus(
                PaymentStatus.PENDING
        );

        payment.setUpdatedAt(
                LocalDateTime.now()
        );

        Payment updatedPayment =
                paymentRepository.save(payment);

        return paymentMapper
                .toResponse(updatedPayment);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository.findAll()
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }
    
    private void validateCustomerOwnership(
            Payment payment) {

        Long currentUserId =
                SecurityUtils.getCurrentUserId();

        if (currentUserId == null) {
            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        if (!currentUserId.equals(
                payment.getCustomerId())) {

            throw new AccessDeniedException(
                    "You are not authorized to access this payment"
            );
        }
    }
}