package com.sssit.bikerental.modules.bike.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.bike.dto.ApprovedRcDTO;
import com.sssit.bikerental.modules.bike.dto.BikeDTO;
import com.sssit.bikerental.modules.verification.bikedocument.dto.BikeDocumentResponseDTO;

public interface BikeService {

    BikeDTO addBike(BikeDTO bikeDTO);

    BikeDTO updateBike(Long bikeId, BikeDTO bikeDTO);

    void deleteBike(Long bikeId);

    BikeDTO getBikeById(Long bikeId);

    List<BikeDTO> getAllBikes();

    List<BikeDTO> getOwnerBikes(Long ownerId);

    boolean checkOwnerVerification(Long ownerId);

    /**
     * Same bike (already APPROVED RC for this owner) → verified=true, skip re-upload.
     * New registration → verified=false, owner must upload RC.
     */
    ApprovedRcDTO checkApprovedRc(String registrationNumber);

    /** Owner's previously approved RCs (re-list picker). */
    List<ApprovedRcDTO> getApprovedRcsForOwner();

    BikeDocumentResponseDTO verifyBikeRC(MultipartFile file, Long ownerId, Long bikeId);

    BikeDocumentResponseDTO verifyBikeRC(MultipartFile file, Long ownerId, Long bikeId, String registrationNumber);

    List<BikeDTO> searchBikes(String location, String brand, String bikeStatus);

    List<BikeDTO> searchBikes(String location, String brand, String category, String bikeStatus, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
}
