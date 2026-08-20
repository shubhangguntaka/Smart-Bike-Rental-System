package com.sssit.bikerental.modules.gps.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sssit.bikerental.modules.gps.dto.GPSLocationDTO;
import com.sssit.bikerental.modules.gps.service.GPSService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class GPSController {

    private final GPSService gpsService;

    @PostMapping("/{rideId}/location")
@PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<GPSLocationDTO> saveLocation(
            @PathVariable Long rideId,
            @Valid @RequestBody GPSLocationDTO locationDTO) {

        GPSLocationDTO savedLocation =
                gpsService.saveLocation(rideId, locationDTO);

        return ResponseEntity.ok(savedLocation);
    }

    @GetMapping("/{rideId}/location")
@PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public ResponseEntity<List<GPSLocationDTO>> getLocations(
            @PathVariable Long rideId) {

        return ResponseEntity.ok(
                gpsService.getLocations(rideId)
        );
    }
}