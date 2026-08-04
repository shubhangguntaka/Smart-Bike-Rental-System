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
                                .body(Map.of(
                                                "success", false,
                                                "message", "Resource not found"));
        }

        /**
         * Conflict (409)
         */
        @ExceptionHandler(ConflictException.class)
        public ResponseEntity<Object> handleConflictException(
                        ConflictException ex) {

                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of(
                                                "success", false,
                                                "message", "Conflict"));
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
         * Unauthorized
         */
        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<Object> handleUnauthorizedException(
                        UnauthorizedException ex) {

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                                "success", false,
                                                "message", "Unauthorized"));
        }

        /**
         * Access Denied (403)
         */
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<Object> handleAccessDeniedException(
                        AccessDeniedException ex) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of(
                                                "success", false,
                                                "message", "Access Denied"));
        }

        /**
         * Resource Ownership Exception (403)
         */
        @ExceptionHandler(ResourceOwnershipException.class)
        public ResponseEntity<Object> handleResourceOwnershipException(
                        ResourceOwnershipException ex) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of(
                                                "success", false,
                                                "message", ex.getMessage()));
        }

        /**
         * Unauthorized Operation Exception (403)
         */
        @ExceptionHandler(UnauthorizedOperationException.class)
        public ResponseEntity<Object> handleUnauthorizedOperationException(
                        UnauthorizedOperationException ex) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of(
                                                "success", false,
                                                "message", ex.getMessage()));
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
                                .body(Map.of(
                                                "success", false,
                                                "message", ex.getMessage()));
        }

}