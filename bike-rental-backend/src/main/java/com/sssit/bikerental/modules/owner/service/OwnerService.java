package com.sssit.bikerental.modules.owner.service;

import java.util.List;

import com.sssit.bikerental.modules.owner.dto.OwnerDTO;
import com.sssit.bikerental.modules.owner.dto.OwnerDashboardDTO;
import com.sssit.bikerental.modules.owner.dto.BookingRequestDTO;
import com.sssit.bikerental.modules.owner.dto.EarningsDTO;

public interface OwnerService {

    OwnerDTO getOwnerProfile(Long ownerId);

    OwnerDTO updateOwner(Long ownerId, OwnerDTO ownerDTO);

    List<OwnerDTO> getAllOwners();

    OwnerDashboardDTO getDashboard(Long ownerId);

    EarningsDTO getOwnerEarnings(Long ownerId);

    Boolean getVerificationStatus(Long ownerId);

    List<BookingRequestDTO> getBookingRequests(Long ownerId);

    void approveBooking(Long bookingId);

    void rejectBooking(Long bookingId);

    List<com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO> getOwnerPayments(Long ownerId, String status);

    com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO getOwnerPaymentById(Long ownerId, Long paymentId);

    com.sssit.bikerental.modules.owner.dto.OwnerEarningsSummaryDTO getOwnerEarningsSummary(Long ownerId);
}