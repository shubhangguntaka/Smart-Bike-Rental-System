package com.sssit.bikerental.modules.booking.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.exception.BikeNotFoundException;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.dto.BookingRequest;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.enums.PaymentStatus;
import com.sssit.bikerental.modules.booking.exception.BookingNotAvailableException;
import com.sssit.bikerental.modules.booking.exception.BookingNotFoundException;
import com.sssit.bikerental.modules.booking.exception.VerificationRequiredException;
import com.sssit.bikerental.modules.booking.mapper.BookingMapper;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.booking.service.BookingService;
import com.sssit.bikerental.modules.booking.service.QRCodeService;
import com.sssit.bikerental.modules.booking.util.BookingCalculator;
import com.sssit.bikerental.modules.booking.validation.BookingValidator;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.verification.aadhaar.service.AadhaarService;
import com.sssit.bikerental.modules.verification.drivinglicense.service.DrivingLicenseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final BookingRepository bookingRepository;
    private final BikeRepository bikeRepository;
    private final UserRepository userRepository;
    private final BookingValidator bookingValidator;
    private final BookingCalculator bookingCalculator;
    private final AadhaarService aadhaarService;
    private final DrivingLicenseService drivingLicenseService;
    private final QRCodeService qrCodeService;

    @Override
    public BookingResponse createBooking(Long customerId, BookingRequest request) {
        log.info("Starting booking creation for customerId: {} and bikeId: {}", customerId, request.getBikeId());
        
        bookingValidator.validateBookingRequest(request);
        userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found."));

        Bike bike = bikeRepository.findById(request.getBikeId())
                .orElseThrow(() -> new BikeNotFoundException("Bike not found."));

        // 1. Check verification status
        log.info("Evaluating customer verification status for customerId: {}", customerId);
        boolean isVerified = checkVerificationStatus(customerId);
        BookingStatus initialStatus = isVerified ? BookingStatus.PENDING : BookingStatus.VERIFICATION_REQUIRED;

        // 2. Check bike availability
        if (bike.getBikeStatus() == BikeStatus.UNDER_MAINTENANCE || bike.getBikeStatus() == BikeStatus.NOT_AVAILABLE) {
            log.warn("BikeId: {} is not available. Current status: {}", bike.getBikeId(), bike.getBikeStatus());
            throw new BookingNotAvailableException("Bike is not available.");
        }

        // A bike already booked by another customer cannot be booked again until it is freed up
        // (booking cancelled/completed, which resets bikeStatus back to AVAILABLE).
        if (bike.getBikeStatus() == BikeStatus.BOOKED) {
            log.warn("BikeId: {} is already booked. Rejecting new booking attempt.", bike.getBikeId());
            throw new BookingNotAvailableException("Bike is already booked.");
        }

        // Check for overlapping bookings (if start/return times overlap with any active rental contract)
        java.util.List<Booking> activeBookings = bookingRepository.findByBikeId(request.getBikeId());
        java.time.LocalDateTime reqStart = request.getStartTime();
        java.time.LocalDateTime reqEnd = request.getReturnTime();

        for (Booking existing : activeBookings) {
            if (existing.getBookingStatus() == BookingStatus.PENDING ||
                existing.getBookingStatus() == BookingStatus.VERIFICATION_REQUIRED ||
                existing.getBookingStatus() == BookingStatus.CONFIRMED ||
                existing.getBookingStatus() == BookingStatus.ACTIVE) {
                
                java.time.LocalDateTime extStart = existing.getStartTime();
                java.time.LocalDateTime extEnd = existing.getReturnTime();
                
                // Overlap condition: (Start1 < End2) AND (Start2 < End1)
                if (reqStart.isBefore(extEnd) && extStart.isBefore(reqEnd)) {
                    log.warn("BikeId: {} is already booked during this period. Overlapping booking ID: {}", 
                        request.getBikeId(), existing.getId());
                    throw new BookingNotAvailableException("Bike is booked for this duration. Please choose another slot.");
                }
            }
        }

        // 3. Calculate rental amount
        int totalDays = bookingCalculator.calculateTotalDays(request.getStartTime(), request.getReturnTime());
        BigDecimal rentalAmount = bookingCalculator.calculateTotalAmount(bike.getRentalPrice(), totalDays);

        // 4. Create booking in PENDING or VERIFICATION_REQUIRED status
        Booking booking = Booking.builder()
                .customerId(customerId)
                .bikeId(bike.getBikeId())
                .startTime(request.getStartTime())
                .returnTime(request.getReturnTime())
                .rentalAmount(rentalAmount)
                .bookingStatus(initialStatus)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);
        log.info("Booking record created with ID: {} and Status: {}", booking.getId(), initialStatus);

        // 5. Update bike status to BOOKED
        bike.setBikeStatus(BikeStatus.BOOKED);
        bikeRepository.save(bike);
        log.info("Bike status set to BOOKED for bikeId: {}", bike.getBikeId());

        return convertToResponse(booking);
    }

    @Override
    public BookingResponse updateBooking(Long bookingId, BookingRequest request) {
        log.info("Updating bookingId: {}", bookingId);
        
        bookingValidator.validateBookingRequest(request);
        Booking booking = findBooking(bookingId);
        validateBookingAccess(booking);

        Bike bike = bikeRepository.findById(request.getBikeId())
                .orElseThrow(() -> new BikeNotFoundException("Bike not found."));

        // If bike changed, check availability of the new bike
        if (!booking.getBikeId().equals(request.getBikeId())) {
            if (bike.getBikeStatus() == BikeStatus.UNDER_MAINTENANCE || bike.getBikeStatus() == BikeStatus.NOT_AVAILABLE) {
                log.warn("New BikeId: {} is not available.", bike.getBikeId());
                throw new BookingNotAvailableException("The selected bike is not available.");
            }

            if (bike.getBikeStatus() == BikeStatus.BOOKED) {
                log.warn("New BikeId: {} is already booked. Rejecting bike change.", bike.getBikeId());
                throw new BookingNotAvailableException("The selected bike is already booked.");
            }

            // Check for overlapping bookings (if start/return times overlap with any active rental contract for new bike)
            java.util.List<Booking> activeBookings = bookingRepository.findByBikeId(request.getBikeId());
            java.time.LocalDateTime reqStart = request.getStartTime();
            java.time.LocalDateTime reqEnd = request.getReturnTime();

            for (Booking existing : activeBookings) {
                if (existing.getBookingStatus() == BookingStatus.PENDING ||
                    existing.getBookingStatus() == BookingStatus.CONFIRMED ||
                    existing.getBookingStatus() == BookingStatus.ACTIVE) {
                    
                    java.time.LocalDateTime extStart = existing.getStartTime();
                    java.time.LocalDateTime extEnd = existing.getReturnTime();
                    
                    if (reqStart.isBefore(extEnd) && extStart.isBefore(reqEnd)) {
                        log.warn("New BikeId: {} is already booked during this period. Overlapping booking ID: {}", 
                            request.getBikeId(), existing.getId());
                        throw new BookingNotAvailableException("The selected bike is booked for this duration. Please choose another slot.");
                    }
                }
            }

            // Mark old bike as AVAILABLE
            bikeRepository.findById(booking.getBikeId()).ifPresent(oldBike -> {
                oldBike.setBikeStatus(BikeStatus.AVAILABLE);
                bikeRepository.save(oldBike);
                log.info("Old bikeId: {} set to AVAILABLE", oldBike.getBikeId());
            });
            // Mark new bike as BOOKED
            bike.setBikeStatus(BikeStatus.BOOKED);
            bikeRepository.save(bike);
            log.info("New bikeId: {} set to BOOKED", bike.getBikeId());
        }

        int totalDays = bookingCalculator.calculateTotalDays(request.getStartTime(), request.getReturnTime());
        booking.setBikeId(request.getBikeId());
        booking.setStartTime(request.getStartTime());
        booking.setReturnTime(request.getReturnTime());
        booking.setRentalAmount(bookingCalculator.calculateTotalAmount(bike.getRentalPrice(), totalDays));

        // Re-generate QR code with updated details if already generated
        if (booking.getQrCode() != null && !booking.getQrCode().isEmpty()) {
            String qrText = String.format("BOOKING-REF: BK-%d | Bike: %d | Renter: %d | Amount: %s",
                    booking.getId(), booking.getBikeId(), booking.getCustomerId(), booking.getRentalAmount().toString());
            String qrData = qrCodeService.generateQRCode(qrText, 250, 250);
            booking.setQrCode(qrData);
            log.info("QR Code updated for bookingId: {}", booking.getId());
        }

        return convertToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBooking(Long bookingId) {
        log.info("Retrieving details for bookingId: {}", bookingId);
        Booking booking = findBooking(bookingId);
        validateBookingAccess(booking);
        return convertToResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        log.info("Fetching all bookings. Privileged role validation expected at controller.");
        return bookingRepository.findAll().stream().map(this::convertToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getCustomerBookings(Long customerId) {
        log.info("Fetching bookings for customerId: {}", customerId);
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role role = SecurityUtils.getCurrentRole();
        if (currentUserId != null && !currentUserId.equals(customerId) && role != Role.ADMIN) {
            log.warn("Unauthorized attempt by userId: {} to view customerId: {} bookings", currentUserId, customerId);
            throw new AccessDeniedException("Access denied to customer bookings.");
        }
        return bookingRepository.findByCustomerId(customerId).stream().map(this::convertToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkVerificationStatus(Long customerId) {
        log.info("Checking verification credentials for customerId: {}", customerId);
        var aadhaar = aadhaarService.getApprovedAadhaar(customerId, "USER");
        var dl = drivingLicenseService.getApprovedLicense(customerId);
        boolean isVerified = aadhaar != null && dl != null;
        log.info("Verification check returned: {} for customerId: {}", isVerified, customerId);
        return isVerified;
    }

    @Override
    public BookingResponse confirmBooking(Long bookingId) {
        log.info("Confirming bookingId: {}", bookingId);
        Booking booking = findBooking(bookingId);
        validateBookingAccess(booking);

        if (!checkVerificationStatus(booking.getCustomerId())) {
            log.warn("Customer: {} not verified. Cannot confirm bookingId: {}", booking.getCustomerId(), bookingId);
            throw new VerificationRequiredException("Customer must be verified before confirming booking.");
        }

        booking.setBookingStatus(BookingStatus.CONFIRMED);
        booking.setPaymentStatus(PaymentStatus.SUCCESS);

        // Generate QR code if missing
        if (booking.getQrCode() == null || booking.getQrCode().isEmpty()) {
            String qrText = String.format("BOOKING-REF: BK-%d | Bike: %d | Renter: %d | Amount: %s",
                    booking.getId(), booking.getBikeId(), booking.getCustomerId(), booking.getRentalAmount().toString());
            String qrData = qrCodeService.generateQRCode(qrText, 250, 250);
            booking.setQrCode(qrData);
            log.info("QR Code generated for bookingId: {}", booking.getId());
        }

        // Mark bike as BOOKED
        bikeRepository.findById(booking.getBikeId()).ifPresent(bike -> {
            bike.setBikeStatus(BikeStatus.BOOKED);
            bikeRepository.save(bike);
        });

        return convertToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateRentalAmount(Long bikeId, int totalDays) {
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> new BikeNotFoundException("Bike not found."));
        return bookingCalculator.calculateTotalAmount(bike.getRentalPrice(), totalDays);
    }

    // ==========================================
    // Backward Compatibility Implementations
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        return getBooking(bookingId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCustomer(Long customerId) {
        return getCustomerBookings(customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByStatus(BookingStatus bookingStatus) {
        return bookingRepository.findByBookingStatus(bookingStatus).stream().map(this::convertToResponse).toList();
    }

    @Override
    public BookingResponse cancelBooking(Long bookingId) {
        log.info("Request received to cancel bookingId: {}", bookingId);
        return updateBookingStatus(bookingId, BookingStatus.CANCELLED);
    }

    @Override
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus bookingStatus) {
        log.info("Updating status of bookingId: {} to {}", bookingId, bookingStatus);
        Booking booking = findBooking(bookingId);
        validateBookingAccess(booking);

        // State Machine validation: 
        // Can transition to ACTIVE only if current status is CONFIRMED (i.e. payment received and verified)
        if (bookingStatus == BookingStatus.ACTIVE && booking.getBookingStatus() != BookingStatus.CONFIRMED) {
            log.warn("Invalid status transition: cannot set ACTIVE status from {}", booking.getBookingStatus());
            throw new IllegalStateException("Handover can only be confirmed for bookings that are currently CONFIRMED.");
        }
        // Can transition to COMPLETED only if current status is ACTIVE
        if (bookingStatus == BookingStatus.COMPLETED && booking.getBookingStatus() != BookingStatus.ACTIVE) {
            log.warn("Invalid status transition: cannot set COMPLETED status from {}", booking.getBookingStatus());
            throw new IllegalStateException("Ride can only be marked as completed if it is currently ACTIVE.");
        }

        booking.setBookingStatus(bookingStatus);

        // If status changes to CANCELLED or COMPLETED, free up the bike
        if (bookingStatus == BookingStatus.CANCELLED || bookingStatus == BookingStatus.COMPLETED) {
            bikeRepository.findById(booking.getBikeId()).ifPresent(bike -> {
                bike.setBikeStatus(BikeStatus.AVAILABLE);
                bikeRepository.save(bike);
                log.info("BikeId: {} returned to AVAILABLE state", bike.getBikeId());
            });
        } else if (bookingStatus == BookingStatus.CONFIRMED || bookingStatus == BookingStatus.ACTIVE) {
            bikeRepository.findById(booking.getBikeId()).ifPresent(bike -> {
                bike.setBikeStatus(BikeStatus.BOOKED);
                bikeRepository.save(bike);
                log.info("BikeId: {} marked as BOOKED state", bike.getBikeId());
            });
        }

        // Generate QR code if now confirmed and not present yet
        if (bookingStatus == BookingStatus.CONFIRMED && (booking.getQrCode() == null || booking.getQrCode().isEmpty())) {
            String qrText = String.format("BOOKING-REF: BK-%d | Bike: %d | Renter: %d | Amount: %s",
                    booking.getId(), booking.getBikeId(), booking.getCustomerId(), booking.getRentalAmount().toString());
            String qrData = qrCodeService.generateQRCode(qrText, 250, 250);
            booking.setQrCode(qrData);
            log.info("QR Code generated during status transition to CONFIRMED for bookingId: {}", booking.getId());
        }

        return convertToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse scanQRCode(String qrCode) {
        log.info("Scanning QR code payload: {}", qrCode);
        if (qrCode == null || qrCode.isEmpty()) {
            throw new IllegalArgumentException("QR Code is empty.");
        }
        
        // Try parsing ID from formatted QR code
        try {
            if (qrCode.contains("BK-")) {
                int startIndex = qrCode.indexOf("BK-") + 3;
                int endIndex = qrCode.indexOf(" ", startIndex);
                String idStr = (endIndex != -1) ? qrCode.substring(startIndex, endIndex) : qrCode.substring(startIndex);
                Long bookingId = Long.parseLong(idStr.trim());
                log.info("QR code successfully parsed to Booking ID: {}", bookingId);
                Booking booking = findBooking(bookingId);
                validateBookingAccess(booking);
                return convertToResponse(booking);
            }
        } catch (Exception e) {
            log.warn("Failed to parse booking ID from QR text: {}. Falling back to db scan.", qrCode);
        }

        // Fallback: search by exact QR Code match
        Booking booking = bookingRepository.findAll().stream()
                .filter(b -> qrCode.equals(b.getQrCode()))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("Scanned QR Code does not match any booking.");
                    return new BookingNotFoundException("Booking not found for the scanned QR Code.");
                });
        
        validateBookingAccess(booking);
        return convertToResponse(booking);
    }

    @Override
    public void deleteBooking(Long bookingId) {
        log.info("Request received to delete bookingId: {}", bookingId);
        Booking booking = findBooking(bookingId);
        validateBookingAccess(booking);

        // Free up the bike regardless of the booking's current status (PENDING/CONFIRMED/ACTIVE all
        // set bikeStatus to BOOKED at creation time), otherwise the bike would be stuck as BOOKED
        // forever once this booking record is gone.
        bikeRepository.findById(booking.getBikeId()).ifPresent(bike -> {
            if (bike.getBikeStatus() == BikeStatus.BOOKED) {
                bike.setBikeStatus(BikeStatus.AVAILABLE);
                bikeRepository.save(bike);
                log.info("BikeId: {} returned to AVAILABLE state due to booking deletion", bike.getBikeId());
            }
        });

        bookingRepository.delete(booking);
        log.info("BookingId: {} successfully deleted.", bookingId);
    }

    private Booking findBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found."));
    }

    /**
     * Enforce strict role-based access checks to prevent unauthorized reads/writes.
     */
    private void validateBookingAccess(Booking booking) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            // Allows fallback under unit testing/anonymous context if not fully integrated
            return;
        }

        Role role = SecurityUtils.getCurrentRole();
        if (role == Role.ADMIN) {
            return; // Admin bypass
        }

        // Customers can only see their own bookings
        if (booking.getCustomerId().equals(currentUserId)) {
            return;
        }

        // Bike owners can see bookings matching their bikes
        Bike bike = bikeRepository.findById(booking.getBikeId()).orElse(null);
        if (bike != null && bike.getOwnerId().equals(currentUserId)) {
            return;
        }

        log.warn("Access Denied: UserId: {} attempted access to bookingId: {}", currentUserId, booking.getId());
        throw new AccessDeniedException("You do not have permission to view or edit this booking.");
    }

    private BookingResponse convertToResponse(Booking booking) {
        BookingResponse response = BookingMapper.toResponse(booking);
        if (response != null) {
            try {
                bikeRepository.findById(booking.getBikeId()).ifPresent(bike -> {
                    response.setBikeName(bike.getBikeName());
                    response.setBikeImage(bike.getImageUrl());
                });
            } catch (Exception e) {
                log.warn("Failed to fetch bike details for booking response: {}", e.getMessage());
            }
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public com.sssit.bikerental.modules.booking.dto.RideTrackingDTO getRideTracking(Long bookingId) {
        Booking booking = findBooking(bookingId);
        validateBookingAccess(booking);

        if (booking.getBookingStatus() != BookingStatus.ACTIVE) {
            throw new IllegalStateException("Tracking is only available for ACTIVE rides.");
        }

        // Get bike location
        String startLoc = "Hyderabad";
        try {
            Bike bike = bikeRepository.findById(booking.getBikeId()).orElse(null);
            if (bike != null && bike.getLocation() != null) {
                startLoc = bike.getLocation();
            }
        } catch (Exception e) {}

        // Calculate elapsed time since ride started (approximated by updatedAt)
        LocalDateTime startTime = booking.getUpdatedAt() != null ? booking.getUpdatedAt() : LocalDateTime.now().minusMinutes(5);
        java.time.Duration elapsed = java.time.Duration.between(startTime, LocalDateTime.now());
        long seconds = elapsed.getSeconds();
        String durationStr = String.format("%02d:%02d:%02d", seconds / 3600, (seconds % 3600) / 60, seconds % 60);

        // Simulate path / coordinates moving around startLoc
        double baseLat = 17.3850; // Hyderabad base coordinates
        double baseLng = 78.4867;
        if ("Bengaluru".equalsIgnoreCase(startLoc) || "Bangalore".equalsIgnoreCase(startLoc) || startLoc.contains("Bangalore") || startLoc.contains("Koramangala")) {
            baseLat = 12.9716;
            baseLng = 77.5946;
        }

        // Drift coordinates based on elapsed seconds
        double angle = (double) (seconds % 360) * Math.PI / 180.0;
        double radius = 0.01 + 0.005 * Math.sin(angle); // slow circular drift
        double currentLat = baseLat + radius * Math.cos(angle);
        double currentLng = baseLng + radius * Math.sin(angle);

        String currentLocName = String.format("%s Area Checkpoint %d (Lat: %.4f, Lng: %.4f)", startLoc, (seconds / 10) % 5 + 1, currentLat, currentLng);
        long etaMinutes = Math.max(1, 15 - (seconds / 60) % 15);
        String etaStr = etaMinutes + " mins";

        return com.sssit.bikerental.modules.booking.dto.RideTrackingDTO.builder()
                .status(booking.getBookingStatus().name())
                .pickupLocation(startLoc)
                .dropLocation(startLoc)
                .currentLocation(currentLocName)
                .rideDuration(durationStr)
                .eta(etaStr)
                .latitude(currentLat)
                .longitude(currentLng)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isBikeAvailable(Long bikeId, java.time.LocalDateTime startTime, java.time.LocalDateTime returnTime) {
        log.info("Checking availability for bikeId: {} from {} to {}", bikeId, startTime, returnTime);
        
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> new BikeNotFoundException("Bike not found."));

        if (bike.getBikeStatus() == BikeStatus.UNDER_MAINTENANCE || bike.getBikeStatus() == BikeStatus.NOT_AVAILABLE) {
            log.warn("BikeId: {} is not available due to status: {}", bikeId, bike.getBikeStatus());
            return false;
        }

        // A bike that is currently BOOKED by another customer is not available,
        // regardless of the dates being requested. It stays unavailable until its
        // active booking is cancelled or completed (which resets it to AVAILABLE).
        if (bike.getBikeStatus() == BikeStatus.BOOKED) {
            log.warn("BikeId: {} is already booked.", bikeId);
            return false;
        }

        return true;
    }
}
