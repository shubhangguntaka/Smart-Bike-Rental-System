package com.sssit.bikerental.modules.payment.entity;

public enum PaymentStatus {

    NOT_STARTED,
    READY_FOR_PAYMENT,
    PENDING,
    PROCESSING,
    SUCCESS,
    FAILED,
    CANCELLED
}