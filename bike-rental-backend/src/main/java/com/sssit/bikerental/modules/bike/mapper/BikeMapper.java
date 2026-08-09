package com.sssit.bikerental.modules.bike.mapper;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.bike.dto.BikeDTO;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;

@Component
public class BikeMapper {

    public BikeDTO toDTO(Bike bike) {
        if (bike == null) {
            return null;
        }

        return BikeDTO.builder()
                .bikeId(bike.getBikeId())
                .ownerId(bike.getOwnerId())
                .bikeName(bike.getBikeName())
                .brand(bike.getBrand())
                .model(bike.getModel())
                .registrationNumber(bike.getRegistrationNumber())
                .fuelType(bike.getFuelType())
                .rentalPrice(bike.getRentalPrice())
                .location(bike.getLocation())
                .bikeStatus(bike.getBikeStatus())
                .rcNumber(bike.getRcNumber())
                .rcVerified(bike.getRcVerified())
                .imageUrl(bike.getImageUrl() != null && !bike.getImageUrl().isBlank()
                        ? bike.getImageUrl()
                        : "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80")
                .imageUrls(bike.getImageUrls() != null ? new java.util.ArrayList<>(bike.getImageUrls()) : new java.util.ArrayList<>())
                .description(bike.getDescription())
                .engineCapacity(bike.getEngineCapacity())
                .mileage(bike.getMileage())
                .transmission(bike.getTransmission())
                .seatingCapacity(bike.getSeatingCapacity())
                .latitude(bike.getLatitude())
                .longitude(bike.getLongitude())
                .rentalType(bike.getRentalType())
                .hourlyRate(bike.getHourlyRate())
                .availableStartTime(bike.getAvailableStartTime())
                .availableEndTime(bike.getAvailableEndTime())
                .build();
    }

    public Bike toEntity(BikeDTO bikeDTO) {
        if (bikeDTO == null) {
            return null;
        }

        java.util.List<String> list = bikeDTO.getImageUrls() != null ? new java.util.ArrayList<>(bikeDTO.getImageUrls()) : new java.util.ArrayList<>();
        if (list.isEmpty() && bikeDTO.getImageUrl() != null && !bikeDTO.getImageUrl().isBlank()) {
            list.add(bikeDTO.getImageUrl().trim());
        }

        return Bike.builder()
                .bikeId(bikeDTO.getBikeId())
                .ownerId(bikeDTO.getOwnerId())
                .bikeName(trim(bikeDTO.getBikeName()))
                .brand(trim(bikeDTO.getBrand()))
                .model(trim(bikeDTO.getModel()))
                .registrationNumber(normalizePlate(bikeDTO.getRegistrationNumber()))
                .fuelType(trim(bikeDTO.getFuelType()))
                .rentalPrice(bikeDTO.getRentalPrice())
                .location(trim(bikeDTO.getLocation()))
                .bikeStatus(bikeDTO.getBikeStatus() != null
                        ? bikeDTO.getBikeStatus()
                        : BikeStatus.AVAILABLE)
                .rcNumber(normalizePlate(bikeDTO.getRcNumber()))
                .rcVerified(Boolean.TRUE.equals(bikeDTO.getRcVerified()))
                .imageUrl(trim(bikeDTO.getImageUrl()))
                .imageUrls(list)
                .description(trim(bikeDTO.getDescription()))
                .engineCapacity(trim(bikeDTO.getEngineCapacity()))
                .mileage(trim(bikeDTO.getMileage()))
                .transmission(trim(bikeDTO.getTransmission()))
                .seatingCapacity(bikeDTO.getSeatingCapacity())
                .latitude(bikeDTO.getLatitude())
                .longitude(bikeDTO.getLongitude())
                .rentalType(bikeDTO.getRentalType())
                .hourlyRate(bikeDTO.getHourlyRate())
                .availableStartTime(bikeDTO.getAvailableStartTime())
                .availableEndTime(bikeDTO.getAvailableEndTime())
                .build();
    }

    public void applyUpdate(Bike bike, BikeDTO bikeDTO) {
        if (bikeDTO.getBikeName() != null) {
            bike.setBikeName(trim(bikeDTO.getBikeName()));
        }
        if (bikeDTO.getBrand() != null) {
            bike.setBrand(trim(bikeDTO.getBrand()));
        }
        if (bikeDTO.getModel() != null) {
            bike.setModel(trim(bikeDTO.getModel()));
        }
        if (bikeDTO.getFuelType() != null) {
            bike.setFuelType(trim(bikeDTO.getFuelType()));
        }
        if (bikeDTO.getRentalPrice() != null) {
            bike.setRentalPrice(bikeDTO.getRentalPrice());
        }
        if (bikeDTO.getLocation() != null) {
            bike.setLocation(trim(bikeDTO.getLocation()));
        }
        if (bikeDTO.getBikeStatus() != null) {
            bike.setBikeStatus(bikeDTO.getBikeStatus());
        }
        if (bikeDTO.getImageUrl() != null) {
            bike.setImageUrl(trim(bikeDTO.getImageUrl()));
        }
        if (bikeDTO.getImageUrls() != null) {
            bike.setImageUrls(new java.util.ArrayList<>(bikeDTO.getImageUrls()));
        }
        if (bikeDTO.getDescription() != null) {
            bike.setDescription(trim(bikeDTO.getDescription()));
        }
        if (bikeDTO.getEngineCapacity() != null) {
            bike.setEngineCapacity(trim(bikeDTO.getEngineCapacity()));
        }
        if (bikeDTO.getMileage() != null) {
            bike.setMileage(trim(bikeDTO.getMileage()));
        }
        if (bikeDTO.getTransmission() != null) {
            bike.setTransmission(trim(bikeDTO.getTransmission()));
        }
        if (bikeDTO.getSeatingCapacity() != null) {
            bike.setSeatingCapacity(bikeDTO.getSeatingCapacity());
        }
        if (bikeDTO.getLatitude() != null) {
            bike.setLatitude(bikeDTO.getLatitude());
        }
        if (bikeDTO.getLongitude() != null) {
            bike.setLongitude(bikeDTO.getLongitude());
        }
        if (bikeDTO.getRentalType() != null) {
            bike.setRentalType(bikeDTO.getRentalType());
        }
        if (bikeDTO.getHourlyRate() != null) {
            bike.setHourlyRate(bikeDTO.getHourlyRate());
        }
        if (bikeDTO.getAvailableStartTime() != null) {
            bike.setAvailableStartTime(bikeDTO.getAvailableStartTime());
        }
        if (bikeDTO.getAvailableEndTime() != null) {
            bike.setAvailableEndTime(bikeDTO.getAvailableEndTime());
        }
        // registrationNumber / rcNumber / rcVerified are immutable after create
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }

    private static String normalizePlate(String value) {
        if (value == null) {
            return null;
        }
        return value.replaceAll("\\s+", "").toUpperCase();
    }
}
