package com.sssit.bikerental.modules.bike.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.common.response.ApiResponse;
import com.sssit.bikerental.modules.bike.dto.ApprovedRcDTO;
import com.sssit.bikerental.modules.bike.dto.BikeDTO;
import com.sssit.bikerental.modules.bike.service.BikeService;
import com.sssit.bikerental.modules.verification.bikedocument.dto.BikeDocumentResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bikes")
@RequiredArgsConstructor
public class BikeController {

        private final BikeService bikeService;
        private final com.sssit.bikerental.modules.stream.service.SseService sseService;

    /** Public catalog — customers browse available bikes */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BikeDTO>>> getAllBikes() {
        return ResponseEntity.ok(
                ApiResponse.success("Bikes fetched successfully", bikeService.getAllBikes()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<BikeDTO>>> searchBikes(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String bikeStatus,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Search completed",
                        bikeService.searchBikes(location, brand, category, bikeStatus, minPrice, maxPrice)));
    }

    @GetMapping("/{bikeId}")
    public ResponseEntity<ApiResponse<BikeDTO>> getBikeById(@PathVariable Long bikeId) {
        return ResponseEntity.ok(
                ApiResponse.success("Bike fetched successfully", bikeService.getBikeById(bikeId)));
    }

    @GetMapping("/check-owner-verification")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'CUSTOMER', 'USER')")
    public ResponseEntity<ApiResponse<Boolean>> checkOwnerVerification(
            @RequestParam(required = false) Long ownerId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Owner verification status fetched",
                        bikeService.checkOwnerVerification(ownerId)));
    }

    /**
     * Same bike (RC already APPROVED for this owner) → skip re-upload.
     * New bike registration → verified=false → must upload RC.
     */
    @GetMapping("/check-rc-verification")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'CUSTOMER', 'USER')")
    public ResponseEntity<ApiResponse<ApprovedRcDTO>> checkApprovedRc(
            @RequestParam String registrationNumber) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "RC verification status fetched",
                        bikeService.checkApprovedRc(registrationNumber)));
    }

    /** Previously approved RCs for the logged-in owner (re-list picker). */
    @GetMapping("/approved-rcs")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'CUSTOMER', 'USER')")
    public ResponseEntity<ApiResponse<List<ApprovedRcDTO>>> getApprovedRcs() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Approved RCs fetched",
                        bikeService.getApprovedRcsForOwner()));
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'CUSTOMER', 'USER')")
    public ResponseEntity<ApiResponse<List<BikeDTO>>> getOwnerBikes(@PathVariable Long ownerId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Owner bikes fetched successfully",
                        bikeService.getOwnerBikes(ownerId)));
    }

    @PostMapping(value = "/verify-rc", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'CUSTOMER', 'USER')")
    public ResponseEntity<ApiResponse<BikeDocumentResponseDTO>> verifyBikeRC(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "ownerId", required = false) Long ownerId,
            @RequestParam(value = "bikeId", required = false) Long bikeId,
            @RequestParam(value = "registrationNumber", required = false) String registrationNumber) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "RC verification completed",
                        bikeService.verifyBikeRC(file, ownerId, bikeId, registrationNumber)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'CUSTOMER', 'USER')")
    public ResponseEntity<ApiResponse<BikeDTO>> addBike(@Valid @RequestBody BikeDTO bikeDTO) {
        BikeDTO saved = bikeService.addBike(bikeDTO);
                // Broadcast to SSE subscribers that a new bike was added
                try {
                        sseService.broadcast(saved);
                } catch (Exception e) {
                        // swallow - broadcasting should not break API
                }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bike registered successfully", saved));
    }

    @PutMapping("/{bikeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'CUSTOMER', 'USER')")
    public ResponseEntity<ApiResponse<BikeDTO>> updateBike(
            @PathVariable Long bikeId,
            @Valid @RequestBody BikeDTO bikeDTO) {

        BikeDTO updated = bikeService.updateBike(bikeId, bikeDTO);
        try {
            sseService.broadcast(updated);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(BikeController.class).warn("Failed to broadcast SSE update for bike {}: {}", bikeId, e.getMessage());
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bike updated successfully",
                        updated));
    }

    @DeleteMapping("/{bikeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'CUSTOMER', 'USER')")
    public ResponseEntity<ApiResponse<String>> deleteBike(@PathVariable Long bikeId) {
                bikeService.deleteBike(bikeId);
                try {
                        sseService.broadcast(java.util.Map.of("deletedBikeId", bikeId));
                } catch (Exception e) {
                        org.slf4j.LoggerFactory.getLogger(BikeController.class).warn("Failed to broadcast SSE delete for bike {}: {}", bikeId, e.getMessage());
                }
        return ResponseEntity.ok(
                ApiResponse.success("Bike deleted successfully.", "OK"));
    }
}
