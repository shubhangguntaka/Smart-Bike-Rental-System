package com.sssit.bikerental.modules.payment.service;

import com.sssit.bikerental.modules.payment.dto.PaymentResponse;

public interface PaymentCalculationService {

    PaymentResponse calculatePayment(Long bookingId);
}