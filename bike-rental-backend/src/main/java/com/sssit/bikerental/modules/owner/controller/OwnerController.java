package com.sssit.bikerental.modules.owner.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.exception.ResourceOwnershipException;
import com.sssit.bikerental.common.exception.UnauthorizedException;
import com.sssit.bikerental.common.response.ApiResponse;
import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.booking.dto.CancelBookingRequest;
import com.sssit.bikerental.modules.booking.service.BookingService;
import com.sssit.bikerental.modules.owner.dto.OwnerDTO;
import com.sssit.bikerental.modules.owner.dto.OwnerDashboardDTO;
import com.sssit.bikerental.modules.owner.dto.BookingRequestDTO;
import com.sssit.bikerental.modules.owner.dto.EarningsDTO;
import com.sssit.bikerental.modules.owner.service.OwnerService;
import com.sssit.bikerental.modules.payment.dto.BankAccountDTO;
import com.sssit.bikerental.modules.payment.service.BankAccountService;
import com.sssit.bikerental.modules.user.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class OwnerController {

    private final OwnerService ownerService;
    private final BookingService bookingService;
    private final BankAccountService bankAccountService;

    private User getAuthenticatedOwner() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) {
            throw new UnauthorizedException("Authentication required");
        }
        if (user.getRole() != Role.OWNER && user.getRole() != Role.ADMIN) {
            throw new ResourceOwnershipException("User is not an authorized OWNER");
        }
        return user;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<OwnerDTO>> getProfileContext() {
        User owner = getAuthenticatedOwner();
        OwnerDTO profile = ownerService.getOwnerProfile(owner.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<OwnerDTO>> updateOwnerContext(
            @RequestBody OwnerDTO dto) {
        User owner = getAuthenticatedOwner();
        OwnerDTO updated = ownerService.updateOwner(owner.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OwnerDTO>>> getAllOwners() {
        List<OwnerDTO> owners = ownerService.getAllOwners();
        return ResponseEntity.ok(ApiResponse.success("All owners fetched successfully", owners));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<OwnerDashboardDTO>> dashboard() {
        User owner = getAuthenticatedOwner();
        OwnerDashboardDTO dashboardDTO = ownerService.getDashboard(owner.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard data fetched successfully", dashboardDTO));
    }

    @GetMapping("/earnings")
    public ResponseEntity<ApiResponse<EarningsDTO>> earningsContext() {
        User owner = getAuthenticatedOwner();
        EarningsDTO earnings = ownerService.getOwnerEarnings(owner.getId());
        return ResponseEntity.ok(ApiResponse.success("Earnings fetched successfully", earnings));
    }

    @GetMapping("/verification-status")
    public ResponseEntity<ApiResponse<Boolean>> verificationContext() {
        User owner = getAuthenticatedOwner();
        Boolean status = ownerService.getVerificationStatus(owner.getId());
        return ResponseEntity.ok(ApiResponse.success("Verification status fetched successfully", status));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingRequestDTO>>> getBookingRequests() {
        User owner = getAuthenticatedOwner();
        List<BookingRequestDTO> bookings = ownerService.getBookingRequests(owner.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking requests fetched successfully", bookings));
    }

    @PostMapping("/approve/{bookingId}")
    public ResponseEntity<ApiResponse<Void>> approveBooking(@PathVariable Long bookingId) {
        getAuthenticatedOwner();
        ownerService.approveBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking approved successfully"));
    }

    @PostMapping("/reject/{bookingId}")
    public ResponseEntity<ApiResponse<Void>> rejectBooking(@PathVariable Long bookingId) {
        getAuthenticatedOwner();
        ownerService.rejectBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking rejected successfully"));
    }

    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody CancelBookingRequest request) {
        getAuthenticatedOwner();
        BookingResponse response = bookingService.cancelBooking(bookingId, request);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", response));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO>>> getOwnerPayments(
            @RequestParam(required = false) String status) {
        User owner = getAuthenticatedOwner();
        List<com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO> payments = ownerService.getOwnerPayments(owner.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Owner payment history fetched successfully", payments));
    }

    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<ApiResponse<com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO>> getOwnerPaymentById(
            @PathVariable Long paymentId) {
        User owner = getAuthenticatedOwner();
        com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO payment = ownerService.getOwnerPaymentById(owner.getId(), paymentId);
        return ResponseEntity.ok(ApiResponse.success("Owner payment details fetched successfully", payment));
    }

    @GetMapping("/payments/summary")
    public ResponseEntity<ApiResponse<com.sssit.bikerental.modules.owner.dto.OwnerEarningsSummaryDTO>> getOwnerEarningsSummary() {
        User owner = getAuthenticatedOwner();
        com.sssit.bikerental.modules.owner.dto.OwnerEarningsSummaryDTO summary = ownerService.getOwnerEarningsSummary(owner.getId());
        return ResponseEntity.ok(ApiResponse.success("Owner earnings summary fetched successfully", summary));
    }

    // === Owner Banking Details Endpoints ===
    @GetMapping("/bank-account")
    public ResponseEntity<ApiResponse<BankAccountDTO>> getBankAccount() {
        User owner = getAuthenticatedOwner();
        BankAccountDTO account = bankAccountService.getBankAccountByUserId(owner.getId());
        return ResponseEntity.ok(ApiResponse.success("Owner bank account fetched successfully", account));
    }

    @PutMapping("/bank-account")
    public ResponseEntity<ApiResponse<BankAccountDTO>> updateBankAccount(
            @RequestBody BankAccountDTO dto) {
        User owner = getAuthenticatedOwner();
        BankAccountDTO updated = bankAccountService.saveOrUpdateBankAccount(owner.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success("Owner bank account updated successfully", updated));
    }
}
