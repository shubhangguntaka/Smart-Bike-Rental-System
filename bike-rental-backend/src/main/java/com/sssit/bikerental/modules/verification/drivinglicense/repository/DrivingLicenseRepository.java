package com.sssit.bikerental.modules.verification.drivinglicense.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sssit.bikerental.modules.verification.drivinglicense.entity.DrivingLicense;

@Repository
public interface DrivingLicenseRepository extends JpaRepository<DrivingLicense, Long> {

    Optional<DrivingLicense> findByLicenseNumber(String licenseNumber);

    Optional<DrivingLicense> findByCustomerName(String customerName);

    boolean existsByLicenseNumber(String licenseNumber);

    // Used for the status-check endpoint: is this customer already
    // APPROVED for a Driving License, so the frontend can skip the
    // upload step on a repeat booking.
    Optional<DrivingLicense> findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(
            Long customerId, String status);

}