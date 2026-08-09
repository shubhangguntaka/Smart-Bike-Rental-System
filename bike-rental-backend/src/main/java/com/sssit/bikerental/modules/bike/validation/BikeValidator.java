package com.sssit.bikerental.modules.bike.validation;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.bike.dto.BikeRequest;
import com.sssit.bikerental.modules.bike.exception.BikeAlreadyExistsException;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BikeValidator {

    private final BikeRepository bikeRepository;

    /**
     * Validate Bike Request
     */
    public void validate(BikeRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Bike request cannot be null.");
        }

        if (bikeRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new BikeAlreadyExistsException("Bike with this registration number already exists.");
        }

        if (request.getPricePerDay().doubleValue() <= 0) {
            throw new IllegalArgumentException("Price per day must be greater than zero.");
        }

        if (request.getEngineCapacity() <= 0) {
            throw new IllegalArgumentException("Engine capacity must be greater than zero.");
        }

        if (request.getMileage() <= 0) {
            throw new IllegalArgumentException("Mileage must be greater than zero.");
        }
    }

}