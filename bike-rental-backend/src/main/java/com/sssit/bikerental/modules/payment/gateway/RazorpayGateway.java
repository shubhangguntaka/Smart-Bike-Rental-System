package com.sssit.bikerental.modules.payment.gateway;

import java.math.BigDecimal;

public interface RazorpayGateway {

    String createOrder(
            Long paymentId,
            BigDecimal amount,
            String receipt
    ) throws Exception;

    boolean verifySignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    );
}