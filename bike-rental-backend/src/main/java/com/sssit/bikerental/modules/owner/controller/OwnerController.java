package com.sssit.bikerental.modules.owner.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sssit.bikerental.common.response.ApiResponse;
import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.owner.dto.OwnerDTO;
import com.sssit.bikerental.modules.owner.dto.OwnerDashboardDTO;
import com.sssit.bikerental.modules.owner.dto.BookingRequestDTO;
import com.sssit.bikerental.modules.owner.dto.EarningsDTO;
import com.sssit.bikerental.modules.owner.service.OwnerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;

    private Long resolveOwnerId(Long explicitOwnerId) {
        Long resolved = SecurityUtils.getCurrentUserId();
        if (resolved != null) {
            return resolved;
        }
        if (explicitOwnerId != null) {
            return explicitOwnerId;
        }
        return 1L;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<OwnerDTO>> getProfileContext(
            @RequestParam(value = "ownerId", required = false) Long ownerId) {
        Long resolvedOwnerId = resolveOwnerId(ownerId);
        OwnerDTO profile = ownerService.getOwnerProfile(resolvedOwnerId);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<OwnerDTO>> updateOwnerContext(
            @RequestBody OwnerDTO dto,
            @RequestParam(value = "ownerId", required = false) Long ownerId) {
        Long resolvedOwnerId = resolveOwnerId(ownerId);
        OwnerDTO updated = ownerService.updateOwner(resolvedOwnerId, dto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<OwnerDTO>>> getAllOwners() {
        List<OwnerDTO> owners = ownerService.getAllOwners();
        return ResponseEntity.ok(ApiResponse.success("All owners fetched successfully", owners));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<OwnerDashboardDTO>> dashboard(
            @RequestParam(value = "ownerId", required = false) Long ownerId) {
        Long resolvedOwnerId = resolveOwnerId(ownerId);
        OwnerDashboardDTO dashboardDTO = ownerService.getDashboard(resolvedOwnerId);
        return ResponseEntity.ok(ApiResponse.success("Dashboard data fetched successfully", dashboardDTO));
    }

    @GetMapping("/earnings")
    public ResponseEntity<ApiResponse<EarningsDTO>> earningsContext(
            @RequestParam(value = "ownerId", required = false) Long ownerId) {
        Long resolvedOwnerId = resolveOwnerId(ownerId);
        EarningsDTO earnings = ownerService.getOwnerEarnings(resolvedOwnerId);
        return ResponseEntity.ok(ApiResponse.success("Earnings fetched successfully", earnings));
    }

    @GetMapping("/verification-status")
    public ResponseEntity<ApiResponse<Boolean>> verificationContext(
            @RequestParam(value = "ownerId", required = false) Long ownerId) {
        Long resolvedOwnerId = resolveOwnerId(ownerId);
        Boolean status = ownerService.getVerificationStatus(resolvedOwnerId);
        return ResponseEntity.ok(ApiResponse.success("Verification status fetched successfully", status));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingRequestDTO>>> getBookingRequests(
            @RequestParam(value = "ownerId", required = false) Long ownerId) {
        Long resolvedOwnerId = resolveOwnerId(ownerId);
        List<BookingRequestDTO> bookings = ownerService.getBookingRequests(resolvedOwnerId);
        return ResponseEntity.ok(ApiResponse.success("Booking requests fetched successfully", bookings));
    }

    @PostMapping("/approve/{bookingId}")
    public ResponseEntity<ApiResponse<Void>> approveBooking(@PathVariable Long bookingId) {
        ownerService.approveBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking approved successfully"));
    }

    @PostMapping("/reject/{bookingId}")
    public ResponseEntity<ApiResponse<Void>> rejectBooking(@PathVariable Long bookingId) {
        ownerService.rejectBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking rejected successfully"));
    }
}
