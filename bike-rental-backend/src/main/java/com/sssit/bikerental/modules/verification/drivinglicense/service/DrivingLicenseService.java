package com.sssit.bikerental.modules.verification.drivinglicense.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.drivinglicense.dto.DrivingLicenseResponseDTO;
import com.sssit.bikerental.modules.verification.drivinglicense.entity.DrivingLicense;

public interface DrivingLicenseService {

    DrivingLicenseResponseDTO verifyDrivingLicense(MultipartFile file, Long customerId);

    // Returns the existing APPROVED Driving License for this customer,
    // or null if none exists yet. Used by the frontend to skip the
    // upload form on a repeat booking.
    DrivingLicense getApprovedLicense(Long customerId);

    DrivingLicense save(DrivingLicense drivingLicense);

    List<DrivingLicense> getAll();

    DrivingLicense getById(Long id);

    DrivingLicense update(Long id, DrivingLicense drivingLicense);

    void delete(Long id);

}