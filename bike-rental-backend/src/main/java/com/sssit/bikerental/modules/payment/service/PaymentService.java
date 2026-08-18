package com.sssit.bikerental.modules.payment.service;

import com.sssit.bikerental.modules.payment.dto.PaymentRequest;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    /**
     * Existing payment processing contract.
     */
    PaymentResponse processPayment(
            PaymentRequest request
    );

    /**
     * Read-only payment history for administrative
     * monitoring.
     *
     * This does not modify payment business logic.
     */
    List<PaymentResponse> getAllPayments();
}