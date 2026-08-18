package com.sssit.bikerental.modules.admin.serviceimpl;

import com.sssit.bikerental.modules.admin.dto.AdminDashboardDTO;
import com.sssit.bikerental.modules.admin.dto.BikeAdminDTO;
import com.sssit.bikerental.modules.admin.dto.BookingAdminDTO;
import com.sssit.bikerental.modules.admin.dto.OwnerAdminDTO;
import com.sssit.bikerental.modules.admin.dto.UserAdminDTO;
import com.sssit.bikerental.modules.admin.service.AdminService;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    @Override
    public AdminDashboardDTO getDashboard() {
        /*
         * Day 1 contract placeholder.
         *
         * Real dashboard aggregation will be implemented
         * according to the Section 3 schedule.
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
        return Collections.emptyList();
    }

    @Override
    public UserAdminDTO updateUserStatus(Long userId, Boolean enabled) {
        throw new UnsupportedOperationException(
                "User status management will be implemented on Day 2."
        );
    }

    @Override
    public List<OwnerAdminDTO> getOwners() {
        return Collections.emptyList();
    }

    @Override
    public List<BikeAdminDTO> getBikes() {
        return Collections.emptyList();
    }

    @Override
    public BikeAdminDTO updateBikeStatus(Long bikeId, String status) {
        throw new UnsupportedOperationException(
                "Bike status management will be implemented on Day 3."
        );
    }

    @Override
    public List<BookingAdminDTO> getBookings() {
        return Collections.emptyList();
    }

    @Override
    public List<?> getPayments() {
        return Collections.emptyList();
    }

    @Override
    public List<?> getActivity() {
        return Collections.emptyList();
    }
}