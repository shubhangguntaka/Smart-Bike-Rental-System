package com.sssit.bikerental.modules.admin.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerAdminDTO {

    private Long ownerId;

    private String ownerName;

    private String email;

    private String phoneNumber;

    private String status;

    private Boolean verificationStatus;

    private Integer totalBikes;

    private Integer totalBookings;

    private BigDecimal totalEarnings;

    private String profileImage;
}