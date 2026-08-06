package com.sssit.bikerental.modules.owner.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerDTO {

    private Long ownerId;

    private String ownerName;

    private String email;

    private Integer totalBikes;

    private Integer totalBookings;

    private BigDecimal totalEarnings;

    private Boolean verificationStatus;
}