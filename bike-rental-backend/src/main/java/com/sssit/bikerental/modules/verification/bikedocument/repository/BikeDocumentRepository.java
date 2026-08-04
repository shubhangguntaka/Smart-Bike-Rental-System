package com.sssit.bikerental.modules.verification.bikedocument.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sssit.bikerental.modules.verification.bikedocument.entity.BikeDocument;

@Repository
public interface BikeDocumentRepository extends JpaRepository<BikeDocument, Long> {

    Optional<BikeDocument> findByRegistrationNumber(String registrationNumber);

    List<BikeDocument> findByOwnerId(Long ownerId);

    List<BikeDocument> findByOwnerName(String ownerName);

    boolean existsByRegistrationNumber(String registrationNumber);

    // Used for the status-check endpoint: is THIS specific bike
    // already APPROVED, so the frontend can skip the upload step when
    // the owner re-adds/re-lists the same bike.
    Optional<BikeDocument> findFirstByOwnerIdAndBikeIdAndStatusOrderByVerifiedAtDesc(
            Long ownerId, Long bikeId, String status);

}
