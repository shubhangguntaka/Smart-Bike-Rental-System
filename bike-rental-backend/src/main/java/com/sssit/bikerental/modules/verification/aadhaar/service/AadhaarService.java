package com.sssit.bikerental.modules.verification.aadhaar.service;

import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;

public interface AadhaarService {

    // Backward-compatible overload - defaults to the "USER" purpose.
    AadhaarVerification verifyAadhaar(MultipartFile file, Long customerId);

    // purpose: which role this verification is for - "USER" or
    // "BIKE_OWNER" (see VerificationConstants). Lets the same,
    // already-approved Aadhaar be reused once for a second role
    // without being treated as a plain duplicate re-upload.
    AadhaarVerification verifyAadhaar(MultipartFile file, Long customerId, String purpose);

    // Returns the existing APPROVED Aadhaar record for this customer +
    // purpose, or null if none exists yet. Used by the frontend to
    // check status before showing the upload form, so a returning
    // customer is never asked to re-upload Aadhaar they've already
    // verified.
    AadhaarVerification getApprovedAadhaar(Long customerId, String purpose);

}