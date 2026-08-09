package com.sssit.bikerental.modules.booking.service;

import java.math.BigDecimal;
import java.util.List;

import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.dto.BookingRequest;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;

public interface BookingService {

    /**
     * Create a new booking.
     */
    BookingResponse createBooking(Long customerId, BookingRequest request);

    /**
     * Update an existing booking.
     */
    BookingResponse updateBooking(Long bookingId, BookingRequest request);

    /**
     * Cancel an existing booking.
     */
    BookingResponse cancelBooking(Long bookingId);

    /**
     * Get booking details by ID.
     */
    BookingResponse getBooking(Long bookingId);

    /**
     * Get all bookings.
     */
    List<BookingResponse> getAllBookings();

    /**
     * Get bookings of a customer.
     */
    List<BookingResponse> getCustomerBookings(Long customerId);

    /**
     * Check if a customer is verified (Aadhaar + DL).
     */
    boolean checkVerificationStatus(Long customerId);

    /**
     * Confirm a booking, change status to CONFIRMED, set payment PENDING, generate QR code.
     */
    BookingResponse confirmBooking(Long bookingId);

    /**
     * Calculate rental amount based on bike price per day and total days.
     */
    BigDecimal calculateRentalAmount(Long bikeId, int totalDays);

    /**
     * Scan booking QR code and return the booking details.
     */
    BookingResponse scanQRCode(String qrCode);

    /**
     * Get live ride tracking details for an active booking.
     */
    com.sssit.bikerental.modules.booking.dto.RideTrackingDTO getRideTracking(Long bookingId);
    
    /**
     * Check if a bike is available for a given time duration.
     */
    boolean isBikeAvailable(Long bikeId, java.time.LocalDateTime startTime, java.time.LocalDateTime returnTime);

    // ==========================================
    // Backward Compatibility Interfaces
    // ==========================================

    BookingResponse getBookingById(Long bookingId);

    List<BookingResponse> getBookingsByCustomer(Long customerId);

    List<BookingResponse> getBookingsByStatus(BookingStatus bookingStatus);

    BookingResponse updateBookingStatus(Long bookingId, BookingStatus bookingStatus);

    void deleteBooking(Long bookingId);
}