package com.sssit.bikerental.modules.verification.drivinglicense.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.drivinglicense.dto.DrivingLicenseResponseDTO;
import com.sssit.bikerental.modules.verification.drivinglicense.entity.DrivingLicense;
import com.sssit.bikerental.modules.verification.drivinglicense.service.DrivingLicenseService;

@RestController
@RequestMapping("/api/driving-license")
@CrossOrigin(origins = "*")
public class DrivingLicenseController {

    @Autowired
    private DrivingLicenseService service;

    //-----------------------------------
    // Upload + OCR/QR verify a Driving License image
    //-----------------------------------

    @PostMapping(
            value = "/verify",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public DrivingLicenseResponseDTO verify(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "customerId", required = false) Long customerId) {
        return service.verifyDrivingLicense(file, customerId);
    }

    //-----------------------------------
    // Status check - call this BEFORE showing the upload form. If it
    // returns a record, this customer is already DL-verified and the
    // frontend should skip straight to booking. Returns 204 No
    // Content if nothing is verified yet.
    //-----------------------------------

    @GetMapping("/status")
    public ResponseEntity<DrivingLicense> getStatus(
            @RequestParam("customerId") Long customerId) {

        DrivingLicense result = service.getApprovedLicense(customerId);

        return result != null
                ? ResponseEntity.ok(result)
                : ResponseEntity.noContent().build();
    }

    @PostMapping
    public DrivingLicense save(@RequestBody DrivingLicense drivingLicense) {
        return service.save(drivingLicense);
    }

    @GetMapping
    public List<DrivingLicense> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public DrivingLicense getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public DrivingLicense update(@PathVariable Long id,
                                 @RequestBody DrivingLicense drivingLicense) {
        return service.update(id, drivingLicense);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Driving License Deleted Successfully";
    }

}