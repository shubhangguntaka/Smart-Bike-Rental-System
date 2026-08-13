package com.sssit.bikerental.modules.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyBikeDTO {

    private Long bikeId;

    private String bikeName;

    private String brand;

    private String model;

    private String registrationNumber;

    private String fuelType;

    private String location;

    private String description;

    private String engineCapacity;

    private String mileage;

    private String transmission;

    private Integer seatingCapacity;

    private Double hourlyRate;

    private Double rentalPrice;

    private Double latitude;

    private Double longitude;

    private Double distance;

    private String imageUrl;

    private Boolean available;

    private String availableStartTime;

    private String availableEndTime;

    private String ownerName;
}