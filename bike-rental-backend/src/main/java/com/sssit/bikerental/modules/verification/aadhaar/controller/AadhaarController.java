package com.sssit.bikerental.modules.verification.aadhaar.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;
import com.sssit.bikerental.modules.verification.aadhaar.service.AadhaarService;

import org.springframework.security.access.prepost.PreAuthorize;
import com.sssit.bikerental.common.security.SecurityUtils;

@RestController
@RequestMapping("/api/aadhaar")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
public class AadhaarController {

    private final AadhaarService aadhaarService;

    public AadhaarController(AadhaarService aadhaarService) {
        this.aadhaarService = aadhaarService;
    }

    //-----------------------------------
    // Upload an Aadhaar image - everything (Aadhaar number, name,
    // etc.) is read straight off the document via OCR/QR. No manual
    // entry required.
    //
    // purpose: pass "BIKE_OWNER" when this upload is for registering
    // as a bike owner (as opposed to the default "USER"/renter
    // verification) - this lets a customer legitimately re-verify
    // their own already-approved Aadhaar for that second role. Send
    // this as a query/form param, e.g. /api/aadhaar/verify?purpose=BIKE_OWNER
    //-----------------------------------

    @PostMapping(
            value = "/verify",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public AadhaarVerification verifyAadhaar(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "customerId", required = false) Long customerId,
            @RequestParam(value = "purpose", required = false) String purpose) {

        Long resolvedCustomerId = SecurityUtils.getCurrentUserId();
        if (resolvedCustomerId == null) {
            resolvedCustomerId = customerId;
        }
        return aadhaarService.verifyAadhaar(file, resolvedCustomerId, purpose);
    }

    //-----------------------------------
    // Status check - call this BEFORE showing the upload form. If it
    // returns a record, this customer is already verified for the
    // given purpose and the frontend should skip straight past the
    // Aadhaar step. Returns 204 No Content (empty body) if nothing is
    // verified yet, so the frontend shows the upload form as normal.
    //-----------------------------------

    @GetMapping("/status")
    public ResponseEntity<AadhaarVerification> getStatus(
            @RequestParam(value = "customerId", required = false) Long customerId,
            @RequestParam(value = "purpose", required = false) String purpose) {

        Long resolvedCustomerId = SecurityUtils.getCurrentUserId();
        if (resolvedCustomerId == null) {
            resolvedCustomerId = customerId;
        }
        AadhaarVerification result = aadhaarService.getApprovedAadhaar(resolvedCustomerId, purpose);

        return result != null
                ? ResponseEntity.ok(result)
                : ResponseEntity.noContent().build();
    }

}