package com.sssit.bikerental.modules.admin.dto;

import com.sssit.bikerental.modules.bike.enums.BikeStatus;
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

    private String brand;

    private String model;

    private String registrationNumber;

    private Long ownerId;

    private String ownerName;

    private String category;

    private BikeStatus bikeStatus;

    private BigDecimal rentalPrice;

    private BigDecimal hourlyRate;

    private String location;

    private Boolean rcVerified;

    private String imageUrl;
}