package com.sssit.bikerental.modules.user.service.impl;

import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.exception.ConflictException;
import com.sssit.bikerental.common.exception.ResourceNotFoundException;
import com.sssit.bikerental.common.exception.FileStorageException;
import com.sssit.bikerental.common.exception.ValidationException;
import com.sssit.bikerental.modules.auth.repository.OtpRepository;
import com.sssit.bikerental.modules.auth.repository.RefreshTokenRepository;
import com.sssit.bikerental.modules.auth.service.EmailService;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.gps.entity.RideStatus;
import com.sssit.bikerental.modules.gps.repository.RideRepository;
import com.sssit.bikerental.modules.notification.entity.Notification;
import com.sssit.bikerental.modules.notification.entity.NotificationRepository;
import com.sssit.bikerental.modules.payment.repository.BankAccountRepository;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.dto.ChangePasswordRequest;
import com.sssit.bikerental.modules.user.dto.UpdateProfileRequest;
import com.sssit.bikerental.modules.user.dto.UpdateUserRequest;
import com.sssit.bikerental.modules.user.dto.UserProfileResponse;
import com.sssit.bikerental.modules.user.dto.UserResponse;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.user.service.UserService;
import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.admin.entity.DocumentReview;
import com.sssit.bikerental.modules.verification.admin.repository.DocumentReviewRepository;
import com.sssit.bikerental.modules.verification.bikedocument.entity.BikeDocument;
import com.sssit.bikerental.modules.verification.bikedocument.repository.BikeDocumentRepository;
import com.sssit.bikerental.modules.verification.drivinglicense.entity.DrivingLicense;
import com.sssit.bikerental.modules.verification.drivinglicense.repository.DrivingLicenseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final RefreshTokenRepository refreshTokenRepository;
        private final OtpRepository otpRepository;
        private final BookingRepository bookingRepository;
        private final RideRepository rideRepository;
        private final NotificationRepository notificationRepository;
        private final BankAccountRepository bankAccountRepository;
        private final AadhaarRepository aadhaarRepository;
        private final DrivingLicenseRepository drivingLicenseRepository;
        private final BikeDocumentRepository bikeDocumentRepository;
        private final DocumentReviewRepository documentReviewRepository;
        private final BikeRepository bikeRepository;
        private final EmailService emailService;

        private User getLoggedInUser() {
                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String email = authentication.getName();

                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        }

        @Override
        public UserProfileResponse getCurrentUser() {

                User user = getLoggedInUser();

                return UserProfileResponse.builder()
                                .id(user.getId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .phoneNumber(user.getPhoneNumber())
                                .role(user.getRole().name())
                                .enabled(user.getEnabled())
                                .profileImage(user.getProfileImage())
                                .build();

        }

        @Override
        public UserProfileResponse updateProfile(
                        UpdateProfileRequest request) {

                User user = getLoggedInUser();

                if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
                        if (userRepository.existsByEmail(request.getEmail())) {
                                throw new IllegalArgumentException("Email is already in use by another account.");
                        }
                        user.setEmail(request.getEmail().toLowerCase());
                }

                if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber())) {
                        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                                throw new IllegalArgumentException("Phone number is already in use by another account.");
                        }
                        user.setPhoneNumber(request.getPhoneNumber());
                }

                user.setFullName(request.getFullName());

                userRepository.save(user);

                return getCurrentUser();

        }

        @Override
        public UserProfileResponse uploadProfileImage(MultipartFile file) {
                User user = getLoggedInUser();
                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException("File cannot be empty.");
                }

                try {
                        String uploadDir = "uploads/profile-images/";
                        Files.createDirectories(Paths.get(uploadDir));
                        
                        String originalName = file.getOriginalFilename();
                        String extension = "";
                        if (originalName != null && originalName.contains(".")) {
                                extension = originalName.substring(originalName.lastIndexOf("."));
                        }
                        String fileName = "avatar_" + user.getId() + "_" + System.currentTimeMillis() + extension;
                        Path path = Paths.get(uploadDir + fileName);

                        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

                        user.setProfileImage("/uploads/profile-images/" + fileName);
                        userRepository.save(user);

                        return getCurrentUser();
                } catch (Exception e) {
                        throw new FileStorageException("Failed to upload profile image: " + e.getMessage(), e);
                }
        }

        @Override
        public void changePassword(
                        ChangePasswordRequest request) {

                User user = getLoggedInUser();

                if (!passwordEncoder.matches(
                                request.getOldPassword(),
                                user.getPassword())) {

                        throw new ValidationException(
                                        "Old password is incorrect");

                }

                user.setPassword(

                                passwordEncoder.encode(
                                                request.getNewPassword())

                );

                userRepository.save(user);

        }

        private UserResponse map(User user) {

                return UserResponse.builder()
                                .id(user.getId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .phoneNumber(user.getPhoneNumber())
                                .role(user.getRole().name())
                                .enabled(user.getEnabled())
                                .profileImage(user.getProfileImage())
                                .build();

        }

        @Override
        public List<UserResponse> getAllUsers() {

                return userRepository.findAll()

                                .stream()

                                .map(this::map)

                                .toList();

        }

        @Override
        public UserResponse getUserById(Long id) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                return map(user);

        }

        @Override
        public UserResponse updateUser(Long id,
                        UpdateUserRequest request) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                user.setFullName(request.getFullName());

                user.setPhoneNumber(request.getPhoneNumber());

                if (request.getEnabled() != null) {

                        user.setEnabled(request.getEnabled());

                }

                userRepository.save(user);

                return map(user);

        }

        @Override
        public void deleteUser(Long id) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                userRepository.delete(user);

        }

        @Override
        public UserResponse changeUserStatus(Long id,
                        Boolean enabled) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                user.setEnabled(enabled);

                userRepository.save(user);

                return map(user);

        }

        @Override
        public UserResponse lockUser(Long id, Boolean locked) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                user.setAccountNonLocked(!Boolean.TRUE.equals(locked));

                userRepository.save(user);

                return map(user);

        }

        @Override
        public void deleteCurrentAccount() {
                User user = getLoggedInUser();

                // 1. ADMIN PROTECTION: Admin users cannot self-delete
                if (user.getRole() == Role.ADMIN) {
                        throw new AccessDeniedException("Admin accounts cannot be deleted via self-service.");
                }

                Long userId = user.getId();

                // 2. ACTIVE BOOKINGS & RIDES RESTRICTIONS
                if (user.getRole() == Role.CUSTOMER) {
                        // Check customer bookings
                        if (bookingRepository != null) {
                                List<Booking> customerBookings = bookingRepository.findByCustomerId(userId);
                                boolean hasActiveBooking = customerBookings.stream().anyMatch(b -> {
                                        BookingStatus status = b.getBookingStatus();
                                        return status == BookingStatus.PENDING
                                                        || status == BookingStatus.VERIFICATION_REQUIRED
                                                        || status == BookingStatus.APPROVED
                                                        || status == BookingStatus.CONFIRMED
                                                        || status == BookingStatus.ACTIVE;
                                });
                                if (hasActiveBooking) {
                                        throw new ConflictException("Account cannot be deleted while an active rental or pending booking exists.");
                                }
                        }

                        // Check customer active rides
                        if (rideRepository != null) {
                                boolean hasActiveRide = rideRepository.existsByCustomerIdAndStatus(userId, RideStatus.ACTIVE)
                                                || rideRepository.existsByCustomerIdAndStatus(userId, RideStatus.PAUSED);
                                if (hasActiveRide) {
                                        throw new ConflictException("Account cannot be deleted while an active ride is in progress.");
                                }
                        }
                } else if (user.getRole() == Role.OWNER) {
                        // Check bookings on owner's bikes
                        if (bookingRepository != null) {
                                List<Booking> ownerBookings = bookingRepository.findAllBookingsByOwnerId(userId);
                                boolean hasActiveBooking = ownerBookings.stream().anyMatch(b -> {
                                        BookingStatus status = b.getBookingStatus();
                                        return status == BookingStatus.PENDING
                                                        || status == BookingStatus.VERIFICATION_REQUIRED
                                                        || status == BookingStatus.APPROVED
                                                        || status == BookingStatus.CONFIRMED
                                                        || status == BookingStatus.ACTIVE;
                                });
                                if (hasActiveBooking) {
                                        throw new ConflictException("Account cannot be deleted while active bookings or rentals exist on your bikes.");
                                }
                        }

                        // Check ongoing rides on owner's bikes
                        if (bikeRepository != null && rideRepository != null) {
                                List<Bike> ownerBikes = bikeRepository.findByOwnerId(userId);
                                for (Bike bike : ownerBikes) {
                                        boolean activeBikeRide = rideRepository.findAll().stream().anyMatch(r ->
                                                bike.getBikeId().equals(r.getBikeId()) && (r.getStatus() == RideStatus.ACTIVE || r.getStatus() == RideStatus.PAUSED)
                                        );
                                        if (activeBikeRide) {
                                                throw new ConflictException("Account cannot be deleted while an active ride is in progress on your bike.");
                                        }
                                }
                        }
                }

                // 3. DATABASE RELATIONSHIPS & CLEANUP
                // A. Invalidate and remove refresh tokens
                if (refreshTokenRepository != null) {
                        refreshTokenRepository.deleteByUser(user);
                }

                // B. Delete OTP records
                if (otpRepository != null) {
                        otpRepository.deleteByUser(user);
                }

                // C. Delete bank accounts
                if (bankAccountRepository != null) {
                        bankAccountRepository.findByUserId(userId).ifPresent(bankAccountRepository::delete);
                }

                // D. Delete notifications
                if (notificationRepository != null) {
                        List<Notification> notifications = notificationRepository.findByUserId(userId);
                        if (!notifications.isEmpty()) {
                                notificationRepository.deleteAll(notifications);
                        }
                }

                // E. Clean up user verification records
                if (aadhaarRepository != null) {
                        List<AadhaarVerification> aadhaarList = aadhaarRepository.findAll().stream()
                                        .filter(a -> userId.equals(a.getCustomerId()))
                                        .toList();
                        if (!aadhaarList.isEmpty()) {
                                aadhaarRepository.deleteAll(aadhaarList);
                        }
                }

                if (drivingLicenseRepository != null) {
                        List<DrivingLicense> dlList = drivingLicenseRepository.findAll().stream()
                                        .filter(d -> userId.equals(d.getCustomerId()))
                                        .toList();
                        if (!dlList.isEmpty()) {
                                drivingLicenseRepository.deleteAll(dlList);
                        }
                }

                if (bikeDocumentRepository != null) {
                        List<BikeDocument> bikeDocs = bikeDocumentRepository.findByOwnerId(userId);
                        if (!bikeDocs.isEmpty()) {
                                bikeDocumentRepository.deleteAll(bikeDocs);
                        }
                }

                if (documentReviewRepository != null) {
                        List<DocumentReview> reviews = documentReviewRepository.findByUserId(userId);
                        if (!reviews.isEmpty()) {
                                documentReviewRepository.deleteAll(reviews);
                        }
                }

                // F. For OWNER: remove owned bikes
                if (bikeRepository != null) {
                        List<Bike> bikes = bikeRepository.findByOwnerId(userId);
                        if (!bikes.isEmpty()) {
                                bikeRepository.deleteAll(bikes);
                        }
                }

                // 4. Delete user record
                String userEmail = user.getEmail();
                String userName = user.getFullName();
                userRepository.delete(user);

                // 5. Send account deletion notification email
                if (emailService != null && userEmail != null) {
                        emailService.sendAccountDeletedEmail(userEmail, userName);
                }

                // 6. Clear Security Context
                SecurityContextHolder.clearContext();
        }

}
