package com.sssit.bikerental.modules.verification.admin.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.drivinglicense.entity.DrivingLicense;
import com.sssit.bikerental.modules.verification.drivinglicense.repository.DrivingLicenseRepository;

/**
 * Lets an admin browse uploaded Aadhaar/DL records and view the
 * actual document image behind each one.
 *
 * IMPORTANT - this project has no authentication/authorization layer
 * at all yet (no login, no roles, and every other controller here is
 * @CrossOrigin("*")). "Admin" is therefore just a URL path, not an
 * enforced permission - anyone who can reach the API can hit these
 * endpoints and view anyone's uploaded ID photos. Before this goes
 * anywhere near production, these endpoints need to sit behind real
 * admin-only auth (e.g. Spring Security with a role check), since
 * they serve sensitive PII (photo, ID number, address).
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminDocumentController {

    private final AadhaarRepository aadhaarRepository;
    private final DrivingLicenseRepository drivingLicenseRepository;

    public AdminDocumentController(
            AadhaarRepository aadhaarRepository,
            DrivingLicenseRepository drivingLicenseRepository) {

        this.aadhaarRepository = aadhaarRepository;
        this.drivingLicenseRepository = drivingLicenseRepository;
    }

    //-----------------------------------
    // Listing - so an admin can browse without needing to already
    // know an id. Returns the full stored record (same shape the
    // verify endpoints return), which already includes documentPath.
    //-----------------------------------

    @GetMapping("/aadhaar")
    public List<AadhaarVerification> listAadhaar() {
        return aadhaarRepository.findAll();
    }

    @GetMapping("/driving-license")
    public List<DrivingLicense> listDrivingLicenses() {
        return drivingLicenseRepository.findAll();
    }

    //-----------------------------------
    // Image serving
    //-----------------------------------

    @GetMapping("/aadhaar/{id}/image")
    public ResponseEntity<byte[]> getAadhaarImage(@PathVariable Long id) {

        return aadhaarRepository.findById(id)
                .map(AadhaarVerification::getDocumentPath)
                .map(this::readImage)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/driving-license/{id}/image")
    public ResponseEntity<byte[]> getDrivingLicenseImage(@PathVariable Long id) {

        return drivingLicenseRepository.findById(id)
                .map(DrivingLicense::getDocumentPath)
                .map(this::readImage)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //-----------------------------------
    // Helper: read the stored file off disk and return it with the
    // right content type. Covers records that predate this feature
    // (documentPath null) or whose file went missing on disk, by
    // returning 404 instead of a 500.
    //-----------------------------------

    private ResponseEntity<byte[]> readImage(String documentPath) {

        if (documentPath == null || documentPath.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        Path path = Paths.get(documentPath);

        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] bytes = Files.readAllBytes(path);

            return ResponseEntity.ok()
                    .contentType(guessContentType(documentPath))
                    .header(HttpHeaders.CACHE_CONTROL, "no-store")
                    .body(bytes);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private MediaType guessContentType(String path) {

        String lower = path.toLowerCase();

        if (lower.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        }
        if (lower.endsWith(".webp")) {
            return MediaType.valueOf("image/webp");
        }

        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
