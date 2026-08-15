package com.sssit.bikerental.modules.booking.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.sssit.bikerental.common.response.ApiResponse;
import com.sssit.bikerental.modules.booking.dto.BookingRequest;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Validated
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create Booking
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @RequestParam Long customerId,
            @Valid @RequestBody BookingRequest request
    ) {
        BookingResponse response = bookingService.createBooking(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Booking created successfully.",
                        response));
    }

    /**
     * Update Booking
     */
    @PutMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingRequest request
    ) {
        BookingResponse response = bookingService.updateBooking(bookingId, request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking updated successfully.",
                        response));
    }

    /**
     * Get Booking By Id
     */
    @GetMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Long bookingId
    ) {
        BookingResponse response = bookingService.getBooking(bookingId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking fetched successfully.",
                        response));
    }

    /**
     * Get All Bookings
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> response = bookingService.getAllBookings();
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bookings fetched successfully.",
                        response));
    }

    /**
     * Get Customer Bookings
     */
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCustomerBookings(
            @PathVariable Long customerId
    ) {
        List<BookingResponse> response = bookingService.getCustomerBookings(customerId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer bookings fetched successfully.",
                        response));
    }

    /**
     * Get Bookings By Status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByStatus(
            @PathVariable BookingStatus status
    ) {
        List<BookingResponse> response = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bookings fetched successfully.",
                        response));
    }

    /**
     * Cancel Booking
     */
    @PutMapping("/{bookingId}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long bookingId
    ) {
        BookingResponse response = bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking cancelled successfully.",
                        response));
    }

    /**
     * Update Booking Status
     */
    @PutMapping("/{bookingId}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam BookingStatus status
    ) {
        BookingResponse response = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking status updated successfully.",
                        response));
    }

    /**
     * Check Verification Status
     */
    @GetMapping("/check-verification")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Boolean>> checkVerificationStatus(
            @RequestParam Long customerId
    ) {
        boolean verified = bookingService.checkVerificationStatus(customerId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Verification status checked successfully.",
                        verified));
    }

    /**
     * Check Bike Availability
     */
    @GetMapping("/check-availability")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @RequestParam Long bikeId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startTime,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime returnTime
    ) {
        boolean available = bookingService.isBikeAvailable(bikeId, startTime, returnTime);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Availability checked successfully.",
                        available));
    }

    /**
     * Confirm Booking
     */
    @PostMapping("/{bookingId}/confirm")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @PathVariable Long bookingId
    ) {
        BookingResponse response = bookingService.confirmBooking(bookingId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking confirmed successfully.",
                        response));
    }

    /**
     * Scan booking QR code and return the booking details
     */
    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> scanQRCode(
            @RequestParam(required = false) String qrCode,
            @RequestBody(required = false) java.util.Map<String, String> body
    ) {
        String token = qrCode;
        if ((token == null || token.trim().isEmpty()) && body != null) {
            token = body.get("qrCode");
        }
        BookingResponse response = bookingService.scanQRCode(token);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "QR Code scanned successfully.",
                        response));
    }

    /**
     * Get Live Ride Tracking
     */
    @GetMapping("/{bookingId}/tracking")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<com.sssit.bikerental.modules.booking.dto.RideTrackingDTO>> getRideTracking(
            @PathVariable Long bookingId
    ) {
        com.sssit.bikerental.modules.booking.dto.RideTrackingDTO response = bookingService.getRideTracking(bookingId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Ride tracking fetched successfully.",
                        response));
    }

    /**
     * Delete Booking
     */
    @DeleteMapping("/{bookingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(
            @PathVariable Long bookingId
    ) {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking deleted successfully.",
                        null));
    }

    /**
     * Handover bike to customer
     */
    @PostMapping("/{bookingId}/handover")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> handoverBooking(
            @PathVariable Long bookingId
    ) {
        BookingResponse response = bookingService.handoverBooking(bookingId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bike handed over successfully. Ride started.",
                        response));
    }

    /**
     * Return bike from customer
     */
    @PostMapping("/{bookingId}/return")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> returnBooking(
            @PathVariable Long bookingId
    ) {
        BookingResponse response = bookingService.returnBooking(bookingId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bike returned successfully. Rental completed.",
                        response));
    }
}