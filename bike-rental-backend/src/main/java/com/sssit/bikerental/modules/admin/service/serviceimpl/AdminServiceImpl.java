package com.sssit.bikerental.modules.admin.service.serviceimpl;

import com.sssit.bikerental.modules.admin.dto.AdminDashboardDTO;
import com.sssit.bikerental.modules.admin.dto.BikeAdminDTO;
import com.sssit.bikerental.modules.admin.dto.BookingAdminDTO;
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

        /*
         * Dashboard aggregation belongs to Day 4.
         */
        return AdminDashboardDTO.builder()
                .totalUsers(0)
                .totalOwners(0)
                .totalBikes(0)
                .totalBookings(0)
                .totalPayments(0)
                .activeUsers(0)
                .activeBikes(0)
                .activeBookings(0)
                .pendingBookings(0)
                .completedBookings(0)
                .cancelledBookings(0)
                .build();
    }

    @Override
    public List<UserAdminDTO> getUsers() {

        List<UserResponse> users =
                userService.getAllUsers();

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
                    "User ID is required."
            );
        }

        if (enabled == null) {
            throw new IllegalArgumentException(
                    "Enabled status is required."
            );
        }

        UserResponse updatedUser =
                userService.changeUserStatus(
                        userId,
                        enabled
                );

        return adminMapper.toUserAdminDTO(
                updatedUser
        );
    }

    @Override
    public List<OwnerAdminDTO> getOwners() {

        List<OwnerDTO> owners =
                ownerService.getAllOwners();

        return owners.stream()
                .map(adminMapper::toOwnerAdminDTO)
                .toList();
    }

    @Override
    public List<BikeAdminDTO> getBikes() {

        List<BikeDTO> bikes =
                bikeService.getAllBikesForAdmin();

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
                    "Bike ID is required."
            );
        }

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Bike status is required."
            );
        }

        BikeStatus bikeStatus;

        try {
            bikeStatus = BikeStatus.from(status);
        } catch (Exception ex) {
            throw new IllegalArgumentException(
                    "Invalid bike status: " + status
            );
        }

        BikeDTO updateRequest = BikeDTO.builder()
                .bikeId(bikeId)
                .bikeStatus(bikeStatus)
                .build();

        BikeDTO updatedBike =
                bikeService.updateBike(
                        bikeId,
                        updateRequest
                );

        return adminMapper.toBikeAdminDTO(
                updatedBike
        );
    }

    @Override
    public List<BookingAdminDTO> getBookings() {

        List<BookingResponse> bookings =
                bookingService.getAllBookings();

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