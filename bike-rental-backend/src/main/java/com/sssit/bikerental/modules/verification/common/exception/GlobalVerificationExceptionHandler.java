package com.sssit.bikerental.modules.verification.common.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Converts verification failures into a clean, consistent JSON error
 * response instead of a generic Spring 500 stack trace.
 *
 * Example response body:
 * {
 *   "status": "REJECTED",
 *   "message": "Please upload the full-length Aadhaar card image, including the QR code...",
 *   "timestamp": "2026-08-01T10:15:30"
 * }
 */
@RestControllerAdvice
public class GlobalVerificationExceptionHandler {

    @ExceptionHandler(QRVerificationException.class)
    public ResponseEntity<Map<String, Object>> handleVerificationException(
            QRVerificationException ex) {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "REJECTED");
        body.put("message", ex.getMessage());
        body.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(body);
    }

    // Defense in depth: AadhaarServiceImpl now self-heals the common
    // "same card re-submitted, unique aadhaarNumber collides at save
    // time" case internally. This handler only fires for a
    // DataIntegrityViolationException that isn't that case (e.g. a
    // genuinely different unique/constraint violation), so it still
    // comes back as a clean, understandable response instead of the
    // opaque generic 500.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "REJECTED");
        body.put("message", "This record conflicts with an existing entry (duplicate Aadhaar number or similar constraint).");
        body.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(body);
    }
}
