package com.sssit.bikerental.modules.owner.mapper;

import com.sssit.bikerental.modules.owner.dto.OwnerDTO;
import com.sssit.bikerental.modules.user.User;
import java.math.BigDecimal;

public class OwnerMapper {

    private OwnerMapper() {}

    public static OwnerDTO toDTO(User user, int totalBikes, int totalBookings, BigDecimal totalEarnings, boolean verificationStatus) {
        if (user == null) {
            return null;
        }
        return OwnerDTO.builder()
                .ownerId(user.getId())
                .ownerName(user.getFullName())
                .email(user.getEmail())
                .totalBikes(totalBikes)
                .totalBookings(totalBookings)
                .totalEarnings(totalEarnings)
                .verificationStatus(verificationStatus)
                .build();
    }
}