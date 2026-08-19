package com.sssit.bikerental.modules.verification.admin.controller;

import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.admin.dto.*;
import com.sssit.bikerental.modules.verification.admin.service.AdminDocumentService;
import com.sssit.bikerental.modules.verification.drivinglicense.entity.DrivingLicense;
import com.sssit.bikerental.modules.verification.drivinglicense.repository.DrivingLicenseRepository;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminDocumentController {

    private final AdminDocumentService adminDocumentService;
    private final AadhaarRepository aadhaarRepository;
    private final DrivingLicenseRepository drivingLicenseRepository;

    public AdminDocumentController(
            AdminDocumentService adminDocumentService,
            AadhaarRepository aadhaarRepository,
            DrivingLicenseRepository drivingLicenseRepository) {
        this.adminDocumentService = adminDocumentService;
        this.aadhaarRepository = aadhaarRepository;
        this.drivingLicenseRepository = drivingLicenseRepository;
    }

    // =========================================================================
    // MEMBER 5 CENTRALIZED VERIFICATION ENDPOINTS
    // =========================================================================

    @GetMapping("/verifications")
    public ResponseEntity<List<AdminVerificationDTO>> getAllVerifications(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String documentType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        
        List<AdminVerificationDTO> list = adminDocumentService.getAllVerifications(role, documentType, status, search);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/verifications/{id}")
    public ResponseEntity<AdminVerificationDTO> getVerificationById(@PathVariable Long id) {
        return ResponseEntity.ok(adminDocumentService.getVerificationById(id));
    }

    @GetMapping("/verifications/{id}/image")
    public ResponseEntity<byte[]> getVerificationImage(@PathVariable Long id) {
        byte[] bytes = adminDocumentService.getDocumentImage(id);
        if (bytes == null || bytes.length == 0) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = adminDocumentService.getDocumentImageContentType(id);
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(bytes);
    }

    @PostMapping("/verifications/{id}/approve")
    public ResponseEntity<AdminVerificationDTO> approveVerification(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewDecisionRequest request,
            Authentication authentication) {
        
        String reviewer = authentication != null ? authentication.getName() : "Admin";
        AdminVerificationDTO result = adminDocumentService.approveVerification(id, request, reviewer);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verifications/{id}/reject")
    public ResponseEntity<AdminVerificationDTO> rejectVerification(
            @PathVariable Long id,
            @RequestBody ReviewDecisionRequest request,
            Authentication authentication) {
        
        String reviewer = authentication != null ? authentication.getName() : "Admin";
        AdminVerificationDTO result = adminDocumentService.rejectVerification(id, request, reviewer);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verifications/{id}/reupload")
    public ResponseEntity<AdminVerificationDTO> requestReupload(
            @PathVariable Long id,
            @RequestBody ReviewDecisionRequest request,
            Authentication authentication) {
        
        String reviewer = authentication != null ? authentication.getName() : "Admin";
        AdminVerificationDTO result = adminDocumentService.requestReupload(id, request, reviewer);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/verifications/{id}/history")
    public ResponseEntity<List<VerificationHistoryDTO>> getVerificationHistory(@PathVariable Long id) {
        return ResponseEntity.ok(adminDocumentService.getVerificationHistory(id));
    }

    @PostMapping("/verifications/{id}/email")
    public ResponseEntity<String> sendAdminEmail(
            @PathVariable Long id,
            @RequestBody AdminEmailRequest request,
            Authentication authentication) {
        
        String sender = authentication != null ? authentication.getName() : "Admin";
        adminDocumentService.sendEmail(id, request, sender);
        return ResponseEntity.ok("Email sent successfully.");
    }

    // =========================================================================
    // LEGACY BACKWARD-COMPATIBLE ENDPOINTS
    // =========================================================================

    @GetMapping("/aadhaar")
    public List<AadhaarVerification> listAadhaar() {
        return aadhaarRepository.findAll();
    }

    @GetMapping("/driving-license")
    public List<DrivingLicense> listDrivingLicenses() {
        return drivingLicenseRepository.findAll();
    }

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
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (lower.endsWith(".webp")) return MediaType.valueOf("image/webp");
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
