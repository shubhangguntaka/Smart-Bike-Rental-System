package com.sssit.bikerental.modules.payment.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.payment.dto.PaymentRequest;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

        private final PaymentService paymentService;

        /**
         * Prepare payment after confirmed bike return.
         *
         * The backend calculates the final payable amount.
         */
        @PostMapping("/prepare/{bookingId}")
        public ResponseEntity<PaymentResponse> preparePayment(@PathVariable Long bookingId) {

                return ResponseEntity.ok(
                                paymentService.preparePayment(bookingId));
        }

        /**
         * Process payment.
         *
         * Razorpay integration will be connected
         * in Day 3/Day 4.
         */
        @PostMapping("/process")
        public ResponseEntity<PaymentResponse> processPayment(
                        @Valid @RequestBody PaymentRequest request) {

                return ResponseEntity.ok(
                                paymentService.processPayment(request));
        }

        /**
         * Get payment details.
         */
        @GetMapping("/{id}")
        public ResponseEntity<PaymentResponse> getPayment(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                paymentService.getPaymentById(id));
        }

        /**
         * Get customer's payment history.
         *
         * Authentication is used to identify the
         * logged-in customer.
         *
         * Customer ID extraction will be connected
         * to your existing JWT user implementation.
         */
        @GetMapping("/history")
        public ResponseEntity<List<PaymentResponse>> getPaymentHistory() {

                Long customerId = SecurityUtils.getCurrentUserId();

                if (customerId == null) {

                        throw new IllegalStateException(
                                        "Authenticated customer not found");
                }

                return ResponseEntity.ok(
                                paymentService.getPaymentHistory(
                                                customerId));
        }

        /**
         * Get payment for a specific booking.
         */
        @GetMapping("/booking/{bookingId}")
        public ResponseEntity<PaymentResponse> getPaymentByBooking(
                        @PathVariable Long bookingId) {

                return ResponseEntity.ok(
                                paymentService.getPaymentByBookingId(
                                                bookingId));
        }

        /**
         * Retry failed payment.
         */
        @PostMapping("/{id}/retry")
        public ResponseEntity<PaymentResponse> retryPayment(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                paymentService.retryPayment(id));
        }
}