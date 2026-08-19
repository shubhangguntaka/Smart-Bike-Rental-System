package com.sssit.bikerental.modules.admin.controller;

import com.sssit.bikerental.modules.admin.dto.AdminDashboardDTO;
import com.sssit.bikerental.modules.admin.dto.BikeAdminDTO;
import com.sssit.bikerental.modules.admin.dto.BookingAdminDTO;
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

        return ResponseEntity.ok(
                adminService.getDashboard()
        );
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserAdminDTO>> getUsers() {

        return ResponseEntity.ok(
                adminService.getUsers()
        );
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserAdminDTO> updateUserStatus(
            @PathVariable("id") Long userId,
            @RequestParam("enabled") Boolean enabled) {

        return ResponseEntity.ok(
                adminService.updateUserStatus(
                        userId,
                        enabled
                )
        );
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<UserAdminDTO> blockUser(@PathVariable("id") Long userId) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, false));
    }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<UserAdminDTO> unblockUser(@PathVariable("id") Long userId) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, true));
    }

    @PutMapping("/users/{id}/lock")
    public ResponseEntity<UserAdminDTO> lockUser(@PathVariable("id") Long userId) {
        return ResponseEntity.ok(adminService.lockUser(userId, true));
    }

    @PutMapping("/users/{id}/unlock")
    public ResponseEntity<UserAdminDTO> unlockUser(@PathVariable("id") Long userId) {
        return ResponseEntity.ok(adminService.lockUser(userId, false));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/owners")
    public ResponseEntity<List<OwnerAdminDTO>> getOwners() {

        return ResponseEntity.ok(
                adminService.getOwners()
        );
    }

    /**
     * GET /api/admin/bikes
     */
    @GetMapping("/bikes")
    public ResponseEntity<List<BikeAdminDTO>> getBikes() {

        return ResponseEntity.ok(
                adminService.getBikes()
        );
    }

    /**
     * PUT /api/admin/bikes/{id}/status
     */
    @PutMapping("/bikes/{id}/status")
    public ResponseEntity<BikeAdminDTO> updateBikeStatus(
            @PathVariable("id") Long bikeId,
            @RequestParam("status") String status) {

        return ResponseEntity.ok(
                adminService.updateBikeStatus(
                        bikeId,
                        status
                )
        );
    }

    @PutMapping("/bikes/{id}/block")
    public ResponseEntity<BikeAdminDTO> blockBike(@PathVariable("id") Long bikeId) {
        return ResponseEntity.ok(adminService.updateBikeStatus(bikeId, "NOT_AVAILABLE"));
    }

    @PutMapping("/bikes/{id}/unblock")
    public ResponseEntity<BikeAdminDTO> unblockBike(@PathVariable("id") Long bikeId) {
        return ResponseEntity.ok(adminService.updateBikeStatus(bikeId, "AVAILABLE"));
    }

    @DeleteMapping("/bikes/{id}")
    public ResponseEntity<?> deleteBike(@PathVariable("id") Long bikeId) {
        adminService.deleteBike(bikeId);
        return ResponseEntity.ok("Bike deleted successfully");
    }

    /**
     * GET /api/admin/bookings
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingAdminDTO>> getBookings() {

        return ResponseEntity.ok(
                adminService.getBookings()
        );
    }

    /**
     * GET /api/admin/payments
     */
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentResponse>> getPayments() {

        return ResponseEntity.ok(
                adminService.getPayments()
        );
    }

    /**
     * GET /api/admin/activity
     *
     * Activity log implementation is handled later.
     */
    @GetMapping("/activity")
    public ResponseEntity<List<?>> getActivity() {

        return ResponseEntity.ok(
                adminService.getActivity()
        );
    }
}