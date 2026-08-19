package com.sssit.bikerental.modules.admin.controller;

import com.sssit.bikerental.common.response.ApiResponse;
import com.sssit.bikerental.modules.admin.dto.AdminDashboardDTO;
import com.sssit.bikerental.modules.admin.dto.BikeAdminDTO;
import com.sssit.bikerental.modules.admin.dto.BookingAdminDTO;
import com.sssit.bikerental.modules.admin.dto.CustomerAdminDTO;
import com.sssit.bikerental.modules.admin.dto.OwnerAdminDTO;
import com.sssit.bikerental.modules.admin.dto.UserAdminDTO;
import com.sssit.bikerental.modules.admin.service.AdminService;
import com.sssit.bikerental.modules.payment.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserAdminDTO>> getUsers() {
        return ResponseEntity.ok(adminService.getUsers());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserAdminDTO> updateUserStatus(
            @PathVariable("id") Long userId,
            @RequestParam("enabled") Boolean enabled) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, enabled));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<CustomerAdminDTO>>> getCustomers() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customers retrieved successfully",
                        adminService.getCustomers()
                )
        );
    }

    @GetMapping("/owners")
    public ResponseEntity<List<OwnerAdminDTO>> getOwners() {
        return ResponseEntity.ok(adminService.getOwners());
    }

    @GetMapping("/bikes")
    public ResponseEntity<List<BikeAdminDTO>> getBikes() {
        return ResponseEntity.ok(adminService.getBikes());
    }

    @PutMapping("/bikes/{id}/status")
    public ResponseEntity<BikeAdminDTO> updateBikeStatus(
            @PathVariable("id") Long bikeId,
            @RequestParam("status") String status) {
        return ResponseEntity.ok(adminService.updateBikeStatus(bikeId, status));
    }

    @DeleteMapping("/bikes/{id}")
    public ResponseEntity<?> deleteBike(@PathVariable("id") Long bikeId) {
        adminService.deleteBike(bikeId);
        return ResponseEntity.ok("Bike deleted successfully");
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingAdminDTO>> getBookings() {
        return ResponseEntity.ok(adminService.getBookings());
    }

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentResponse>> getPayments() {
        return ResponseEntity.ok(adminService.getPayments());
    }

    @GetMapping("/activity")
    public ResponseEntity<List<?>> getActivity() {
        return ResponseEntity.ok(adminService.getActivity());
    }
}