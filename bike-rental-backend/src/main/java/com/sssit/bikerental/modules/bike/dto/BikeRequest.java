package com.sssit.bikerental.modules.bike.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class BikeRequest {

    @NotBlank(message = "Bike name is required")
    private String bikeName;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotNull(message = "Price per day is required")
    @DecimalMin(value = "1.0", message = "Price must be greater than zero")
    private BigDecimal pricePerDay;

    @NotBlank(message = "Location is required")
    private String location;

    @Positive(message = "Engine capacity must be positive")
    private Integer engineCapacity;

    @Positive(message = "Mileage must be positive")
    private Integer mileage;

    @NotBlank(message = "Fuel type is required")
    private String fuelType;

    private String imageUrl;

}