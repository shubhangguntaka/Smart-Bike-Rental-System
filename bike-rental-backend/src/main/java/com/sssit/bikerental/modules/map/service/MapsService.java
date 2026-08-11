package com.sssit.bikerental.modules.map.service;

import com.sssit.bikerental.modules.map.dto.BikeLocationDTO;
import com.sssit.bikerental.modules.map.dto.DistanceResponseDTO;
import com.sssit.bikerental.modules.map.dto.NearbyBikeDTO;
import com.sssit.bikerental.modules.map.dto.RouteResponseDTO;

import java.util.List;

public interface MapsService {

    /**
     * Returns all nearby verified and available bikes.
     */
    List<NearbyBikeDTO> getNearbyBikes(double latitude, double longitude);

    /**
     * Returns location of a particular bike.
     */
    BikeLocationDTO getBikeLocation(Long bikeId);

    /**
     * Calculates distance between customer and bike.
     */
    DistanceResponseDTO calculateDistance(
            double customerLatitude,
            double customerLongitude,
            Long bikeId
    );

    /**
     * Returns navigation route information.
     */
    RouteResponseDTO getRoute(
            double customerLatitude,
            double customerLongitude,
            Long bikeId
    );
}