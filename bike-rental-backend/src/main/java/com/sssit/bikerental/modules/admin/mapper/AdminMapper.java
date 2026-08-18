package com.sssit.bikerental.modules.admin.mapper;

import com.sssit.bikerental.modules.admin.dto.BikeAdminDTO;
import com.sssit.bikerental.modules.admin.dto.BookingAdminDTO;
import com.sssit.bikerental.modules.admin.dto.OwnerAdminDTO;
import com.sssit.bikerental.modules.admin.dto.UserAdminDTO;
import com.sssit.bikerental.modules.bike.dto.BikeDTO;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.owner.dto.OwnerDTO;
import com.sssit.bikerental.modules.user.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    public UserAdminDTO toUserAdminDTO(UserResponse user) {

        if (user == null) {
            return null;
        }

        String status = Boolean.TRUE.equals(user.getEnabled())
                ? "ACTIVE"
                : "BLOCKED";

        return UserAdminDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .status(status)
                .profileImage(user.getProfileImage())
                .build();
    }

    public OwnerAdminDTO toOwnerAdminDTO(OwnerDTO owner) {

        if (owner == null) {
            return null;
        }

        return OwnerAdminDTO.builder()
                .ownerId(owner.getOwnerId())
                .ownerName(owner.getOwnerName())
                .email(owner.getEmail())
                .totalBikes(owner.getTotalBikes())
                .totalBookings(owner.getTotalBookings())
                .totalEarnings(owner.getTotalEarnings())
                .verificationStatus(owner.getVerificationStatus())
                .status(
                        Boolean.TRUE.equals(owner.getVerificationStatus())
                                ? "VERIFIED"
                                : "PENDING"
                )
                .build();
    }

    public BikeAdminDTO toBikeAdminDTO(BikeDTO bike) {

        if (bike == null) {
            return null;
        }

        return BikeAdminDTO.builder()
                .bikeId(bike.getBikeId())
                .bikeName(bike.getBikeName())
                .brand(bike.getBrand())
                .model(bike.getModel())
                .registrationNumber(bike.getRegistrationNumber())
                .ownerId(bike.getOwnerId())
                .ownerName(bike.getOwnerName())
                .bikeStatus(bike.getBikeStatus())
                .rentalPrice(bike.getRentalPrice())
                .hourlyRate(bike.getHourlyRate())
                .location(bike.getLocation())
                .rcVerified(bike.getRcVerified())
                .imageUrl(bike.getImageUrl())
                .build();
    }

    public BookingAdminDTO toBookingAdminDTO(
            BookingResponse booking) {

        if (booking == null) {
            return null;
        }

        return BookingAdminDTO.builder()
                .bookingId(booking.getBookingId())
                .customerId(booking.getCustomerId())
                .customerName(booking.getCustomerName())
                .ownerId(booking.getOwnerId())
                .ownerName(booking.getOwnerName())
                .bikeId(booking.getBikeId())
                .bikeName(booking.getBikeName())
                .registrationNumber(booking.getRegistrationNumber())
                .bookingStatus(booking.getBookingStatus())
                .paymentStatus(booking.getPaymentStatus())
                .startTime(booking.getStartTime())
                .returnTime(booking.getReturnTime())
                .actualPickupTime(booking.getActualPickupTime())
                .actualReturnTime(booking.getActualReturnTime())
                .rentalAmount(booking.getRentalAmount())
                .totalAmount(booking.getTotalAmount())
                .bookingReference(booking.getBookingReference())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}