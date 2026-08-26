package com.sssit.bikerental.modules.booking.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.exception.BookingNotCompletedException;
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
import com.sssit.bikerental.modules.notification.entity.Notification;
import com.sssit.bikerental.modules.notification.entity.NotificationService;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.verification.aadhaar.service.AadhaarService;
import com.sssit.bikerental.modules.verification.drivinglicense.service.DrivingLicenseService;

import com.sssit.bikerental.modules.gps.entity.Ride;
import com.sssit.bikerental.modules.gps.entity.RideStatus;
import com.sssit.bikerental.modules.gps.repository.RideRepository;

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
    private final NotificationService notificationService;
    private final RideRepository rideRepository;

    private void checkBikeAvailability(Bike bike, LocalDateTime startTime, LocalDateTime endTime, Long currentBookingId) {
        // 1. Check permanent status
        if (bike.getBikeStatus() == BikeStatus.UNDER_MAINTENANCE || bike.getBikeStatus() == BikeStatus.NOT_AVAILABLE) {
            throw new BookingNotAvailableException("Bike is not available during the selected time.");
        }

        // 2. Check bike owner availability window (operational shift)
        if (bike.getAvailableStartTime() != null) {
            java.time.LocalTime reqStartLocal = startTime.toLocalTime();
            if (reqStartLocal.isBefore(bike.getAvailableStartTime())) {
                throw new BookingNotAvailableException("Bike is not available during the selected time.");
            }
        }
        if (bike.getAvailableEndTime() != null) {
            java.time.LocalTime reqEndLocal = endTime.toLocalTime();
            if (reqEndLocal.isAfter(bike.getAvailableEndTime())) {
                throw new BookingNotAvailableException("Bike is not available during the selected time.");
            }
        }

        // 3. Check for overlapping bookings
        java.util.List<Booking> activeBookings = bookingRepository.findByBikeId(bike.getBikeId());
        for (Booking existing : activeBookings) {
            // Exclude current booking if we are updating it
            if (currentBookingId != null && existing.getId().equals(currentBookingId)) {
                continue;
            }

            // Approved, Confirmed, Active, or Pending bookings block overlapping customer requests
            BookingStatus status = existing.getBookingStatus();
            if (status == BookingStatus.APPROVED
                    || status == BookingStatus.CONFIRMED
                    || status == BookingStatus.ACTIVE
                    || status == BookingStatus.PENDING) {

                java.time.LocalDateTime extStart = existing.getStartTime() != null ? existing.getStartTime() : existing.getPickupDate();
                java.time.LocalDateTime extEnd = existing.getReturnTime() != null ? existing.getReturnTime() : existing.getReturnDate();

                if (extStart != null && extEnd != null) {
                    // Overlap condition: (Start1 < End2) AND (Start2 < End1)
                    if (startTime.isBefore(extEnd) && extStart.isBefore(endTime)) {
                        log.warn("Overlap detected with existing booking ID: {} (Status: {})", existing.getId(), status);
                        if (status == BookingStatus.PENDING) {
                            throw new BookingNotAvailableException("Acceptance pending by owner for this time slot. A reservation request is awaiting approval by the owner.");
                        } else {
                            throw new BookingNotAvailableException("This slot is booked at that time. Bike is already accepted and booked by the owner for another customer during this time slot.");
                        }
                    }
                }
            }
        }
    }

    @Override
    public BookingResponse createBooking(Long customerId, BookingRequest request) {

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentRole = SecurityUtils.getCurrentRole();

        if (currentRole != Role.ADMIN
                && (currentUserId == null || !currentUserId.equals(customerId))) {
            throw new AccessDeniedException(
                    "You can only create bookings for yourself."
            );
        }
        log.info("Starting booking creation for customerId: {} and bikeId: {}", customerId, request.getBikeId());

        bookingValidator.validateBookingRequest(request);
        userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found."));

        // Use findByIdForUpdate to acquire pessimistic lock on the bike record to protect against concurrent bookings
        Bike bike = bikeRepository.findByIdForUpdate(request.getBikeId())
                .orElseThrow(() -> new BikeNotFoundException("Bike not found."));

        // 1. Check verification status
        log.info("Evaluating customer verification status for customerId: {}", customerId);
        boolean isVerified = checkVerificationStatus(customerId);
        BookingStatus initialStatus = isVerified ? BookingStatus.PENDING : BookingStatus.VERIFICATION_REQUIRED;

        // 2. Check bike availability and overlaps
        checkBikeAvailability(bike, request.getStartTime(), request.getReturnTime(), null);

        // 3. Calculate rental amount hourly
        BigDecimal hourlyRate = bike.getHourlyRate();
        if (hourlyRate == null || hourlyRate.compareTo(BigDecimal.ZERO) == 0) {
            hourlyRate = bike.getRentalPrice().divide(BigDecimal.valueOf(24), 2, java.math.RoundingMode.HALF_UP);
        }
        long minutes = java.time.Duration.between(request.getStartTime(), request.getReturnTime()).toMinutes();
        double hours = (double) minutes / 60.0;
        BigDecimal rentalAmount = hourlyRate.multiply(BigDecimal.valueOf(hours)).setScale(2, java.math.RoundingMode.HALF_UP);

        // 4. Create booking in PENDING or VERIFICATION_REQUIRED status
        Booking booking = Booking.builder()
                .customerId(customerId)
                .bikeId(bike.getBikeId())
                .startTime(request.getStartTime())
                .returnTime(request.getReturnTime())
                .pickupDate(request.getStartTime())
                .returnDate(request.getReturnTime())
                .rentalAmount(rentalAmount)
                .bookingStatus(initialStatus)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);
        log.info("Booking record created with ID: {} and Status: {}. Waiting for owner confirmation.", booking.getId(), initialStatus);

        // Send notification to bike owner about new booking request
        if (bike.getOwnerId() != null) {
            try {
                Notification ownerNotif = Notification.builder()
                        .userId(bike.getOwnerId())
                        .title("New Booking Request")
                        .message(String.format("A new booking request (BK-%d) has been placed for %s.", booking.getId(), bike.getBikeName()))
                        .notificationType("BOOKING")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationService.sendNotification(ownerNotif);
                log.info("Sent new booking request notification to owner: {}", bike.getOwnerId());
            } catch (Exception e) {
                log.error("Failed to send booking request notification to owner: {}", bike.getOwnerId(), e);
            }
        }

        return convertToResponse(booking);
    }

    @Override
    public BookingResponse updateBooking(Long bookingId, BookingRequest request) {
        log.info("Updating bookingId: {}", bookingId);

        bookingValidator.validateBookingRequest(request);
        Booking booking = findBooking(bookingId);
        validateBookingAccess(booking);

        Bike bike = bikeRepository.findByIdForUpdate(request.getBikeId())
                .orElseThrow(() -> new BikeNotFoundException("Bike not found."));

        // Check availability if bike or start/return times have changed
        if (!booking.getBikeId().equals(request.getBikeId())
                || !booking.getStartTime().equals(request.getStartTime())
                || !booking.getReturnTime().equals(request.getReturnTime())) {

            checkBikeAvailability(bike, request.getStartTime(), request.getReturnTime(), booking.getId());

            // If bike changed, free up the old one
            if (!booking.getBikeId().equals(request.getBikeId())) {
                bikeRepository.findById(booking.getBikeId()).ifPresent(oldBike -> {
                    oldBike.setBikeStatus(BikeStatus.AVAILABLE);
                    bikeRepository.save(oldBike);
                    log.info("Old bikeId: {} set to AVAILABLE", oldBike.getBikeId());
                });

                bike.setBikeStatus(BikeStatus.BOOKED);
                bikeRepository.save(bike);
                log.info("New bikeId: {} set to BOOKED", bike.getBikeId());
            }
        }

        BigDecimal hourlyRate = bike.getHourlyRate();
        if (hourlyRate == null || hourlyRate.compareTo(BigDecimal.ZERO) == 0) {
            hourlyRate = bike.getRentalPrice().divide(BigDecimal.valueOf(24), 2, java.math.RoundingMode.HALF_UP);
        }
        long minutes = java.time.Duration.between(request.getStartTime(), request.getReturnTime()).toMinutes();
        double hours = (double) minutes / 60.0;
        BigDecimal rentalAmount = hourlyRate.multiply(BigDecimal.valueOf(hours)).setScale(2, java.math.RoundingMode.HALF_UP);

        booking.setBikeId(request.getBikeId());
        booking.setStartTime(request.getStartTime());
        booking.setReturnTime(request.getReturnTime());
        booking.setRentalAmount(rentalAmount);

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

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role role = SecurityUtils.getCurrentRole();

        if (currentUserId == null) {
            throw new AccessDeniedException("Authentication required.");
        }

        if (role != Role.ADMIN && !currentUserId.equals(customerId)) {
            throw new AccessDeniedException(
                    "Access denied to customer bookings."
            );
        }
        log.info("Fetching bookings for customerId: {}", customerId);
        return bookingRepository.findByCustomerId(customerId).stream().map(this::convertToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkVerificationStatus(Long customerId) {
        log.info("Checking verification credentials for customerId: {}", customerId);
        var aadhaar = aadhaarService.getApprovedAadhaar(customerId, "USER");
        if (aadhaar == null) {
            aadhaar = aadhaarService.getApprovedAadhaar(customerId, null);
        }
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

    // Only PENDING bookings can be approved/confirmed.
    if (booking.getBookingStatus() != BookingStatus.PENDING) {
        throw new IllegalStateException(
                "Only PENDING bookings can be confirmed."
        );
    }

    // Customer must have completed Aadhaar + Driving License verification.
    if (!checkVerificationStatus(booking.getCustomerId())) {
        log.warn(
                "Customer: {} not verified. Cannot confirm bookingId: {}",
                booking.getCustomerId(),
                bookingId
        );

        throw new VerificationRequiredException(
                "Customer must be verified before confirming booking."
        );
    }
    /*
     * IMPORTANT:
     *
     * Owner approval / booking confirmation does NOT
     * mean payment was completed.
     *
     * Payment will begin only after bike return.
     */
    booking.setPaymentStatus(PaymentStatus.PENDING);
    booking.setBookingStatus(BookingStatus.CONFIRMED);

    // Generate QR code if missing.
    if (booking.getQrCode() == null || booking.getQrCode().isEmpty()) {

        String qrText = String.format(
                "BOOKING-REF: BK-%d | Bike: %d | Renter: %d | Amount: %s",
                booking.getId(),
                booking.getBikeId(),
                booking.getCustomerId(),
                booking.getRentalAmount().toString()
        );

        String qrData = qrCodeService.generateQRCode(
                qrText,
                250,
                250
        );

        booking.setQrCode(qrData);

        log.info(
                "QR Code generated for bookingId: {}",
                booking.getId()
        );
    }

    // Mark bike as BOOKED.
    bikeRepository.findById(booking.getBikeId()).ifPresent(bike -> {
        bike.setBikeStatus(BikeStatus.BOOKED);
        bikeRepository.save(bike);
    });

    return convertToResponse(
            bookingRepository.save(booking)
    );
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
        if (bookingStatus == BookingStatus.ACTIVE) {
            return handoverBooking(bookingId);
        } else if (bookingStatus == BookingStatus.COMPLETED) {
            return returnBooking(bookingId);
        }

        Booking booking = findBooking(bookingId);
        validateBookingAccess(booking);

        if (bookingStatus == BookingStatus.CONFIRMED) {
            if (!checkVerificationStatus(booking.getCustomerId())) {
                throw new VerificationRequiredException("Customer must be verified before confirming booking.");
            }
            
            /*
             * Payment is NOT completed here.
             */
            booking.setPaymentStatus(
                    PaymentStatus.PENDING
            );
            
            // Generate QR code if missing
            if (booking.getQrCode() == null || booking.getQrCode().isEmpty()) {
                String qrText = String.format("BOOKING-REF: BK-%d | Bike: %d | Renter: %d | Amount: %s",
                        booking.getId(), booking.getBikeId(), booking.getCustomerId(), booking.getRentalAmount().toString());
                String qrData = qrCodeService.generateQRCode(qrText, 250, 250);
                booking.setQrCode(qrData);
                log.info("QR Code generated during status transition to CONFIRMED for bookingId: {}", booking.getId());
            }
        }

        booking.setBookingStatus(bookingStatus);

        // If status changes to CANCELLED, free up the bike
        if (bookingStatus == BookingStatus.CANCELLED) {
            bikeRepository.findById(booking.getBikeId()).ifPresent(bike -> {
                bike.setBikeStatus(BikeStatus.AVAILABLE);
                bikeRepository.save(bike);
                log.info("BikeId: {} returned to AVAILABLE state due to cancellation", bike.getBikeId());
            });
        }

        Booking savedBooking = bookingRepository.save(booking);
        return convertToResponse(savedBooking);
    }

    @Override
    public BookingResponse scanQRCode(String qrCode) {
        log.info("Scanning QR code payload: {}", qrCode);
        if (qrCode == null || qrCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid QR code.");
        }

        Long bookingId = null;
        try {
            if (qrCode.contains("BK-")) {
                int startIndex = qrCode.indexOf("BK-") + 3;
                int endIndex = qrCode.indexOf(" ", startIndex);
                if (endIndex == -1) {
                    endIndex = qrCode.indexOf(":", startIndex);
                }
                if (endIndex == -1) {
                    endIndex = qrCode.indexOf("|", startIndex);
                }
                String idStr = (endIndex != -1) ? qrCode.substring(startIndex, endIndex) : qrCode.substring(startIndex);
                bookingId = Long.parseLong(idStr.trim());
            } else {
                bookingId = Long.parseLong(qrCode.trim());
            }
        } catch (Exception e) {
            log.warn("Failed to parse booking ID from QR text: {}. Doing fallback search.", qrCode);
        }

        Booking booking = null;
        if (bookingId != null) {
            booking = bookingRepository.findById(bookingId).orElse(null);
        }

        if (booking == null) {
            final String finalQrCode = qrCode;
            booking = bookingRepository.findAll().stream()
                    .filter(b -> finalQrCode.equals(b.getQrCode()))
                    .findFirst()
                    .orElse(null);
        }

        if (booking == null) {
            throw new BookingNotFoundException("Booking not found.");
        }

        // Verify that the authenticated user is the owner of the bike or an admin
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role role = SecurityUtils.getCurrentRole();
        Bike bike = bikeRepository.findById(booking.getBikeId())
                .orElseThrow(() -> new BikeNotFoundException("Bike not found."));
        if (role != Role.ADMIN && (currentUserId == null || !bike.getOwnerId().equals(currentUserId))) {
            throw new AccessDeniedException("You are not authorized to manage this bike.");
        }

        // Perform status validations
        if (booking.getBookingStatus() == BookingStatus.PENDING || booking.getBookingStatus() == BookingStatus.VERIFICATION_REQUIRED) {
            throw new IllegalArgumentException("Booking is not confirmed yet.");
        }
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("This booking has been cancelled.");
        }
        if (booking.getBookingStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("This rental has already been completed.");
        }

        return convertToResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse handoverBooking(Long bookingId) {
        log.info("Processing handover for bookingId: {}", bookingId);

        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found."));

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role role = SecurityUtils.getCurrentRole();
        Bike bike = bikeRepository.findById(booking.getBikeId())
                .orElseThrow(() -> new BikeNotFoundException("Bike not found."));
        if (role != Role.ADMIN && (currentUserId == null || !bike.getOwnerId().equals(currentUserId))) {
            throw new AccessDeniedException("You are not authorized to manage this bike.");
        }

       if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
    throw new IllegalArgumentException("This booking has been cancelled.");
}

if (booking.getBookingStatus() == BookingStatus.ACTIVE) {
    throw new IllegalArgumentException("This booking is already active.");
}

if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
    throw new IllegalArgumentException("Booking must be CONFIRMED before handover.");
}

       booking.setBookingStatus(BookingStatus.ACTIVE);
booking.setActualPickupTime(LocalDateTime.now());

Booking savedBooking = bookingRepository.save(booking);

// Create an ACTIVE ride when the bike is handed over
if (rideRepository.existsByBookingIdAndStatus(
        savedBooking.getId(),
        RideStatus.ACTIVE)) {

    throw new IllegalStateException(
            "An active ride already exists for booking: "
                    + savedBooking.getId()
    );
}

Ride ride = new Ride();

ride.setBookingId(savedBooking.getId());
ride.setBikeId(savedBooking.getBikeId());
ride.setCustomerId(savedBooking.getCustomerId());

ride.setStatus(RideStatus.ACTIVE);
ride.setStartedAt(savedBooking.getActualPickupTime());

ride.setTotalDistance(0.0);
ride.setTotalDuration(0L);

Ride savedRide = rideRepository.save(ride);

log.info(
        "Ride created successfully. rideId: {}, bookingId: {}",
        savedRide.getId(),
        savedBooking.getId()
);

bike.setBikeStatus(BikeStatus.BOOKED);
bikeRepository.save(bike);

        // Send handover notifications to customer and owner
        try {
            // 1. Notification to customer
            Notification custNotif = Notification.builder()
                    .userId(savedBooking.getCustomerId())
                    .title("Handover Confirmed")
                    .message(String.format("Handover confirmed for booking BK-%d (%s). Your ride is now ACTIVE. Enjoy your ride!", savedBooking.getId(), bike.getBikeName()))
                    .notificationType("BOOKING")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationService.sendNotification(custNotif);

            // 2. Notification to owner
            if (bike.getOwnerId() != null) {
                Notification ownerNotif = Notification.builder()
                        .userId(bike.getOwnerId())
                        .title("Handover Successful")
                        .message(String.format("Bike handover confirmed for booking BK-%d. Ride has started.", savedBooking.getId()))
                        .notificationType("RIDE")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationService.sendNotification(ownerNotif);
            }
        } catch (Exception e) {
            log.error("Failed to send handover notifications for bookingId: {}", bookingId, e);
        }

        log.info("Handover confirmed for bookingId: {} at {}", bookingId, savedBooking.getActualPickupTime());
        return convertToResponse(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponse returnBooking(Long bookingId) {
        log.info("Processing return for bookingId: {}", bookingId);

        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found."));

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role role = SecurityUtils.getCurrentRole();
        Bike bike = bikeRepository.findById(booking.getBikeId())
                .orElseThrow(() -> new BikeNotFoundException("Bike not found."));
        if (role != Role.ADMIN && (currentUserId == null || !bike.getOwnerId().equals(currentUserId))) {
            throw new AccessDeniedException("You are not authorized to manage this bike.");
        }

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("This booking has been cancelled.");
        }
        if (booking.getBookingStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("This rental has already been completed.");
        }
        if (booking.getBookingStatus() != BookingStatus.ACTIVE) {
            throw new IllegalArgumentException("Booking is not active yet.");
        }
        if (booking.getActualPickupTime() == null) {
    throw new IllegalStateException(
            "Cannot complete booking because actual pickup time is missing."
    );
}

        booking.setBookingStatus(BookingStatus.COMPLETED);
        booking.setActualReturnTime(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);

        bike.setBikeStatus(BikeStatus.AVAILABLE);
        bikeRepository.save(bike);

        // Complete any associated active or paused Ride for this booking
        try {
            rideRepository.findByBookingId(savedBooking.getId()).ifPresent(ride -> {
                if (ride.getStatus() == RideStatus.ACTIVE || ride.getStatus() == RideStatus.PAUSED) {
                    ride.setStatus(RideStatus.COMPLETED);
                    ride.setEndedAt(savedBooking.getActualReturnTime());
                    if (ride.getStartedAt() != null && savedBooking.getActualReturnTime() != null) {
                        long duration = java.time.Duration.between(
                                ride.getStartedAt(),
                                savedBooking.getActualReturnTime()
                        ).getSeconds();
                        ride.setTotalDuration(duration);
                    }
                    rideRepository.save(ride);
                    log.info("Ride #{} completed upon return confirmation for booking #{}", ride.getId(), savedBooking.getId());
                }
            });
        } catch (Exception e) {
            log.error("Failed to complete ride for bookingId: {}", savedBooking.getId(), e);
        }

        // Send completion notifications to bike owner and customer
        try {
            java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a");
            String formattedPickup = savedBooking.getActualPickupTime() != null ? savedBooking.getActualPickupTime().format(timeFormatter) : "N/A";
            String formattedReturn = savedBooking.getActualReturnTime() != null ? savedBooking.getActualReturnTime().format(timeFormatter) : "N/A";

            String customerName = "Unknown Customer";
            com.sssit.bikerental.modules.user.User customer = userRepository.findById(savedBooking.getCustomerId()).orElse(null);
            if (customer != null) {
                customerName = customer.getFullName();
            }

            // 1. Notification to owner
            String ownerMessageContent = String.format(
                    "Rental Completed\n\n"
                    + "Bike: %s\n"
                    + "Customer: %s\n"
                    + "Booking: BK-%d\n"
                    + "Actual Pickup: %s\n"
                    + "Actual Return: %s\n\n"
                    + "Rental completed successfully.",
                    bike.getBikeName(), customerName, savedBooking.getId(), formattedPickup, formattedReturn);

            Notification ownerNotif = Notification.builder()
                    .userId(bike.getOwnerId())
                    .title("Rental Completed")
                    .message(ownerMessageContent)
                    .notificationType("RIDE")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationService.sendNotification(ownerNotif);
            log.info("Sent ride completion notification to owner: {}", bike.getOwnerId());

            // 2. Notification to customer
            String custMessageContent = String.format(
                    "Bike return confirmed.\n\n"
                    + "Booking: BK-%d\n"
                    + "Actual Return: %s\n"
                    + "Status: COMPLETED",
                    savedBooking.getId(), formattedReturn);

            Notification custNotif = Notification.builder()
                    .userId(savedBooking.getCustomerId())
                    .title("Bike Return Confirmed")
                    .message(custMessageContent)
                    .notificationType("BOOKING")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationService.sendNotification(custNotif);
            log.info("Sent ride completion notification to customer: {}", savedBooking.getCustomerId());

        } catch (Exception e) {
            log.error("Failed to send ride completion notifications", e);
        }

        log.info("Return confirmed for bookingId: {} at {}", bookingId, savedBooking.getActualReturnTime());
        return convertToResponse(savedBooking);
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
     * Enforce strict role-based access checks to prevent unauthorized
     * reads/writes.
     */
    private void validateBookingAccess(Booking booking) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            // Allows fallback under unit testing/anonymous context if not fully integrated
            throw new AccessDeniedException("Authentication required.");
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
        throw new AccessDeniedException("You are not authorized to view this booking.");
    }

    private BookingResponse convertToResponse(Booking booking) {
        BookingResponse response = BookingMapper.toResponse(booking);
        if (response != null) {
            try {
                bikeRepository.findById(booking.getBikeId()).ifPresent(bike -> {
                    response.setBikeName(bike.getBikeName());
                    response.setBikeImage(bike.getImageUrl());
                    response.setRegistrationNumber(bike.getRegistrationNumber());
                    response.setOwnerId(bike.getOwnerId());
                    response.setLatitude(bike.getLatitude());
                    response.setLongitude(bike.getLongitude());
                    response.setLocation(bike.getLocation());
                    userRepository.findById(bike.getOwnerId()).ifPresent(owner -> {
                        response.setOwnerName(owner.getFullName());
                    });
                });
                userRepository.findById(booking.getCustomerId()).ifPresent(customer -> {
                    response.setCustomerName(customer.getFullName());
                });
            } catch (Exception e) {
                log.warn("Failed to fetch bike/customer details for booking response: {}", e.getMessage());
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
        } catch (Exception e) {
            log.warn("Failed to retrieve bike location for booking {}: {}", booking.getId(), e.getMessage());
        }

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
        checkBikeAvailability(bike, startTime, returnTime, null);
        return true;
    }
}
