package com.sssit.bikerental.modules.admin.service;

import com.sssit.bikerental.modules.admin.dto.AdminDashboardDTO;
import com.sssit.bikerental.modules.admin.dto.BikeAdminDTO;
import com.sssit.bikerental.modules.admin.dto.BookingAdminDTO;
import com.sssit.bikerental.modules.admin.dto.OwnerAdminDTO;
import com.sssit.bikerental.modules.admin.dto.UserAdminDTO;

import java.util.List;

public interface AdminService {

    AdminDashboardDTO getDashboard();

    List<UserAdminDTO> getUsers();

    UserAdminDTO updateUserStatus(Long userId, Boolean enabled);

    List<OwnerAdminDTO> getOwners();

    List<BikeAdminDTO> getBikes();

    BikeAdminDTO updateBikeStatus(Long bikeId, String status);

    List<BookingAdminDTO> getBookings();

    List<?> getPayments();

    List<?> getActivity();
}