package com.sssit.bikerental.modules.map.controller;

import com.sssit.bikerental.common.response.ApiResponse;
import com.sssit.bikerental.modules.map.dto.BikeLocationDTO;
import com.sssit.bikerental.modules.map.dto.DistanceResponseDTO;
import com.sssit.bikerental.modules.map.dto.NearbyBikeDTO;
import com.sssit.bikerental.modules.map.dto.RouteResponseDTO;
import com.sssit.bikerental.modules.map.service.MapsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maps")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MapsController {

    private final MapsService mapsService;

    /**
     * Get all nearby bikes
     */
    @GetMapping("/nearby-bikes")
    public ResponseEntity<ApiResponse<List<NearbyBikeDTO>>> getNearbyBikes(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        List<NearbyBikeDTO> nearbyBikes = mapsService.getNearbyBikes(latitude, longitude);
        return ResponseEntity.ok(
                ApiResponse.success("Nearby bikes fetched successfully", nearbyBikes)
        );
    }

    /**
     * Get bike location
     */
    @GetMapping({"/bike/{bikeId}", "/bike-location/{bikeId}"})
    public ResponseEntity<ApiResponse<BikeLocationDTO>> getBikeLocation(
            @PathVariable Long bikeId) {

        BikeLocationDTO location = mapsService.getBikeLocation(bikeId);
        return ResponseEntity.ok(
                ApiResponse.success("Bike location fetched successfully", location)
        );
    }

    /**
     * Calculate distance
     */
    @GetMapping({"/distance", "/calculate-distance"})
    public ResponseEntity<ApiResponse<DistanceResponseDTO>> calculateDistance(
            @RequestParam double customerLatitude,
            @RequestParam double customerLongitude,
            @RequestParam Long bikeId) {

        DistanceResponseDTO distance = mapsService.calculateDistance(
                customerLatitude,
                customerLongitude,
                bikeId
        );
        return ResponseEntity.ok(
                ApiResponse.success("Distance calculated successfully", distance)
        );
    }

    /**
     * Get route
     */
    @GetMapping("/route")
    public ResponseEntity<ApiResponse<RouteResponseDTO>> getRoute(
            @RequestParam double customerLatitude,
            @RequestParam double customerLongitude,
            @RequestParam Long bikeId) {

        RouteResponseDTO route = mapsService.getRoute(
                customerLatitude,
                customerLongitude,
                bikeId
        );
        return ResponseEntity.ok(
                ApiResponse.success("Route fetched successfully", route)
        );
    }
}