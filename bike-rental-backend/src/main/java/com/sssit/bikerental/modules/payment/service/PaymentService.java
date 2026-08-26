package com.sssit.bikerental.modules.payment.service;

import java.util.List;

import com.sssit.bikerental.modules.payment.dto.PaymentRequest;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;

public interface PaymentService {

	PaymentResponse preparePayment(
	        Long bookingId);

	PaymentResponse processPayment(
	        PaymentRequest request);

	PaymentResponse getPaymentById(
	        Long paymentId);

	PaymentResponse getPaymentByBookingId(
	        Long bookingId);

	List<PaymentResponse> getPaymentHistory(
	        Long customerId);

	PaymentResponse retryPayment(
	        Long paymentId);

	List<PaymentResponse> getAllPayments();
}