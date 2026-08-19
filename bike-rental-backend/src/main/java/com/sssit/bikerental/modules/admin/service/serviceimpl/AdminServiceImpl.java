package com.sssit.bikerental.modules.admin.service.serviceimpl;

import com.sssit.bikerental.modules.admin.dto.AdminActivityDTO;
import com.sssit.bikerental.modules.admin.dto.AdminDashboardDTO;
import com.sssit.bikerental.modules.admin.dto.BikeAdminDTO;
import com.sssit.bikerental.modules.admin.dto.BookingAdminDTO;
import com.sssit.bikerental.modules.admin.dto.CustomerAdminDTO;
import com.sssit.bikerental.modules.admin.dto.OwnerAdminDTO;
import com.sssit.bikerental.modules.admin.dto.UserAdminDTO;
import com.sssit.bikerental.modules.admin.mapper.AdminMapper;
import com.sssit.bikerental.modules.admin.service.AdminService;
import com.sssit.bikerental.modules.bike.dto.BikeDTO;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.service.BikeService;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.booking.service.BookingService;
import com.sssit.bikerental.modules.owner.dto.OwnerDTO;
import com.sssit.bikerental.modules.owner.service.OwnerService;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import com.sssit.bikerental.modules.payment.service.PaymentService;
import com.sssit.bikerental.modules.user.dto.UserResponse;
import com.sssit.bikerental.modules.user.service.CurrentUserService;
import com.sssit.bikerental.modules.user.service.UserService;
import com.sssit.bikerental.modules.verification.admin.entity.VerificationAudit;
import com.sssit.bikerental.modules.verification.admin.repository.VerificationAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

        private final UserService userService;
        private final OwnerService ownerService;
        private final BikeService bikeService;
        private final BookingService bookingService;
        private final PaymentService paymentService;
        private final CurrentUserService currentUserService;
        private final VerificationAuditRepository verificationAuditRepository;
        private final AdminMapper adminMapper;

        private final List<AdminActivityDTO> recordedActivities = new CopyOnWriteArrayList<>();
        private final AtomicLong activityIdCounter = new AtomicLong(1000);

        @Override
        public AdminDashboardDTO getDashboard() {

                List<UserResponse> users = userService.getAllUsers();

                List<OwnerDTO> owners = ownerService.getAllOwners();

                List<BikeDTO> bikes = bikeService.getAllBikesForAdmin();

                List<BookingResponse> bookings = bookingService.getAllBookings();

                List<PaymentResponse> payments = paymentService.getAllPayments();

                long totalUsers = users.stream()
                                .filter(user -> user.getRole() != null)
                                .filter(user -> !"ADMIN".equalsIgnoreCase(
                                                user.getRole()))
                                .count();

                long totalOwners = owners.size();

                long totalBikes = bikes.size();

                long totalBookings = bookings.size();

                long totalPayments = payments.size();

                long activeUsers = users.stream()
                                .filter(user -> user.getRole() != null)
                                .filter(user -> !"ADMIN".equalsIgnoreCase(
                                                user.getRole()))
                                .filter(user -> Boolean.TRUE.equals(
                                                user.getEnabled()))
                                .count();

                long activeBikes = bikes.stream()
                                .filter(bike -> bike.getBikeStatus() != null)
                                .filter(bike -> {
                                        String status = bike.getBikeStatus()
                                                        .name();

                                        return "AVAILABLE".equals(status);
                                })
                                .count();

                long activeBookings = bookings.stream()
                                .filter(booking -> booking.getBookingStatus() != null)
                                .filter(booking -> {
                                        String status = booking.getBookingStatus()
                                                        .name();

                                        return "CONFIRMED".equals(status)
                                                        || "ACTIVE".equals(status)
                                                        || "ONGOING".equals(status);
                                })
                                .count();

                long pendingBookings = bookings.stream()
                                .filter(booking -> booking.getBookingStatus() != null)
                                .filter(booking -> "PENDING".equals(
                                                booking.getBookingStatus()
                                                                .name()))
                                .count();

                long completedBookings = bookings.stream()
                                .filter(booking -> booking.getBookingStatus() != null)
                                .filter(booking -> "COMPLETED".equals(
                                                booking.getBookingStatus()
                                                                .name()))
                                .count();

                long cancelledBookings = bookings.stream()
                                .filter(booking -> booking.getBookingStatus() != null)
                                .filter(booking -> "CANCELLED".equals(
                                                booking.getBookingStatus()
                                                                .name()))
                                .count();

                return AdminDashboardDTO.builder()
                                .totalUsers((int) totalUsers)
                                .totalOwners((int) totalOwners)
                                .totalBikes((int) totalBikes)
                                .totalBookings((int) totalBookings)
                                .totalPayments((int) totalPayments)
                                .activeUsers((int) activeUsers)
                                .activeBikes((int) activeBikes)
                                .activeBookings((int) activeBookings)
                                .pendingBookings((int) pendingBookings)
                                .completedBookings((int) completedBookings)
                                .cancelledBookings((int) cancelledBookings)
                                .build();
        }

        @Override
        public List<UserAdminDTO> getUsers() {
                List<UserResponse> users = userService.getAllUsers();
                return users.stream()
                                .map(adminMapper::toUserAdminDTO)
                                .toList();
        }

        @Override
        @Transactional
        public UserAdminDTO updateUserStatus(Long userId, Boolean enabled) {
                if (userId == null) {
                        throw new IllegalArgumentException("User ID is required.");
                }
                if (enabled == null) {
                        throw new IllegalArgumentException("Enabled status is required.");
                }

                UserResponse updatedUser = userService.changeUserStatus(
                                userId,
                                enabled);

                String action = Boolean.TRUE.equals(enabled) ? "USER_ACTIVATED" : "USER_DEACTIVATED";
                String details = String.format("User %s (ID: %d) status changed to %s",
                                updatedUser.getFullName() != null ? updatedUser.getFullName() : "Account",
                                userId,
                                Boolean.TRUE.equals(enabled) ? "ACTIVE" : "INACTIVE");
                recordActivity(action, details);

                return adminMapper.toUserAdminDTO(
                                updatedUser);
        }

        @Override
        @Transactional(readOnly = true)
        public List<CustomerAdminDTO> getCustomers() {
                List<UserResponse> users = userService.getAllUsers();
                List<BookingResponse> allBookings = bookingService.getAllBookings();

                return users.stream()
                                .filter(user -> user.getRole() != null)
                                .filter(user -> "CUSTOMER".equalsIgnoreCase(user.getRole()))
                                .map(user -> toCustomerAdminDTO(user, allBookings))
                                .toList();
        }

        private CustomerAdminDTO toCustomerAdminDTO(UserResponse user, List<BookingResponse> allBookings) {
                Long customerId = user.getId();
                List<BookingResponse> customerBookings = allBookings.stream()
                                .filter(booking -> booking.getCustomerId() != null
                                                && booking.getCustomerId().equals(customerId))
                                .toList();

                int totalBookings = customerBookings.size();

                int completedBookings = (int) customerBookings.stream()
                                .filter(booking -> booking.getBookingStatus() != null
                                                && "COMPLETED".equalsIgnoreCase(booking.getBookingStatus().name()))
                                .count();

                int cancelledBookings = (int) customerBookings.stream()
                                .filter(booking -> booking.getBookingStatus() != null
                                                && "CANCELLED".equalsIgnoreCase(booking.getBookingStatus().name()))
                                .count();

                BigDecimal totalRentalAmount = customerBookings.stream()
                                .map(booking -> {
                                        BigDecimal amount = booking.getRentalAmount();
                                        if (amount == null) {
                                                amount = booking.getTotalAmount();
                                        }
                                        return amount != null ? amount : BigDecimal.ZERO;
                                })
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                boolean verificationStatus = bookingService.checkVerificationStatus(customerId);
                String status = Boolean.TRUE.equals(user.getEnabled()) ? "ACTIVE" : "INACTIVE";

                return CustomerAdminDTO.builder()
                                .customerId(customerId)
                                .customerName(user.getFullName())
                                .email(user.getEmail())
                                .phoneNumber(user.getPhoneNumber())
                                .status(status)
                                .verificationStatus(verificationStatus)
                                .totalBookings(totalBookings)
                                .completedBookings(completedBookings)
                                .cancelledBookings(cancelledBookings)
                                .totalRentalAmount(totalRentalAmount)
                                .profileImage(user.getProfileImage())
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public List<OwnerAdminDTO> getOwners() {
                List<OwnerDTO> owners = ownerService.getAllOwners();
                List<UserResponse> users = userService.getAllUsers();

                return owners.stream()
                                .map(owner -> {
                                        UserResponse ownerUser = users.stream()
                                                        .filter(user -> user.getId() != null
                                                                        && user.getId().equals(owner.getOwnerId()))
                                                        .findFirst()
                                                        .orElse(null);

                                        return adminMapper.toOwnerAdminDTO(owner, ownerUser);
                                })
                                .toList();
        }

        @Override
        public List<BikeAdminDTO> getBikes() {
                List<BikeDTO> bikes = bikeService.getAllBikesForAdmin();
                return bikes.stream()
                                .map(adminMapper::toBikeAdminDTO)
                                .toList();
        }

        @Override
        @Transactional
        public BikeAdminDTO updateBikeStatus(Long bikeId, String status) {
                if (bikeId == null) {
                        throw new IllegalArgumentException("Bike ID is required.");
                }
                if (status == null || status.isBlank()) {
                        throw new IllegalArgumentException("Bike status is required.");
                }

                BikeStatus bikeStatus;
                try {
                        bikeStatus = BikeStatus.from(status);
                } catch (Exception ex) {
                        throw new IllegalArgumentException("Invalid bike status: " + status);
                }

                BikeDTO updatedBike = bikeService.updateBikeStatus(
                                bikeId,
                                bikeStatus);

                String action = (bikeStatus == BikeStatus.AVAILABLE)
                                ? "BIKE_ACTIVATED"
                                : (bikeStatus == BikeStatus.NOT_AVAILABLE ? "BIKE_DEACTIVATED" : "BIKE_STATUS_CHANGED");
                String details = String.format("Bike '%s' (ID: %d) status updated to %s",
                                updatedBike.getBikeName() != null ? updatedBike.getBikeName() : ("Bike #" + bikeId),
                                bikeId,
                                bikeStatus.name());
                recordActivity(action, details);

                return adminMapper.toBikeAdminDTO(updatedBike);
        }

        @Override
        @Transactional
        public void deleteBike(Long bikeId) {
                if (bikeId == null) {
                        throw new IllegalArgumentException("Bike ID is required.");
                }
                bikeService.deleteBike(bikeId);
        }

        @Override
        public List<BookingAdminDTO> getBookings() {
                List<BookingResponse> bookings = bookingService.getAllBookings();
                return bookings.stream()
                                .map(adminMapper::toBookingAdminDTO)
                                .toList();
        }

        @Override
        public List<PaymentResponse> getPayments() {
                return paymentService.getAllPayments();
        }

        @Override
        public List<AdminActivityDTO> getActivity() {

                List<AdminActivityDTO> all = new ArrayList<>(recordedActivities);

                if (verificationAuditRepository != null) {
                        try {
                                List<VerificationAudit> audits = verificationAuditRepository.findAll();
                                for (VerificationAudit audit : audits) {
                                        all.add(AdminActivityDTO.builder()
                                                        .id(audit.getId())
                                                        .action("VERIFICATION_" + (audit.getAction() != null ? audit.getAction() : "AUDIT"))
                                                        .performedBy(audit.getPerformedBy() != null ? audit.getPerformedBy() : "ADMIN")
                                                        .timestamp(audit.getPerformedAt() != null ? audit.getPerformedAt() : LocalDateTime.now())
                                                        .details(audit.getReason() != null ? audit.getReason() : ("Verification document review #" + audit.getDocumentReviewId()))
                                                        .status("SUCCESS")
                                                        .build());
                                }
                        } catch (Exception ignored) {
                        }
                }

                all.sort((a, b) -> {
                        if (a.getTimestamp() == null || b.getTimestamp() == null) return 0;
                        return b.getTimestamp().compareTo(a.getTimestamp());
                });

                return all;
        }

        private void recordActivity(String action, String details) {
                String performedBy = getAuthenticatedAdmin();
                AdminActivityDTO activity = AdminActivityDTO.builder()
                                .id(activityIdCounter.getAndIncrement())
                                .action(action)
                                .performedBy(performedBy)
                                .timestamp(LocalDateTime.now())
                                .details(details)
                                .status("SUCCESS")
                                .build();
                recordedActivities.add(0, activity);
        }

        private String getAuthenticatedAdmin() {
                try {
                        if (currentUserService != null) {
                                String email = currentUserService.getCurrentUserEmail();
                                if (email != null && !email.isBlank()) {
                                        return email;
                                }
                        }
                } catch (Exception ignored) {
                }
                return "ADMIN";
        }
}