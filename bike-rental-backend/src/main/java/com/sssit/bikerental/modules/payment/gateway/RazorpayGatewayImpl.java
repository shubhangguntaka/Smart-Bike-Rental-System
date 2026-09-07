package com.sssit.bikerental.modules.payment.gateway;

import java.math.BigDecimal;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RazorpayGatewayImpl
        implements RazorpayGateway {

    private final RazorpayClient razorpayClient;

    @Value("${RAZORPAY_KEY_SECRET}")
    private String razorpayKeySecret;

    @Override
    public String createOrder(
            Long paymentId,
            BigDecimal amount,
            String receipt)
            throws Exception {

        long amountInPaise =
                amount
                    .multiply(BigDecimal.valueOf(100))
                    .longValueExact();

        if (amountInPaise < 100) {
            amountInPaise = 100;
        }

        JSONObject options =
                new JSONObject();

        options.put(
                "amount",
                amountInPaise
        );

        options.put(
                "currency",
                "INR"
        );

        options.put(
                "receipt",
                receipt
        );

        com.razorpay.Order order =
                razorpayClient.orders.create(
                        options
                );

        return order.get("id");
    }

    @Override
    public boolean verifySignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) {

        try {

            JSONObject options =
                    new JSONObject();

            options.put(
                    "razorpay_order_id",
                    razorpayOrderId
            );

            options.put(
                    "razorpay_payment_id",
                    razorpayPaymentId
            );

            options.put(
                    "razorpay_signature",
                    razorpaySignature
            );

            return Utils.verifyPaymentSignature(
                    options,
                    razorpayKeySecret
            );

        } catch (Exception e) {

            return false;
        }
    }
}