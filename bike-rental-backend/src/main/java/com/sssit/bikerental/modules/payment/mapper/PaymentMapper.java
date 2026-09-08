package com.sssit.bikerental.modules.payment.mapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.payment.dto.InvoiceDTO;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.entity.Payment;

@Component
public class PaymentMapper {

    @Value("${RAZORPAY_KEY_ID:rzp_test_placeholder}")
    private String razorpayKeyId;

    public PaymentResponse toResponse(Payment payment) {
        if (payment == null) {
            return null;
        }

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .bookingId(payment.getBookingId())
                .customerId(payment.getCustomerId())
                .ownerId(payment.getOwnerId())
                .baseRentalAmount(payment.getBaseRentalAmount())
                .lateCharge(payment.getLateCharge())
                .eligibleTransactionAmount(payment.getEligibleTransactionAmount())
                .platformFeePercent(payment.getPlatformFeePercent())
                .platformFeeAmount(payment.getPlatformFeeAmount())
                .taxAmount(payment.getTaxAmount())
                .finalAmount(payment.getFinalAmount())
                .ownerShareAmount(payment.getOwnerShareAmount() != null 
                        ? payment.getOwnerShareAmount() 
                        : (payment.getBaseRentalAmount() != null 
                                ? payment.getBaseRentalAmount().add(payment.getLateCharge() != null ? payment.getLateCharge() : java.math.BigDecimal.ZERO) 
                                : java.math.BigDecimal.ZERO))
                .adminShareAmount(payment.getAdminShareAmount() != null 
                        ? payment.getAdminShareAmount() 
                        : (payment.getPlatformFeeAmount() != null 
                                ? payment.getPlatformFeeAmount().add(payment.getTaxAmount() != null ? payment.getTaxAmount() : java.math.BigDecimal.ZERO) 
                                : java.math.BigDecimal.ZERO))
                .ownerBankName(payment.getOwnerBankName())
                .ownerAccountNumber(payment.getOwnerAccountNumber())
                .ownerIfscCode(payment.getOwnerIfscCode())
                .ownerUpiId(payment.getOwnerUpiId())
                .ownerPayoutUtr(payment.getOwnerPayoutUtr())
                .adminBankName(payment.getAdminBankName())
                .adminAccountNumber(payment.getAdminAccountNumber())
                .adminIfscCode(payment.getAdminIfscCode())
                .adminUpiId(payment.getAdminUpiId())
                .adminPayoutUtr(payment.getAdminPayoutUtr())
                .payoutStatus(payment.getPayoutStatus())
                .payoutSettledAt(payment.getPayoutSettledAt())
                .paymentStatus(payment.getPaymentStatus())
                .transactionId(payment.getTransactionId())
                .paymentMethod(payment.getPaymentMethod())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .razorpayKeyId(razorpayKeyId)
                .paidAt(payment.getPaidAt())
                .invoiceNumber(payment.getInvoiceNumber())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    public InvoiceDTO toInvoiceDTO(Payment payment) {
        return toInvoiceDTO(payment, null);
    }

    public InvoiceDTO toInvoiceDTO(Payment payment, com.sssit.bikerental.modules.user.User customer) {
        if (payment == null) {
            return null;
        }

        InvoiceDTO.InvoiceDTOBuilder builder = InvoiceDTO.builder()
                .invoiceNumber(payment.getInvoiceNumber())
                .paymentId(payment.getPaymentId())
                .bookingId(payment.getBookingId())
                .customerId(payment.getCustomerId())
                .baseRentalAmount(payment.getBaseRentalAmount())
                .lateCharge(payment.getLateCharge())
                .eligibleTransactionAmount(payment.getEligibleTransactionAmount())
                .platformFeePercent(payment.getPlatformFeePercent())
                .platformFeeAmount(payment.getPlatformFeeAmount())
                .taxAmount(payment.getTaxAmount())
                .finalAmount(payment.getFinalAmount())
                .paymentStatus(payment.getPaymentStatus() != null ? payment.getPaymentStatus().name() : null)
                .transactionId(payment.getTransactionId())
                .paymentMethod(payment.getPaymentMethod())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt());

        if (customer != null) {
            builder.customerName(customer.getFullName())
                    .customerEmail(customer.getEmail())
                    .customerPhone(customer.getPhoneNumber());
        }

        return builder.build();
    }
}