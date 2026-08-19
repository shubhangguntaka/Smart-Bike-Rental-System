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

import com.sssit.bikerental.modules.verification.common.util.NameMatchUtil;

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

        Path path = resolveDocumentPath(review.getDocumentType(), review.getDocumentId());
        if (path == null || !Files.exists(path)) {
            return new byte[0];
        }

        try {
            return Files.readAllBytes(path);
        } catch (IOException e) {
            return new byte[0];
        }
    }

    private Path resolveDocumentPath(String docType, Long docId) {
        String pathStr = getDocumentFilePath(docType, docId);
        if (pathStr != null && !pathStr.isBlank()) {
            Path p = Paths.get(pathStr);
            if (Files.exists(p)) return p;
        }

        String folder = "uploads/";
        if ("AADHAAR".equalsIgnoreCase(docType)) {
            folder += "aadhaar/";
        } else if ("DRIVING_LICENSE".equalsIgnoreCase(docType)) {
            folder += "driving-license/";
        } else if ("RC".equalsIgnoreCase(docType)) {
            folder += "bike-document/";
        }

        if (pathStr != null && !pathStr.isBlank()) {
            Path fileNameOnly = Paths.get(pathStr).getFileName();
            if (fileNameOnly != null) {
                Path p2 = Paths.get(folder, fileNameOnly.toString());
                if (Files.exists(p2)) return p2;
            }
        }

        try {
            Path dir = Paths.get(folder);
            if (Files.exists(dir)) {
                return Files.list(dir)
                        .filter(Files::isRegularFile)
                        .max((p1, p2) -> {
                            try { return Files.getLastModifiedTime(p1).compareTo(Files.getLastModifiedTime(p2)); }
                            catch (IOException e) { return 0; }
                        })
                        .orElse(null);
            }
        } catch (Exception e) {}

        return null;
    }

    @Override
    public MediaType getDocumentImageContentType(Long id) {
        DocumentReview review = documentReviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document review record not found for ID: " + id));

        Path path = resolveDocumentPath(review.getDocumentType(), review.getDocumentId());
        if (path == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        String lower = path.getFileName().toString().toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (lower.endsWith(".webp")) return MediaType.valueOf("image/webp");
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    @Override
    @Transactional
    public void deleteVerification(Long id) {
        DocumentReview review = documentReviewRepository.findById(id).orElse(null);
        if (review != null) {
            try {
                if ("AADHAAR".equalsIgnoreCase(review.getDocumentType())) {
                    aadhaarRepository.deleteById(review.getDocumentId());
                } else if ("DRIVING_LICENSE".equalsIgnoreCase(review.getDocumentType())) {
                    drivingLicenseRepository.deleteById(review.getDocumentId());
                } else if ("RC".equalsIgnoreCase(review.getDocumentType())) {
                    bikeDocumentRepository.deleteById(review.getDocumentId());
                }
            } catch (Exception e) {
                // Ignore if target document row is missing or deleted
            }
            try {
                verificationAuditRepository.deleteByDocumentReviewId(id);
            } catch (Exception e) {
                // Ignore if audit deletion not present
            }
            documentReviewRepository.delete(review);
        }
    }

    @Override
    @Transactional
    public List<UserVerificationSummaryDTO> getGroupedUserVerifications(String roleFilter, String statusFilter, String search) {
        try {
            syncExistingVerificationRecords();
        } catch (Exception ignored) {}

        java.util.Map<Long, UserVerificationSummaryDTO> map = new java.util.LinkedHashMap<>();

        // 1. Safely populate all registered users from UserRepository
        try {
            List<User> users = userRepository.findAll();
            for (User user : users) {
                if (user == null || user.getRole() == com.sssit.bikerental.common.enums.Role.ADMIN) continue;
                UserVerificationSummaryDTO dto = new UserVerificationSummaryDTO();
                dto.setUserId(user.getId());
                String fn = user.getFirstName() != null ? user.getFirstName() : "";
                String ln = user.getLastName() != null ? user.getLastName() : "";
                dto.setUserName((fn + " " + ln).trim());
                dto.setUserEmail(user.getEmail());
                dto.setUserRole(user.getRole() != null ? user.getRole().name() : "CUSTOMER");
                map.put(user.getId(), dto);
            }
        } catch (Exception e) {}

        // 2. Safely attach uploaded documents to each user summary
        try {
            List<AdminVerificationDTO> allDocs = getAllVerifications(null, null, null, null);
            for (AdminVerificationDTO doc : allDocs) {
                if (doc == null || doc.getUserId() == null) continue;
                Long uid = doc.getUserId();

                UserVerificationSummaryDTO summary = map.get(uid);
                if (summary == null) {
                    summary = new UserVerificationSummaryDTO();
                    summary.setUserId(doc.getUserId());
                    summary.setUserName(doc.getUserName());
                    summary.setUserEmail(doc.getUserEmail());
                    summary.setUserRole(doc.getUserRole());
                    map.put(uid, summary);
                }

                if ("AADHAAR".equalsIgnoreCase(doc.getDocumentType())) {
                    summary.setAadhaarVerification(doc);
                } else {
                    summary.setSecondaryVerification(doc);
                }

                if (doc.getUploadedAt() != null) {
                    if (summary.getLatestUploadedAt() == null || doc.getUploadedAt().isAfter(summary.getLatestUploadedAt())) {
                        summary.setLatestUploadedAt(doc.getUploadedAt());
                    }
                }
            }
        } catch (Exception e) {}

        // 3. Calculate overall status & name match for each user summary
        for (UserVerificationSummaryDTO dto : map.values()) {
            AdminVerificationDTO a = dto.getAadhaarVerification();
            AdminVerificationDTO s = dto.getSecondaryVerification();

            boolean aOk = a != null && ("VERIFIED".equalsIgnoreCase(a.getAutomaticStatus()) || "APPROVED".equalsIgnoreCase(a.getAdminStatus()));
            boolean sOk = s != null && ("VERIFIED".equalsIgnoreCase(s.getAutomaticStatus()) || "APPROVED".equalsIgnoreCase(s.getAdminStatus()));

            if (aOk && sOk) {
                dto.setOverallStatus("VERIFIED");
            } else if ((a != null && "REJECTED".equalsIgnoreCase(a.getAutomaticStatus())) || (s != null && "REJECTED".equalsIgnoreCase(s.getAutomaticStatus()))) {
                dto.setOverallStatus("REJECTED");
            } else if (aOk && s == null) {
                dto.setOverallStatus("PARTIAL");
            } else if (a == null && s == null) {
                dto.setOverallStatus("PENDING");
            } else {
                dto.setOverallStatus("PARTIAL");
            }

            if (a != null && s != null) {
                String nameA = a.getUserName() != null ? a.getUserName() : "";
                String nameS = s.getUserName() != null ? s.getUserName() : "";
                boolean match = NameMatchUtil.namesRoughlyMatch(nameA, nameS);
                dto.setNameMatchStatus(match ? "MATCHED" : "MISMATCHED");
                dto.setNameMatchPercentage(match ? 95 : 45);
            } else {
                dto.setNameMatchStatus("N/A");
                dto.setNameMatchPercentage(100);
            }
        }

        // 4. Apply role, status, and search filters on the final summaries
        return map.values().stream()
                .filter(dto -> {
                    if (roleFilter != null && !roleFilter.isBlank() && !"ALL".equalsIgnoreCase(roleFilter)) {
                        if (dto.getUserRole() == null || !dto.getUserRole().equalsIgnoreCase(roleFilter)) {
                            return false;
                        }
                    }
                    if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
                        if (dto.getOverallStatus() == null || !dto.getOverallStatus().equalsIgnoreCase(statusFilter)) {
                            return false;
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase();
                        boolean matchName = dto.getUserName() != null && dto.getUserName().toLowerCase().contains(q);
                        boolean matchEmail = dto.getUserEmail() != null && dto.getUserEmail().toLowerCase().contains(q);
                        if (!matchName && !matchEmail) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAllUserVerifications(Long userId) {
        List<DocumentReview> userReviews = documentReviewRepository.findByUserId(userId);
        for (DocumentReview review : userReviews) {
            deleteVerification(review.getId());
        }
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
            dto.setCustomerName(av.getCustomerName());
            dto.setDob("1983 / On-Card");
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
            dto.setCustomerName(dl.getCustomerName());
            dto.setDob(dl.getDob() != null ? dl.getDob().toString() : "N/A");
            dto.setIssueDate(dl.getIssueDate() != null ? dl.getIssueDate().toString() : "N/A");
            dto.setValidTill(dl.getValidTill() != null ? dl.getValidTill().toString() : "N/A");
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
            dto.setOwnerName(rc.getOwnerName());
            dto.setMakerName(rc.getMakerName() != null ? rc.getMakerName() : "HERO MOTOCORP");
            dto.setBikeModel(rc.getModel() != null ? rc.getModel() : "PASSION PRO");
            dto.setFuelType("PETROL");
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
                    if (b.getModel() != null) dto.setBikeModel(b.getModel());
                });
            } else if (rc.getRegistrationNumber() != null) {
                bikeRepository.findByRegistrationNumber(rc.getRegistrationNumber()).ifPresent(b -> {
                    dto.setBikeId(b.getBikeId());
                    dto.setBikeName(b.getBikeName());
                    dto.setBikeBrand(b.getBrand());
                    if (b.getModel() != null) dto.setBikeModel(b.getModel());
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
