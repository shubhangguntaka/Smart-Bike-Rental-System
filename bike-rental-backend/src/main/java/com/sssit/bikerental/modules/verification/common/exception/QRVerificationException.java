package com.sssit.bikerental.modules.verification.common.exception;

/**
 * Thrown when an uploaded document/image fails a pre-check
 * (e.g. too small/cropped, unreadable, wrong format) before
 * OCR/QR processing can meaningfully run.
 *
 * Caught by {@link GlobalVerificationExceptionHandler} and turned
 * into a clean 400 response with the message shown here, instead
 * of a generic 500 error.
 */
public class QRVerificationException extends RuntimeException {

    public QRVerificationException(String message) {
        super(message);
    }

    public QRVerificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
