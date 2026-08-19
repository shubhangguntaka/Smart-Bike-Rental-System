package com.sssit.bikerental.modules.admin.service.serviceimpl;

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
import com.sssit.bikerental.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

        private final UserService userService;
        private final OwnerService ownerService;
        private final BikeService bikeService;
        private final BookingService bookingService;
        private final PaymentService paymentService;
        private final AdminMapper adminMapper;

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
        public UserAdminDTO updateUserStatus(
                        Long userId,
                        Boolean enabled) {

                if (userId == null) {
                        throw new IllegalArgumentException(
                                        "User ID is required.");
                }

                if (enabled == null) {
                        throw new IllegalArgumentException(
                                        "Enabled status is required.");
                }

                UserResponse updatedUser = userService.changeUserStatus(
                                userId,
                                enabled);

                return adminMapper.toUserAdminDTO(
                                updatedUser);
        }

        @Override
        @Transactional(readOnly = true)
        public List<CustomerAdminDTO> getCustomers() {

                List<UserResponse> users = userService.getAllUsers();

                /*
                 * Admin already has access to the complete booking
                 * administration contract. Use it once and aggregate
                 * bookings by customer instead of calling the
                 * customer-scoped booking API for every customer.
                 */
                List<BookingResponse> allBookings = bookingService.getAllBookings();

                return users.stream()
                                .filter(user -> user.getRole() != null)
                                .filter(user -> "CUSTOMER".equalsIgnoreCase(
                                                user.getRole()))
                                .map(user -> toCustomerAdminDTO(
                                                user,
                                                allBookings))
                                .toList();
        }

        private CustomerAdminDTO toCustomerAdminDTO(
                        UserResponse user,
                        List<BookingResponse> allBookings) {

                Long customerId = user.getId();

                /*
                 * Only bookings belonging to this customer.
                 */
                List<BookingResponse> customerBookings = allBookings.stream()
                                .filter(booking -> booking.getCustomerId() != null
                                                && booking.getCustomerId()
                                                                .equals(customerId))
                                .toList();

                int totalBookings = customerBookings.size();

                int completedBookings = (int) customerBookings.stream()
                                .filter(booking -> booking.getBookingStatus() != null
                                                && "COMPLETED".equalsIgnoreCase(
                                                                booking.getBookingStatus().name()))
                                .count();

                int cancelledBookings = (int) customerBookings.stream()
                                .filter(booking -> booking.getBookingStatus() != null
                                                && "CANCELLED".equalsIgnoreCase(
                                                                booking.getBookingStatus().name()))
                                .count();

                BigDecimal totalRentalAmount = customerBookings.stream()
                                .map(booking -> {

                                        /*
                                         * Prefer rentalAmount.
                                         * Fall back to totalAmount for
                                         * older booking records.
                                         */
                                        BigDecimal amount = booking.getRentalAmount();

                                        if (amount == null) {
                                                amount = booking.getTotalAmount();
                                        }

                                        return amount != null
                                                        ? amount
                                                        : BigDecimal.ZERO;
                                })
                                .reduce(
                                                BigDecimal.ZERO,
                                                BigDecimal::add);

                /*
                 * Reuse the existing verification business rule.
                 * BookingService checks approved Aadhaar + DL.
                 */
                boolean verificationStatus = bookingService.checkVerificationStatus(
                                customerId);

                String status = Boolean.TRUE.equals(
                                user.getEnabled())
                                                ? "ACTIVE"
                                                : "INACTIVE";

                return CustomerAdminDTO.builder()
                                .customerId(customerId)
                                .customerName(user.getFullName())
                                .email(user.getEmail())
                                .phoneNumber(user.getPhoneNumber())
                                .status(status)
                                .verificationStatus(
                                                verificationStatus)
                                .totalBookings(
                                                totalBookings)
                                .completedBookings(
                                                completedBookings)
                                .cancelledBookings(
                                                cancelledBookings)
                                .totalRentalAmount(
                                                totalRentalAmount)
                                .profileImage(
                                                user.getProfileImage())
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
                                                                        && user.getId().equals(
                                                                                        owner.getOwnerId()))
                                                        .findFirst()
                                                        .orElse(null);

                                        return adminMapper.toOwnerAdminDTO(
                                                        owner,
                                                        ownerUser);
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
        public BikeAdminDTO updateBikeStatus(
                        Long bikeId,
                        String status) {

                if (bikeId == null) {
                        throw new IllegalArgumentException(
                                        "Bike ID is required.");
                }

                if (status == null || status.isBlank()) {
                        throw new IllegalArgumentException(
                                        "Bike status is required.");
                }

                BikeStatus bikeStatus;

                try {
                        bikeStatus = BikeStatus.from(status);
                } catch (Exception ex) {
                        throw new IllegalArgumentException(
                                        "Invalid bike status: " + status);
                }

                BikeDTO updatedBike = bikeService.updateBikeStatus(
                                bikeId,
                                bikeStatus);

                return adminMapper.toBikeAdminDTO(
                                updatedBike);
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
        public List<?> getActivity() {

                /*
                 * Activity logging is part of the later Admin workflow.
                 */
                return List.of();
        }
}