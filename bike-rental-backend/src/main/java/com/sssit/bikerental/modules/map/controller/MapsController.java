package com.sssit.bikerental.modules.map.controller;

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
    public ResponseEntity<List<NearbyBikeDTO>> getNearbyBikes(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        return ResponseEntity.ok(
                mapsService.getNearbyBikes(latitude, longitude)
        );
    }

    /**
     * Get bike location
     */
    @GetMapping({"/bike/{bikeId}", "/bike-location/{bikeId}"})
    public ResponseEntity<BikeLocationDTO> getBikeLocation(
            @PathVariable Long bikeId) {

        return ResponseEntity.ok(
                mapsService.getBikeLocation(bikeId)
        );
    }

    /**
     * Calculate distance
     */
    @GetMapping({"/distance", "/calculate-distance"})
    public ResponseEntity<DistanceResponseDTO> calculateDistance(

            @RequestParam double customerLatitude,
            @RequestParam double customerLongitude,
            @RequestParam Long bikeId) {

        return ResponseEntity.ok(
                mapsService.calculateDistance(
                        customerLatitude,
                        customerLongitude,
                        bikeId
                )
        );
    }

    /**
     * Get route
     */
    @GetMapping("/route")
    public ResponseEntity<RouteResponseDTO> getRoute(

            @RequestParam double customerLatitude,
            @RequestParam double customerLongitude,
            @RequestParam Long bikeId) {

        return ResponseEntity.ok(
                mapsService.getRoute(
                        customerLatitude,
                        customerLongitude,
                        bikeId
                )
        );
    }

}