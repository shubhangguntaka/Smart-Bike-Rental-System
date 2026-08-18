package com.sssit.bikerental.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BikeAdminDTO {

    private Long bikeId;

    private String bikeName;
    private String registrationNumber;

    private Long ownerId;
    private String ownerName;

    private String category;
    private String bikeStatus;

    private BigDecimal pricePerHour;

    private String location;
}