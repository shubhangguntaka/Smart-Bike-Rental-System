package com.sssit.bikerental.common.exception;

import com.sssit.bikerental.common.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailSendException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        /**
         * Resource Not Found
         */
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<Object> handleResourceNotFoundException(
                        ResourceNotFoundException ex) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.error(
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "Resource not found"));
        }

        /**
         * Booking Not Found
         */
        @ExceptionHandler(com.sssit.bikerental.modules.booking.exception.BookingNotFoundException.class)
        public ResponseEntity<ApiResponse<Object>> handleBookingNotFoundException(
                        com.sssit.bikerental.modules.booking.exception.BookingNotFoundException ex) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Conflict (409)
         */
        @ExceptionHandler(ConflictException.class)
        public ResponseEntity<Object> handleConflictException(
                        ConflictException ex) {

               return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(ApiResponse.error(
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "Conflict"));
        }

        /**
         * Business Validation
         */
        @ExceptionHandler(ValidationException.class)
        public ResponseEntity<ApiResponse<Object>> handleValidationException(
                        ValidationException ex) {

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Verification Required Exception
         */
        @ExceptionHandler(com.sssit.bikerental.modules.booking.exception.VerificationRequiredException.class)
        public ResponseEntity<ApiResponse<Object>> handleVerificationRequiredException(
                        com.sssit.bikerental.modules.booking.exception.VerificationRequiredException ex) {

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error("VERIFICATION_REQUIRED", ex.getMessage()));
        }

        /**
         * Booking Not Available Exception
         */
        @ExceptionHandler(com.sssit.bikerental.modules.booking.exception.BookingNotAvailableException.class)
        public ResponseEntity<ApiResponse<Object>> handleBookingNotAvailableException(
                        com.sssit.bikerental.modules.booking.exception.BookingNotAvailableException ex) {

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Invalid Booking Exception
         */
        @ExceptionHandler(com.sssit.bikerental.modules.booking.exception.InvalidBookingException.class)
        public ResponseEntity<ApiResponse<Object>> handleInvalidBookingException(
                        com.sssit.bikerental.modules.booking.exception.InvalidBookingException ex) {

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Unauthorized
         */
        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<Object> handleUnauthorizedException(
                        UnauthorizedException ex) {

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(ApiResponse.error("Unauthorized"));
        }

        /**
         * Access Denied (403)
         */
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<Object> handleAccessDeniedException(
                        AccessDeniedException ex) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.error("Access Denied"));
        }

        /**
         * Resource Ownership Exception (403)
         */
        @ExceptionHandler(ResourceOwnershipException.class)
        public ResponseEntity<Object> handleResourceOwnershipException(
                        ResourceOwnershipException ex) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Unauthorized Operation Exception (403)
         */
        @ExceptionHandler(UnauthorizedOperationException.class)
        public ResponseEntity<Object> handleUnauthorizedOperationException(
                        UnauthorizedOperationException ex) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * File Upload Exception
         */
        @ExceptionHandler(FileStorageException.class)
        public ResponseEntity<ApiResponse<Object>> handleFileStorageException(
                        FileStorageException ex) {

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Bean Validation (@Valid)
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Object>> handleMethodArgumentNotValidException(
                        MethodArgumentNotValidException ex) {

                Map<String, String> errors = new LinkedHashMap<>();

                for (FieldError error : ex.getBindingResult().getFieldErrors()) {
                        errors.put(error.getField(), error.getDefaultMessage());
                }

                return ResponseEntity.badRequest()
                                .body(ApiResponse.error("Validation Failed", errors));
        }

        /**
         * Illegal Arguments
         */
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(
                        IllegalArgumentException ex) {

                return ResponseEntity.badRequest()
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Mail delivery failures (SMTP / TLS)
         */
        @ExceptionHandler(MailSendException.class)
        public ResponseEntity<ApiResponse<Object>> handleMailSendException(
                        MailSendException ex) {

                ex.printStackTrace();

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error(
                                                "Unable to send OTP email. Please check mail SMTP/TLS settings and try again."));
        }

        /**
         * Authentication & Bad Credentials
         */
        @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
        public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(
                        org.springframework.security.authentication.BadCredentialsException ex) {

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error("Invalid email or password."));
        }

        @ExceptionHandler(org.springframework.security.authentication.DisabledException.class)
        public ResponseEntity<ApiResponse<Object>> handleDisabledException(
                        org.springframework.security.authentication.DisabledException ex) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error("Your account is disabled or unverified."));
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ApiResponse<Object>> handleRuntimeException(
                        RuntimeException ex) {

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Unexpected Exceptions
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Object>> handleGlobalException(
                        Exception ex) {

                ex.printStackTrace();

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error("Something went wrong. Please try again later."));
        }

        @ExceptionHandler(RefreshTokenException.class)
        public ResponseEntity<?> handleRefreshTokenException(
                        RefreshTokenException ex) {

               return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(ApiResponse.error(ex.getMessage()));
        }

}