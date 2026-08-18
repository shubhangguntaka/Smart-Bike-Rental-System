package com.sssit.bikerental.modules.admin.serviceimpl;

import com.sssit.bikerental.modules.admin.dto.AdminDashboardDTO;
import com.sssit.bikerental.modules.admin.dto.BikeAdminDTO;
import com.sssit.bikerental.modules.admin.dto.BookingAdminDTO;
import com.sssit.bikerental.modules.admin.dto.OwnerAdminDTO;
import com.sssit.bikerental.modules.admin.dto.UserAdminDTO;
import com.sssit.bikerental.modules.admin.mapper.AdminMapper;
import com.sssit.bikerental.modules.admin.service.AdminService;
import com.sssit.bikerental.modules.owner.dto.OwnerDTO;
import com.sssit.bikerental.modules.owner.service.OwnerService;
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
    private final AdminMapper adminMapper;

    @Override
    public AdminDashboardDTO getDashboard() {

        /*
         * Dashboard aggregation is scheduled for Day 4.
         * Keep the Day 1 contract functional until the
         * actual dashboard implementation is introduced.
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
                    "User ID is required."
            );
        }

        if (enabled == null) {
            throw new IllegalArgumentException(
                    "Enabled status is required."
            );
        }

        UserResponse updatedUser =
                userService.changeUserStatus(userId, enabled);

        return adminMapper.toUserAdminDTO(updatedUser);
    }

    @Override
    public List<OwnerAdminDTO> getOwners() {

        List<OwnerDTO> owners = ownerService.getAllOwners();

        return owners.stream()
                .map(adminMapper::toOwnerAdminDTO)
                .toList();
    }

    @Override
    public List<BikeAdminDTO> getBikes() {

        throw new UnsupportedOperationException(
                "Bike administration will be implemented on Day 3."
        );
    }

    @Override
    @Transactional
    public BikeAdminDTO updateBikeStatus(
            Long bikeId,
            String status) {

        throw new UnsupportedOperationException(
                "Bike status administration will be implemented on Day 3."
        );
    }

    @Override
    public List<BookingAdminDTO> getBookings() {

        throw new UnsupportedOperationException(
                "Booking administration will be implemented on Day 3."
        );
    }

    @Override
    public List<?> getPayments() {

        throw new UnsupportedOperationException(
                "Payment administration will be implemented on Day 3."
        );
    }

    @Override
    public List<?> getActivity() {

        return List.of();
    }
}