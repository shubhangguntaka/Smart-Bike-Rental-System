package com.sssit.bikerental.modules.bike.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.common.exception.ConflictException;
import com.sssit.bikerental.common.exception.ResourceNotFoundException;
import com.sssit.bikerental.common.exception.UnauthorizedException;
import com.sssit.bikerental.common.exception.ValidationException;
import com.sssit.bikerental.common.security.AuthorizationService;
import com.sssit.bikerental.modules.bike.dto.ApprovedRcDTO;
import com.sssit.bikerental.modules.bike.dto.BikeDTO;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.mapper.BikeMapper;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.bike.service.BikeService;
import com.sssit.bikerental.modules.user.service.CurrentUserService;
import com.sssit.bikerental.modules.verification.aadhaar.service.AadhaarService;
import com.sssit.bikerental.modules.verification.bikedocument.dto.BikeDocumentResponseDTO;
import com.sssit.bikerental.modules.verification.bikedocument.entity.BikeDocument;
import com.sssit.bikerental.modules.verification.bikedocument.repository.BikeDocumentRepository;
import com.sssit.bikerental.modules.verification.bikedocument.service.BikeDocumentService;
import com.sssit.bikerental.modules.verification.common.constants.VerificationConstants;

import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
/**
 * Bike Management (Member 2) — integrates with Section 1 Verification:
 * Aadhaar (once per owner) + RC (every bike) before registration.
 */

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BikeServiceImpl implements BikeService {

    private final BikeRepository bikeRepository;
    private final BikeMapper bikeMapper;
    private final AadhaarService aadhaarService;
    private final BikeDocumentService bikeDocumentService;
    private final BikeDocumentRepository bikeDocumentRepository;
    private final BookingRepository bookingRepository;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;
    private final com.sssit.bikerental.modules.user.repository.UserRepository userRepository;
    private final com.sssit.bikerental.modules.review.entity.ReviewService reviewService;

    @Override
    public BikeDTO addBike(BikeDTO bikeDTO) {
        // Clear transient ID so JPA executes an INSERT with DB auto-increment ID
        bikeDTO.setBikeId(null);
        Long ownerId = resolveOwnerIdForWrite(bikeDTO.getOwnerId());
        bikeDTO.setOwnerId(ownerId);

        // 1. STRICT AADHAAR VERIFICATION ENFORCEMENT IN BACKEND
        boolean isAadhaarVerified = checkOwnerVerification(ownerId);
        if (!isAadhaarVerified) {
            throw new ValidationException("Owner must complete Aadhaar verification before registering a bike.");
        }

        String registration = normalizePlate(bikeDTO.getRegistrationNumber());
        if (registration == null || registration.isBlank()) {
            throw new ValidationException("Registration number is required.");
        }
        String rcNumber = normalizePlate(bikeDTO.getRcNumber());
        if (rcNumber == null || rcNumber.isBlank()) {
            rcNumber = registration;
        }

        bikeDTO.setRegistrationNumber(registration);
        bikeDTO.setRcNumber(rcNumber);

        // 2. STRICT DUPLICATE REJECTION (ADD BIKE)
        if (bikeRepository.existsByRegistrationNumber(registration)) {
            throw new ConflictException("Registration number " + registration + " is already registered.");
        }
        if (bikeRepository.existsByRcNumber(rcNumber)) {
            throw new ConflictException("RC number " + rcNumber + " is already registered.");
        }

        if (bikeDTO.getImageUrl() == null || bikeDTO.getImageUrl().isBlank()) {
            bikeDTO.setImageUrl(
                    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80");
        }

        if (bikeDTO.getRentalPrice() == null || bikeDTO.getRentalPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            if (bikeDTO.getHourlyRate() != null && bikeDTO.getHourlyRate().signum() > 0) {
                bikeDTO.setRentalPrice(bikeDTO.getHourlyRate().multiply(java.math.BigDecimal.valueOf(8)));
            } else {
                bikeDTO.setRentalPrice(java.math.BigDecimal.valueOf(640));
            }
        }
        if (bikeDTO.getHourlyRate() == null || bikeDTO.getHourlyRate().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            bikeDTO.setHourlyRate(java.math.BigDecimal.valueOf(80));
        }

        // Verify that an actually APPROVED RC document exists for this owner and registration number
        BikeDocument approvedRc = bikeDocumentRepository
                .findByRegistrationNumber(registration)
                .orElse(null);

        boolean isRcApproved = approvedRc != null &&
                (VerificationConstants.STATUS_APPROVED.equals(approvedRc.getStatus()) || "VERIFIED".equals(approvedRc.getStatus())) &&
                approvedRc.getOwnerId() != null &&
                approvedRc.getOwnerId().equals(ownerId);

        if (!isRcApproved) {
            throw new ValidationException("Vehicle RC document must be uploaded and approved before registering the bike.");
        }

        Bike bike = bikeMapper.toEntity(bikeDTO);
        bike.setOwnerId(ownerId);
        bike.setRcVerified(true);
        if (bike.getBikeStatus() == null) {
            bike.setBikeStatus(BikeStatus.AVAILABLE);
        }

        return enrichDTO(bikeMapper.toDTO(bikeRepository.save(bike)));
    }

    @Override
    public BikeDTO updateBike(Long bikeId, BikeDTO bikeDTO) {
        Bike bike = getBikeEntity(bikeId);
        authorizationService.validateOwner(bike.getOwnerId());

        // 2. STRICT DUPLICATE REJECTION (UPDATE BIKE)
        if (bikeDTO.getRegistrationNumber() != null && !bikeDTO.getRegistrationNumber().isBlank()) {
            String newReg = normalizePlate(bikeDTO.getRegistrationNumber());
            if (bikeRepository.existsByRegistrationNumberAndBikeIdNot(newReg, bikeId)) {
                throw new ConflictException("Registration number " + newReg + " belongs to another bike.");
            }
        }

        if (bikeDTO.getRcNumber() != null && !bikeDTO.getRcNumber().isBlank()) {
            String newRc = normalizePlate(bikeDTO.getRcNumber());
            if (bikeRepository.existsByRcNumberAndBikeIdNot(newRc, bikeId)) {
                throw new ConflictException("RC number " + newRc + " belongs to another bike.");
            }
        }

        if (bikeDTO.getRentalPrice() == null && bikeDTO.getHourlyRate() != null) {
            bikeDTO.setRentalPrice(bikeDTO.getHourlyRate().multiply(java.math.BigDecimal.valueOf(8)));
        }

        bikeMapper.applyUpdate(bike, bikeDTO);
        if (bike.getAvailableDate() == null || bike.getAvailableDate().isBefore(java.time.LocalDate.now())) {
            bike.setAvailableDate(java.time.LocalDate.now());
        }
        return enrichDTO(bikeMapper.toDTO(bikeRepository.save(bike)));
    }

    @Override
    public void deleteBike(Long bikeId) {
        Bike bike = getBikeEntity(bikeId);
        authorizationService.validateOwner(bike.getOwnerId());
        bikeRepository.delete(bike);
    }

    private Bike syncBikeStatus(Bike bike) {
        if (bike == null || bike.getBikeStatus() == BikeStatus.UNDER_MAINTENANCE
                || bike.getBikeStatus() == BikeStatus.NOT_AVAILABLE) {
            return bike;
        }
        try {
            List<Booking> bookings = bookingRepository.findByBikeId(bike.getBikeId());
            java.time.LocalDateTime now = java.time.LocalDateTime.now();

            boolean currentlyBooked = false;

            for (Booking bk : bookings) {
                BookingStatus status = bk.getBookingStatus();
                if (status == BookingStatus.APPROVED || status == BookingStatus.CONFIRMED
                        || status == BookingStatus.ACTIVE) {
                    java.time.LocalDateTime start = bk.getStartTime() != null ? bk.getStartTime() : bk.getPickupDate();
                    java.time.LocalDateTime end = bk.getReturnTime() != null ? bk.getReturnTime() : bk.getReturnDate();

                    if (start != null && end != null) {
                        if (!now.isBefore(start) && !now.isAfter(end)) {
                            currentlyBooked = true;
                        }
                    }
                }
            }

            if (currentlyBooked && bike.getBikeStatus() != BikeStatus.BOOKED) {
                bike.setBikeStatus(BikeStatus.BOOKED);
                bikeRepository.save(bike);
            } else if (!currentlyBooked && bike.getBikeStatus() == BikeStatus.BOOKED) {
                bike.setBikeStatus(BikeStatus.AVAILABLE);
                bikeRepository.save(bike);
            }
        } catch (Exception e) {
            // Ignore error in fallback sync
        }
        return bike;
    }

    @Override
    @Transactional
    public BikeDTO getBikeById(Long bikeId) {
        Bike bike = getBikeEntity(bikeId);
        syncBikeStatus(bike);
        return bikeMapper.toDTO(bike);
    }

    private boolean isNotExpiredFromPast(java.time.LocalDate availableDate) {
        if (availableDate == null) {
            return true;
        }
        java.time.LocalDate today = java.time.LocalDate.now();
        return !availableDate.isBefore(today);
    }

    @Override
    @Transactional
    public List<BikeDTO> getAllBikes() {
        return bikeRepository.findAll().stream()
                .map(this::syncBikeStatus)
                .filter(bike -> isNotExpiredFromPast(bike.getAvailableDate()))
                .map(bikeMapper::toDTO)
                .map(this::enrichDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BikeDTO> getAllBikesForAdmin() {
        return bikeRepository.findAll().stream()
                .map(bikeMapper::toDTO)
                .map(this::enrichDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<BikeDTO> getOwnerBikes(Long ownerId) {
        Long resolvedOwnerId = ownerId;
        if (resolvedOwnerId == null) {
            resolvedOwnerId = currentUserService.getCurrentUserId();
        }
        if (resolvedOwnerId == null) {
            return java.util.Collections.emptyList();
        }

        return bikeRepository.findByOwnerIdOrderByCreatedAtDesc(resolvedOwnerId).stream()
                .map(this::syncBikeStatus)
                .map(bikeMapper::toDTO)
                .map(this::enrichDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkOwnerVerification(Long ownerId) {
        Long resolved = ownerId;
        if (resolved == null) {
            resolved = currentUserService.getCurrentUserId();
        }
        if (resolved == null) {
            return false;
        }

        return aadhaarService.getApprovedAadhaar(resolved, null) != null;
    }

    @Override
    @Transactional
    public ApprovedRcDTO checkApprovedRc(String registrationNumber) {
        Long ownerId = currentUserService.getCurrentUserId();
        String reg = normalizePlate(registrationNumber);

        if (reg == null || reg.isBlank()) {
            throw new ValidationException("Registration number is required.");
        }

        BikeDocument doc = bikeDocumentRepository
                .findByRegistrationNumber(reg)
                .orElse(null);

        if (doc == null || !(VerificationConstants.STATUS_APPROVED.equals(doc.getStatus())
                || "VERIFIED".equals(doc.getStatus()))) {
            return ApprovedRcDTO.builder()
                    .verified(false)
                    .registrationNumber(reg)
                    .alreadyListed(bikeRepository.existsByRegistrationNumber(reg))
                    .message(
                            "No approved RC found for this registration. Please upload and verify the RC for this new bike.")
                    .build();
        }

        // If the document has no ownerId or belongs to the current user, assign/verify
        // it
        if (doc.getOwnerId() == null) {
            doc.setOwnerId(ownerId);
            bikeDocumentRepository.save(doc);
        } else if (!doc.getOwnerId().equals(ownerId)) {
            // Adopt the document for the current owner if claiming their verified RC
            doc.setOwnerId(ownerId);
            bikeDocumentRepository.save(doc);
        }

        boolean listed = bikeRepository.existsByRegistrationNumber(reg);

        return toApprovedRcDto(doc, listed,
                listed
                        ? "This bike is already listed. You cannot add the same registration again."
                        : "RC already verified for this bike. You can continue without re-uploading.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovedRcDTO> getApprovedRcsForOwner() {
        Long ownerId = currentUserService.getCurrentUserId();

        List<BikeDocument> docs = new java.util.ArrayList<>(
                bikeDocumentRepository.findByOwnerIdAndStatusOrderByVerifiedAtDesc(
                        ownerId, VerificationConstants.STATUS_APPROVED));
        docs.addAll(bikeDocumentRepository.findByOwnerIdAndStatusOrderByVerifiedAtDesc(
                ownerId, "VERIFIED"));
        return docs
                .stream()
                .map(doc -> {
                    boolean listed = bikeRepository.existsByRegistrationNumber(
                            normalizePlate(doc.getRegistrationNumber()));
                    return toApprovedRcDto(doc, listed,
                            listed ? "Already listed" : "Ready to re-list");
                })
                .collect(Collectors.toList());
    }

    @Override
    public BikeDocumentResponseDTO verifyBikeRC(MultipartFile file, Long ownerId, Long bikeId) {
        return verifyBikeRC(file, ownerId, bikeId, null);
    }

    @Override
    public BikeDocumentResponseDTO verifyBikeRC(MultipartFile file, Long ownerId, Long bikeId,
            String registrationNumber) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("RC document file is required.");
        }

        Long resolvedOwnerId = resolveOwnerIdForWrite(ownerId);

        if (bikeId != null) {
            Bike bike = getBikeEntity(bikeId);
            authorizationService.validateOwner(bike.getOwnerId());
        }

        return bikeDocumentService.verifyBikeDocument(file, resolvedOwnerId, bikeId, registrationNumber);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BikeDTO> searchBikes(String location, String brand, String bikeStatus) {
        return searchBikes(location, brand, null, bikeStatus, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BikeDTO> searchBikes(String location, String brand, String category, String bikeStatus,
            java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice) {
        BikeStatus status = (bikeStatus == null || bikeStatus.isBlank())
                ? null
                : BikeStatus.from(bikeStatus);

        return bikeRepository.search(
                blankToNull(location),
                blankToNull(brand),
                blankToNull(category),
                status,
                minPrice,
                maxPrice)
                .stream()
                .map(bikeMapper::toDTO)
                .map(this::enrichDTO)
                .collect(Collectors.toList());
    }

    private Bike getBikeEntity(Long bikeId) {
        return bikeRepository.findById(bikeId)
                .orElseThrow(() -> new ResourceNotFoundException("Bike not found with id: " + bikeId));
    }

    /**
     * Prefer authenticated user id; admins may set ownerId explicitly.
     */
    private Long resolveOwnerIdForWrite(Long requestedOwnerId) {
        Long currentId = currentUserService.getCurrentUserId();
        if (currentId != null) {
            return currentId;
        }
        if (requestedOwnerId != null && requestedOwnerId > 0) {
            return requestedOwnerId;
        }
        return 1L;
    }

    private void validateMandatoryImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new ValidationException("Bike image is mandatory.");
        }
    }

    private static String normalizePlate(String value) {
        if (value == null) {
            return null;
        }
        return value.replaceAll("\\s+", "").toUpperCase();
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private ApprovedRcDTO toApprovedRcDto(BikeDocument doc, boolean alreadyListed, String message) {
        return ApprovedRcDTO.builder()
                .verified(true)
                .message(message)
                .documentId(doc.getId())
                .ownerId(doc.getOwnerId())
                .ownerName(doc.getOwnerName())
                .registrationNumber(doc.getRegistrationNumber())
                .makerName(doc.getMakerName())
                .model(doc.getModel())
                .vehicleClass(doc.getVehicleClass())
                .status(doc.getStatus())
                .alreadyListed(alreadyListed)
                .build();
    }

    private BikeDTO enrichDTO(BikeDTO dto) {

        if (dto == null) {
            return null;
        }

        /*
         * Get owner information.
         */
        if (dto.getOwnerId() != null) {

            try {

                com.sssit.bikerental.modules.user.User user = userRepository
                        .findById(dto.getOwnerId())
                        .orElse(null);

                if (user != null) {

                    String fullName = user.getFullName();

                    /*
                     * Team member 1:
                     * Detailed owner object.
                     */
                    dto.setOwner(
                            BikeDTO.OwnerInfo.builder()
                                    .ownerId(dto.getOwnerId())
                                    .ownerName(fullName)
                                    .build());

                    /*
                     * Team member 2:
                     * Direct ownerName used by frontend.
                     */
                    dto.setOwnerName(fullName);
                }

            } catch (Exception e) {

                // Safe fallback
             log.warn(
                        "Unable to load owner information: "
                                + e.getMessage());
            }
        }

        /*
         * Get average rating from reviews.
         */
        if (dto.getBikeId() != null) {

            try {

                Double averageRating = reviewService.getAverageRating(
                        dto.getBikeId());

                dto.setRating(
                        averageRating != null
                                ? averageRating
                                : 0.0);

            } catch (Exception e) {

                dto.setRating(0.0);
            }
        }

        return dto;
    }
}
