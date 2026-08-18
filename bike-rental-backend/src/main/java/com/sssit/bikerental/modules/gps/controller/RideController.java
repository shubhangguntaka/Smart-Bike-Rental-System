package com.sssit.bikerental.modules.gps.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sssit.bikerental.modules.gps.dto.RideDTO;
import com.sssit.bikerental.modules.gps.service.RideService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @PostMapping("/start")
    public ResponseEntity<RideDTO> startRide(
            @RequestBody RideDTO rideDTO) {

        RideDTO ride = rideService.startRide(
                rideDTO.getBookingId(),
                rideDTO.getBikeId(),
                rideDTO.getCustomerId()
        );

        return ResponseEntity.ok(ride);
    }

    @GetMapping("/{rideId}")
    public ResponseEntity<RideDTO> getRide(
            @PathVariable Long rideId) {

        return ResponseEntity.ok(
                rideService.getRide(rideId)
        );
    }

    @PostMapping("/{rideId}/end")
    public ResponseEntity<RideDTO> endRide(
            @PathVariable Long rideId) {

        return ResponseEntity.ok(
                rideService.endRide(rideId)
        );
    }

    @GetMapping("/customer")
    public ResponseEntity<List<RideDTO>> getCustomerRides(
            @RequestParam Long customerId) {

        return ResponseEntity.ok(
                rideService.getCustomerRides(customerId)
        );
    }

    @GetMapping("/{rideId}/history")
    public ResponseEntity<RideDTO> getRideHistory(
            @PathVariable Long rideId) {

        return ResponseEntity.ok(
                rideService.getRideHistory(rideId)
        );
    }
}