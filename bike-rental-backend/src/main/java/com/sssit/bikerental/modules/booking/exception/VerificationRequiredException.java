package com.sssit.bikerental.modules.booking.exception;

public class VerificationRequiredException extends RuntimeException {
    public VerificationRequiredException(String message) {
        super(message);
    }
}
