package com.sssit.bikerental.modules.payment.service;

import com.sssit.bikerental.modules.payment.dto.PaymentRequest;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;

public interface PaymentService {
    /**
     * Simulates payment processing, records transaction, and updates corresponding Booking statuses.
     */
    PaymentResponse processPayment(PaymentRequest request);
}
