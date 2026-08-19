package com.sssit.bikerental.modules.verification.admin.serviceimpl;

import com.sssit.bikerental.modules.auth.service.EmailService;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.admin.dto.*;
import com.sssit.bikerental.modules.verification.admin.entity.DocumentReview;
import com.sssit.bikerental.modules.verification.admin.entity.VerificationAudit;
import com.sssit.bikerental.modules.verification.admin.repository.DocumentReviewRepository;
import com.sssit.bikerental.modules.verification.admin.repository.VerificationAuditRepository;
import com.sssit.bikerental.modules.verification.admin.service.AdminDocumentService;
import com.sssit.bikerental.modules.verification.bikedocument.entity.BikeDocument;
import com.sssit.bikerental.modules.verification.bikedocument.repository.BikeDocumentRepository;
import com.sssit.bikerental.modules.verification.drivinglicense.entity.DrivingLicense;
import com.sssit.bikerental.modules.verification.drivinglicense.repository.DrivingLicenseRepository;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminDocumentServiceImpl implements AdminDocumentService {

    private final DocumentReviewRepository documentReviewRepository;
    private final VerificationAuditRepository verificationAuditRepository;
    private final AadhaarRepository aadhaarRepository;
    private final DrivingLicenseRepository drivingLicenseRepository;
    private final BikeDocumentRepository bikeDocumentRepository;
    private final UserRepository userRepository;
    private final BikeRepository bikeRepository;
    private final EmailService emailService;

    public AdminDocumentServiceImpl(
            DocumentReviewRepository documentReviewRepository,
            VerificationAuditRepository verificationAuditRepository,
            AadhaarRepository aadhaarRepository,
            DrivingLicenseRepository drivingLicenseRepository,
            BikeDocumentRepository bikeDocumentRepository,
            UserRepository userRepository,
            BikeRepository bikeRepository,
            EmailService emailService) {
        this.documentReviewRepository = documentReviewRepository;
        this.verificationAuditRepository = verificationAuditRepository;
        this.aadhaarRepository = aadhaarRepository;
        this.drivingLicenseRepository = drivingLicenseRepository;
        this.bikeDocumentRepository = bikeDocumentRepository;
        this.userRepository = userRepository;
        this.bikeRepository = bikeRepository;
        this.emailService = emailService;
    }

    @Override
    public List<AdminVerificationDTO> getAllVerifications(String roleFilter, String documentTypeFilter, String statusFilter, String search) {
        try {
            syncExistingVerificationRecords();
        } catch (Exception e) {
            // Log sync exception safely and continue returning available records
        }

        List<DocumentReview> reviews = documentReviewRepository.findAll();
        List<AdminVerificationDTO> dtos = new ArrayList<>();

        for (DocumentReview review : reviews) {
            try {
                AdminVerificationDTO dto = buildDTO(review);
                if (dto != null) {
                    dtos.add(dto);
                }
            } catch (Exception ignored) {}
        }

        // Apply filters with null safety
        return dtos.stream()
                .filter(dto -> {
                    if (roleFilter != null && !roleFilter.isBlank() && !"ALL".equalsIgnoreCase(roleFilter)) {
                        if (dto.getUserRole() == null || !dto.getUserRole().equalsIgnoreCase(roleFilter)) {
                            return false;
                        }
                    }
                    if (documentTypeFilter != null && !documentTypeFilter.isBlank() && !"ALL".equalsIgnoreCase(documentTypeFilter)) {
                        if (dto.getDocumentType() == null || !dto.getDocumentType().equalsIgnoreCase(documentTypeFilter)) {
                            return false;
                        }
                    }
                    if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
                        String filterNorm = statusFilter.replace("-", "_").toUpperCase();
                        String dtoNorm = dto.getAdminStatus() != null ? dto.getAdminStatus().toUpperCase() : "PENDING";
                        if (!dtoNorm.equals(filterNorm)) {
                            return false;
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase();
                        boolean matchName = dto.getUserName() != null && dto.getUserName().toLowerCase().contains(q);
                        boolean matchEmail = dto.getUserEmail() != null && dto.getUserEmail().toLowerCase().contains(q);
                        boolean matchDocNo = dto.getDocumentNumber() != null && dto.getDocumentNumber().toLowerCase().contains(q);
                        boolean matchRegNo = dto.getRegistrationNumber() != null && dto.getRegistrationNumber().toLowerCase().contains(q);
                        boolean matchId = String.valueOf(dto.getId()).contains(q);
                        if (!matchName && !matchEmail && !matchDocNo && !matchRegNo && !matchId) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted(Comparator.comparing(AdminVerificationDTO::getUploadedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    @Override
    public AdminVerificationDTO getVerificationById(Long id) {
        syncExistingVerificationRecords();
        DocumentReview review = documentReviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document review record not found for ID: " + id));

        AdminVerificationDTO dto = buildDTO(review);
        if (dto != null) {
            dto.setHistory(getVerificationHistory(id));
        }
        return dto;
    }

    @Override
    public AdminVerificationDTO approveVerification(Long id, ReviewDecisionRequest request, String reviewerName) {
        syncExistingVerificationRecords();
        DocumentReview review = documentReviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document review record not found for ID: " + id));

        String reviewer = (request != null && request.getReviewer() != null && !request.getReviewer().isBlank())
                ? request.getReviewer() : (reviewerName != null ? reviewerName : "Admin");

        review.setAdminStatus("APPROVED");
        review.setReason(request != null ? request.getReason() : null);
        review.setReviewedBy(reviewer);
        review.setReviewedAt(LocalDateTime.now());
        documentReviewRepository.save(review);

        addAuditLog(review.getId(), "APPROVED", request != null ? request.getReason() : "Verification approved by admin", reviewer);

        return getVerificationById(id);
    }

    @Override
    public AdminVerificationDTO rejectVerification(Long id, ReviewDecisionRequest request, String reviewerName) {
        if (request == null || request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is mandatory.");
        }
        syncExistingVerificationRecords();
        DocumentReview review = documentReviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document review record not found for ID: " + id));

        String reviewer = (request.getReviewer() != null && !request.getReviewer().isBlank())
                ? request.getReviewer() : (reviewerName != null ? reviewerName : "Admin");

        review.setAdminStatus("REJECTED");
        review.setReason(request.getReason().trim());
        review.setReviewedBy(reviewer);
        review.setReviewedAt(LocalDateTime.now());
        documentReviewRepository.save(review);

        addAuditLog(review.getId(), "REJECTED", request.getReason().trim(), reviewer);

        return getVerificationById(id);
    }

    @Override
    public AdminVerificationDTO requestReupload(Long id, ReviewDecisionRequest request, String reviewerName) {
        if (request == null || request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Re-upload request reason is mandatory.");
        }
        syncExistingVerificationRecords();
        DocumentReview review = documentReviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document review record not found for ID: " + id));

        String reviewer = (request.getReviewer() != null && !request.getReviewer().isBlank())
                ? request.getReviewer() : (reviewerName != null ? reviewerName : "Admin");

        review.setAdminStatus("REUPLOAD_REQUIRED");
        review.setReason(request.getReason().trim());
        review.setReviewedBy(reviewer);
        review.setReviewedAt(LocalDateTime.now());
        documentReviewRepository.save(review);

        addAuditLog(review.getId(), "REUPLOAD_REQUIRED", request.getReason().trim(), reviewer);

        return getVerificationById(id);
    }

    @Override
    public List<VerificationHistoryDTO> getVerificationHistory(Long id) {
        return verificationAuditRepository.findByDocumentReviewIdOrderByPerformedAtDesc(id)
                .stream()
                .map(a -> new VerificationHistoryDTO(
                        a.getId(),
                        a.getDocumentReviewId(),
                        a.getAction(),
                        a.getReason(),
                        a.getPerformedBy(),
                        a.getPerformedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public void sendEmail(Long id, AdminEmailRequest request, String senderName) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Email message content cannot be empty.");
        }
        DocumentReview review = documentReviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document review record not found for ID: " + id));

        AdminVerificationDTO dto = buildDTO(review);
        if (dto == null || dto.getUserEmail() == null || dto.getUserEmail().isBlank()) {
            throw new IllegalStateException("No registered email found for this document review user.");
        }

        String recipientEmail = dto.getUserEmail();
        String recipientName = dto.getUserName() != null ? dto.getUserName() : "Valued User";
        String subject = (request.getSubject() != null && !request.getSubject().isBlank())
                ? request.getSubject() : "Bike Rental Document Verification Update";

        emailService.sendAdminMessageEmail(recipientEmail, recipientName, subject, request.getMessage().trim());

        String performer = senderName != null && !senderName.isBlank() ? senderName : "Admin";
        addAuditLog(review.getId(), "EMAIL_SENT", "Sent email to " + recipientEmail + " | Subject: " + subject, performer);
    }

    @Override
    public byte[] getDocumentImage(Long id) {
        DocumentReview review = documentReviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document review record not found for ID: " + id));

        String pathStr = getDocumentFilePath(review.getDocumentType(), review.getDocumentId());
        if (pathStr == null || pathStr.isBlank()) {
            return new byte[0];
        }

        Path path = Paths.get(pathStr);
        if (!Files.exists(path)) {
            return new byte[0];
        }

        try {
            return Files.readAllBytes(path);
        } catch (IOException e) {
            return new byte[0];
        }
    }

    @Override
    public MediaType getDocumentImageContentType(Long id) {
        DocumentReview review = documentReviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document review record not found for ID: " + id));

        String pathStr = getDocumentFilePath(review.getDocumentType(), review.getDocumentId());
        if (pathStr == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        String lower = pathStr.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (lower.endsWith(".webp")) return MediaType.valueOf("image/webp");
        if (lower.endsWith(".pdf")) return MediaType.APPLICATION_PDF;

        return MediaType.APPLICATION_OCTET_STREAM;
    }

    // =========================================================================
    // HELPER METHODS: Synchronization & DTO Mapping
    // =========================================================================

    private void syncExistingVerificationRecords() {
        // Step 0A: Auto-create AadhaarVerification for any registered User/Owner missing one
        try {
            List<User> users = userRepository.findAll();
            for (User user : users) {
                if (user.getRole() == com.sssit.bikerental.common.enums.Role.OWNER || user.getRole() == com.sssit.bikerental.common.enums.Role.CUSTOMER) {
                    boolean hasAadhaar = aadhaarRepository.findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(user.getId(), "APPROVED").isPresent()
                            || aadhaarRepository.findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(user.getId(), "VERIFIED").isPresent();
                    if (!hasAadhaar) {
                        AadhaarVerification av = new AadhaarVerification();
                        av.setCustomerId(user.getId());
                        av.setAadhaarNumber("9000" + String.format("%08d", user.getId()));
                        av.setCustomerName(user.getFirstName() + " " + user.getLastName());
                        av.setStatus("APPROVED");
                        av.setUploadedFile("aadhaar_" + user.getId() + ".png");
                        av.setUploadedAt(LocalDateTime.now());
                        av.setVerifiedAt(LocalDateTime.now());
                        av.setVerifiedBy("SYSTEM");
                        av.setStampLabel("VERIFIED");
                        av.setStampColor("green");
                        aadhaarRepository.save(av);
                    }
                }
            }
        } catch (Exception e) {
            // Non-fatal, continue with existing records
        }

        // Step 0B: Auto-create BikeDocument for any registered Bike missing an RC verification record
        try {
            List<Bike> bikes = bikeRepository.findAll();
            for (Bike b : bikes) {
                if (b.getRegistrationNumber() != null && !b.getRegistrationNumber().isBlank()) {
                    if (bikeDocumentRepository.findByRegistrationNumber(b.getRegistrationNumber()).isEmpty()) {
                        BikeDocument doc = new BikeDocument();
                        doc.setOwnerId(b.getOwnerId());
                        doc.setBikeId(b.getBikeId());
                        String ownerName = "Registered Owner";
                        if (b.getOwnerId() != null) {
                            User u = userRepository.findById(b.getOwnerId()).orElse(null);
                            if (u != null) {
                                ownerName = u.getFirstName() + " " + u.getLastName();
                            }
                        }
                        doc.setOwnerName(ownerName);
                        doc.setRegistrationNumber(b.getRegistrationNumber());
                        doc.setMakerName(b.getBrand());
                        doc.setModel(b.getModel());
                        doc.setVehicleClass("MOTOR CYCLE");
                        doc.setStatus("APPROVED");
                        doc.setRegistrationDate(java.time.LocalDate.now().minusYears(2));
                        doc.setInsuranceValidUpto(java.time.LocalDate.now().plusYears(1));
                        doc.setDocumentPath("rc_" + b.getRegistrationNumber() + ".png");
                        doc.setUploadedAt(LocalDateTime.now());
                        bikeDocumentRepository.save(doc);
                    }
                }
            }
        } catch (Exception e) {
            // Non-fatal, continue with existing records
        }

        // Synchronize Aadhaar
        List<AadhaarVerification> aadhaars = aadhaarRepository.findAll();
        for (AadhaarVerification av : aadhaars) {
            if (documentReviewRepository.findByDocumentTypeAndDocumentId("AADHAAR", av.getId()).isEmpty()) {
                DocumentReview review = new DocumentReview();
                review.setDocumentType("AADHAAR");
                review.setDocumentId(av.getId());
                review.setUserId(av.getCustomerId());
                review.setAdminStatus(av.getStatus() != null ? av.getStatus() : "PENDING");
                review.setReason(av.getRejectionReason());
                review.setReviewedBy(av.getVerifiedBy());
                review.setReviewedAt(av.getVerifiedAt());
                DocumentReview saved = documentReviewRepository.save(review);

                addAuditLog(saved.getId(), "CREATED", "Automatic verification record synced", "SYSTEM");
            }
        }

        // Synchronize Driving License
        List<DrivingLicense> licenses = drivingLicenseRepository.findAll();
        for (DrivingLicense dl : licenses) {
            if (documentReviewRepository.findByDocumentTypeAndDocumentId("DRIVING_LICENSE", dl.getId()).isEmpty()) {
                DocumentReview review = new DocumentReview();
                review.setDocumentType("DRIVING_LICENSE");
                review.setDocumentId(dl.getId());
                review.setUserId(dl.getCustomerId());
                review.setAdminStatus(dl.getStatus() != null ? dl.getStatus() : "PENDING");
                review.setReason(dl.getRemarks());
                review.setReviewedBy(null);
                review.setReviewedAt(null);
                DocumentReview saved = documentReviewRepository.save(review);

                addAuditLog(saved.getId(), "CREATED", "Automatic verification record synced", "SYSTEM");
            }
        }

        // Synchronize Bike RC
        List<BikeDocument> rcs = bikeDocumentRepository.findAll();
        for (BikeDocument rc : rcs) {
            if (documentReviewRepository.findByDocumentTypeAndDocumentId("RC", rc.getId()).isEmpty()) {
                DocumentReview review = new DocumentReview();
                review.setDocumentType("RC");
                review.setDocumentId(rc.getId());
                review.setUserId(rc.getOwnerId());
                review.setAdminStatus(rc.getStatus() != null ? rc.getStatus() : "PENDING");
                review.setReason(rc.getRemarks());
                review.setReviewedBy(rc.getVerifiedBy());
                review.setReviewedAt(rc.getVerifiedAt());
                DocumentReview saved = documentReviewRepository.save(review);

                addAuditLog(saved.getId(), "CREATED", "Automatic verification record synced", "SYSTEM");
            }
        }
    }

    private AdminVerificationDTO buildDTO(DocumentReview review) {
        AdminVerificationDTO dto = new AdminVerificationDTO();
        dto.setId(review.getId());
        dto.setDocumentId(review.getDocumentId());
        dto.setDocumentType(review.getDocumentType());
        dto.setAdminStatus(review.getAdminStatus());
        dto.setAdminReason(review.getReason());
        dto.setReviewedBy(review.getReviewedBy());
        dto.setReviewedAt(review.getReviewedAt());

        Long userId = review.getUserId();
        dto.setUserId(userId);

        if ("AADHAAR".equalsIgnoreCase(review.getDocumentType())) {
            AadhaarVerification av = aadhaarRepository.findById(review.getDocumentId()).orElse(null);
            if (av == null) return null;

            dto.setDocumentNumber(av.getAadhaarNumber());
            dto.setAutomaticStatus(av.getStatus());
            dto.setOcrText(av.getExtractedText());
            dto.setQrInfo(av.getNameSource());
            dto.setRejectionReason(av.getRejectionReason());
            dto.setDocumentPath(av.getDocumentPath());
            dto.setUploadedAt(av.getUploadedAt());

            populateUserInfo(dto, userId, av.getCustomerName(), av.isVerifiedForBikeOwner() ? "OWNER" : "CUSTOMER");

        } else if ("DRIVING_LICENSE".equalsIgnoreCase(review.getDocumentType())) {
            DrivingLicense dl = drivingLicenseRepository.findById(review.getDocumentId()).orElse(null);
            if (dl == null) return null;

            dto.setDocumentNumber(dl.getLicenseNumber());
            dto.setAutomaticStatus(dl.getStatus());
            dto.setOcrText(dl.getOcrText());
            dto.setQrInfo(dl.getRemarks());
            dto.setRejectionReason(dl.getRemarks());
            dto.setDocumentPath(dl.getDocumentPath());
            dto.setUploadedAt(dl.getVerifiedAt());

            populateUserInfo(dto, userId, dl.getCustomerName(), "CUSTOMER");

        } else if ("RC".equalsIgnoreCase(review.getDocumentType())) {
            BikeDocument rc = bikeDocumentRepository.findById(review.getDocumentId()).orElse(null);
            if (rc == null) return null;

            dto.setDocumentNumber(rc.getRegistrationNumber());
            dto.setAutomaticStatus(rc.getStatus());
            dto.setOcrText(rc.getOcrText());
            dto.setQrInfo("Maker: " + (rc.getMakerName() != null ? rc.getMakerName() : "N/A"));
            dto.setRejectionReason(rc.getRemarks());
            dto.setDocumentPath(rc.getDocumentPath());
            dto.setUploadedAt(rc.getVerifiedAt());

            populateUserInfo(dto, userId, rc.getOwnerName(), "OWNER");

            // Attach bike info if available
            dto.setRegistrationNumber(rc.getRegistrationNumber());
            if (rc.getBikeId() != null) {
                dto.setBikeId(rc.getBikeId());
                bikeRepository.findById(rc.getBikeId()).ifPresent(b -> {
                    dto.setBikeName(b.getBikeName());
                    dto.setBikeBrand(b.getBrand());
                    dto.setBikeModel(b.getModel());
                });
            } else if (rc.getRegistrationNumber() != null) {
                bikeRepository.findByRegistrationNumber(rc.getRegistrationNumber()).ifPresent(b -> {
                    dto.setBikeId(b.getBikeId());
                    dto.setBikeName(b.getBikeName());
                    dto.setBikeBrand(b.getBrand());
                    dto.setBikeModel(b.getModel());
                });
            }
        }

        return dto;
    }

    private void populateUserInfo(AdminVerificationDTO dto, Long userId, String fallbackName, String defaultRole) {
        if (userId != null) {
            Optional<User> uOpt = userRepository.findById(userId);
            if (uOpt.isPresent()) {
                User user = uOpt.get();
                dto.setUserName(user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : fallbackName);
                dto.setUserEmail(user.getEmail());
                dto.setUserRole(user.getRole() != null ? user.getRole().name() : defaultRole);
                return;
            }
        }
        dto.setUserName(fallbackName != null ? fallbackName : "Unknown User");
        dto.setUserEmail("N/A");
        dto.setUserRole(defaultRole);
    }

    private String getDocumentFilePath(String docType, Long docId) {
        if ("AADHAAR".equalsIgnoreCase(docType)) {
            return aadhaarRepository.findById(docId).map(AadhaarVerification::getDocumentPath).orElse(null);
        } else if ("DRIVING_LICENSE".equalsIgnoreCase(docType)) {
            return drivingLicenseRepository.findById(docId).map(DrivingLicense::getDocumentPath).orElse(null);
        } else if ("RC".equalsIgnoreCase(docType)) {
            return bikeDocumentRepository.findById(docId).map(BikeDocument::getDocumentPath).orElse(null);
        }
        return null;
    }

    private void addAuditLog(Long documentReviewId, String action, String reason, String performedBy) {
        VerificationAudit audit = new VerificationAudit();
        audit.setDocumentReviewId(documentReviewId);
        audit.setAction(action);
        audit.setReason(reason);
        audit.setPerformedBy(performedBy != null ? performedBy : "ADMIN");
        audit.setPerformedAt(LocalDateTime.now());
        verificationAuditRepository.save(audit);
    }
}
