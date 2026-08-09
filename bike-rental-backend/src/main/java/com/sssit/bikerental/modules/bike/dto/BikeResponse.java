package com.sssit.bikerental.modules.bike.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BikeResponse {

    private Long bikeId;

    private String bikeName;

    private String brand;

    private String model;

    private String registrationNumber;

    private BigDecimal pricePerDay;

    private String location;

    private Integer engineCapacity;

    private Integer mileage;

    private String fuelType;

    private Boolean available;

    private String imageUrl;

    private Long ownerId;

}