package com.sssit.bikerental.modules.payment.service.impl;

import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.enums.PaymentStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.booking.service.QRCodeService;
import com.sssit.bikerental.modules.payment.dto.PaymentRequest;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;
import com.sssit.bikerental.modules.payment.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final QRCodeService qrCodeService;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            QRCodeService qrCodeService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.qrCodeService = qrCodeService;
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Executing processPayment for bookingId: {} with amount: {}", request.getBookingId(), request.getAmount());

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> {
                    log.error("Payment failed: BookingId: {} not found.", request.getBookingId());
                    return new IllegalArgumentException("Booking not found with ID: " + request.getBookingId());
                });

        boolean isSuccess = "SUCCESS".equalsIgnoreCase(request.getStatus());

        // 1. Persist the Payment record
        Payment payment = Payment.builder()
                .bookingId(request.getBookingId())
                .amount(request.getAmount())
                .status(isSuccess ? "SUCCESS" : "FAILED")
                .paymentDate(LocalDateTime.now())
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment record created: ID: {}, Status: {}", payment.getId(), payment.getStatus());

        // 2. Transition booking and payment statuses based on outcome
        if (isSuccess) {
            booking.setBookingStatus(BookingStatus.CONFIRMED);
            booking.setPaymentStatus(PaymentStatus.SUCCESS);
            log.info("BookingId: {} status set to CONFIRMED and PaymentStatus to SUCCESS", booking.getId());

            // Generate booking QR code if not already present
            if (booking.getQrCode() == null || booking.getQrCode().isEmpty()) {
                String qrText = String.format("BOOKING-REF: BK-%d | Bike: %d | Renter: %d | Amount: %s",
                        booking.getId(), booking.getBikeId(), booking.getCustomerId(), booking.getRentalAmount().toString());
                String qrData = qrCodeService.generateQRCode(qrText, 250, 250);
                booking.setQrCode(qrData);
                log.info("QR Code generated for BookingId: {}", booking.getId());
            }
        } else {
            booking.setBookingStatus(BookingStatus.PENDING);
            booking.setPaymentStatus(PaymentStatus.FAILED);
            log.info("BookingId: {} payment failed, status set to PENDING / PaymentStatus to FAILED", booking.getId());
        }

        bookingRepository.save(booking);

        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .bookingId(payment.getBookingId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}
