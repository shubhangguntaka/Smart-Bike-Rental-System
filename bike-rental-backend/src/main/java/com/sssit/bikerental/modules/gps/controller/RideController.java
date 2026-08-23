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
import com.sssit.bikerental.modules.gps.service.GPSService;
import com.sssit.bikerental.modules.gps.service.RideService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;
    private final GPSService gpsService;

    @PostMapping("/start")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RideDTO> startRide(
            @Valid @RequestBody RideDTO rideDTO) {

        RideDTO ride = rideService.startRide(
                rideDTO.getBookingId(),
                rideDTO.getBikeId(),
                rideDTO.getCustomerId()
        );

        return ResponseEntity.ok(ride);
    }

    @GetMapping("/{rideId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public ResponseEntity<RideDTO> getRide(
            @PathVariable Long rideId) {

        return ResponseEntity.ok(
                rideService.getRide(rideId)
        );
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public ResponseEntity<RideDTO> getRideByBookingId(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                rideService.getRideByBookingId(bookingId)
        );
    }

    @PostMapping("/{rideId}/end")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RideDTO> endRide(
            @PathVariable Long rideId) {

        return ResponseEntity.ok(
                rideService.endRide(rideId)
        );
    }

    @PostMapping("/{rideId}/pause")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RideDTO> pauseRide(
            @PathVariable Long rideId) {

        return ResponseEntity.ok(
                rideService.pauseRide(rideId)
        );
    }

    @PostMapping("/{rideId}/resume")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RideDTO> resumeRide(
            @PathVariable Long rideId) {

        return ResponseEntity.ok(
                rideService.resumeRide(rideId)
        );
    }

    @GetMapping("/customer")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<RideDTO>> getCustomerRides(
            @RequestParam Long customerId) {

        return ResponseEntity.ok(
                rideService.getCustomerRides(customerId)
        );
    }

   @GetMapping("/{rideId}/history")
@PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public ResponseEntity<RideDTO> getRideHistory(
            @PathVariable Long rideId) {

        return ResponseEntity.ok(
                rideService.getRideHistory(rideId)
        );
    }

    @GetMapping("/{rideId}/distance")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
public ResponseEntity<Double> calculateDistance(
        @PathVariable Long rideId) {

    double distance = gpsService.calculateDistance(rideId);

    return ResponseEntity.ok(distance);
}
}