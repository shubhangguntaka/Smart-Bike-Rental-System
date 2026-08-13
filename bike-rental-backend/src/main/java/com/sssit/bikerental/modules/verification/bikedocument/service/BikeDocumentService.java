package com.sssit.bikerental.modules.verification.bikedocument.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.bikedocument.dto.BikeDocumentResponseDTO;
import com.sssit.bikerental.modules.verification.bikedocument.entity.BikeDocument;

public interface BikeDocumentService {

    BikeDocumentResponseDTO verifyBikeDocument(MultipartFile file, Long ownerId, Long bikeId);

    BikeDocumentResponseDTO verifyBikeDocument(MultipartFile file, Long ownerId, Long bikeId, String registrationNumber);

    // Returns the existing APPROVED RC for this owner + bike, or null
    // if none exists yet. Used by the frontend to skip the upload form
    // when the owner re-adds/re-lists a bike already verified before.
    BikeDocument getApprovedDocument(Long ownerId, Long bikeId);

    BikeDocument save(BikeDocument bikeDocument);

    List<BikeDocument> getAll();

    BikeDocument getById(Long id);

    BikeDocument update(Long id, BikeDocument bikeDocument);

    void delete(Long id);

}
