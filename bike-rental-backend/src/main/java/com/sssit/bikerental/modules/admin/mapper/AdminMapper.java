package com.sssit.bikerental.modules.admin.mapper;

import com.sssit.bikerental.modules.admin.dto.OwnerAdminDTO;
import com.sssit.bikerental.modules.admin.dto.UserAdminDTO;
import com.sssit.bikerental.modules.owner.dto.OwnerDTO;
import com.sssit.bikerental.modules.user.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    /**
     * Converts the existing User module response into
     * the Section 3 Admin user contract.
     */
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

    /**
     * Converts the existing Owner module response into
     * the Section 3 Admin owner contract.
     */
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
                .status("ACTIVE")
                .build();
    }
}