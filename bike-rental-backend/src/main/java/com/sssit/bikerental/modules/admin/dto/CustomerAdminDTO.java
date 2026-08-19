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
public class CustomerAdminDTO {

    private Long customerId;

    private String customerName;

    private String email;

    private String phoneNumber;

    private String status;

    private Boolean aadhaarVerified;

    private Boolean drivingLicenseVerified;

    private Boolean verificationStatus;

    private Integer totalBookings;

    private Integer completedBookings;

    private Integer cancelledBookings;

    private BigDecimal totalRentalAmount;

    private String profileImage;
}