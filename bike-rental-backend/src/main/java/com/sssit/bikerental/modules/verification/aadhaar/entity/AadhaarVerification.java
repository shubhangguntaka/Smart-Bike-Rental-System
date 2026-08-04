package com.sssit.bikerental.modules.verification.aadhaar.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "aadhaar_verification")
public class AadhaarVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // No longer supplied by the caller - verification is now purely
    // image-driven. Kept nullable so an early rejection (e.g. bad
    // image, before OCR even runs) can still be persisted.
    private Long customerId;

    @Column(unique = true)
    private String aadhaarNumber;

    private String customerName;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @Column(nullable = false)
    private String status;

    // TEXT, not the default VARCHAR(255) - rejection messages
    // (e.g. the QR-not-detected guidance, or a mismatch message
    // that embeds both the QR and OCR values) routinely exceed
    // 255 characters and were causing an insert-time
    // DataException (MySQL "Data truncation: Data too long for
    // column 'rejection_reason'") that surfaced as a 500 instead
    // of the intended clean REJECTED response.
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private String uploadedFile;

    private LocalDateTime uploadedAt;

    // NEW FIELD
    private String verifiedBy;

    // NEW FIELD
    private LocalDateTime verifiedAt;

    // NEW FIELD: "QR" or "OCR" - where the name used for matching came from
    private String nameSource;

    // Stamp shown by the frontend (VERIFIED/green or REJECTED/red)
    private String stampLabel;
    private String stampIcon;
    private String stampColor;

    // Where the uploaded card image is saved on disk, so an admin can
    // view it later. Only set when the record is actually persisted
    // (see AadhaarServiceImpl) - a rejected duplicate-card attempt,
    // for example, never gets a row at all, so there's nothing to
    // point this at.
    private String documentPath;

    // NEW FIELD: purely informational message shown alongside an
    // APPROVED result (unlike rejectionReason, which only applies to
    // REJECTED rows) - e.g. telling the user their Aadhaar was already
    // verified on this account when they re-upload it for a second
    // role such as bike owner.
    @Column(columnDefinition = "TEXT")
    private String note;

    // NEW FIELDS: track which role(s) this Aadhaar has been verified
    // for on this account. A repeat upload for a role already marked
    // true here is a plain duplicate (rejected); a repeat upload for
    // the OTHER role, by the same customer, is a legitimate one-time
    // second-role verification (accepted).
    private boolean verifiedForUser;
    private boolean verifiedForBikeOwner;

    public AadhaarVerification() {
    }

    @PrePersist
    public void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }

    // ===================== GETTERS =====================

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public String getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public String getUploadedFile() {
        return uploadedFile;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public String getNameSource() {
        return nameSource;
    }

    public String getStampLabel() {
        return stampLabel;
    }

    public String getStampIcon() {
        return stampIcon;
    }

    public String getStampColor() {
        return stampColor;
    }

    public String getDocumentPath() {
        return documentPath;
    }

    public String getNote() {
        return note;
    }

    public boolean isVerifiedForUser() {
        return verifiedForUser;
    }

    public boolean isVerifiedForBikeOwner() {
        return verifiedForBikeOwner;
    }

    // ===================== SETTERS =====================

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public void setUploadedFile(String uploadedFile) {
        this.uploadedFile = uploadedFile;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public void setNameSource(String nameSource) {
        this.nameSource = nameSource;
    }

    public void setStampLabel(String stampLabel) {
        this.stampLabel = stampLabel;
    }

    public void setStampIcon(String stampIcon) {
        this.stampIcon = stampIcon;
    }

    public void setStampColor(String stampColor) {
        this.stampColor = stampColor;
    }

    public void setDocumentPath(String documentPath) {
        this.documentPath = documentPath;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public void setVerifiedForUser(boolean verifiedForUser) {
        this.verifiedForUser = verifiedForUser;
    }

    public void setVerifiedForBikeOwner(boolean verifiedForBikeOwner) {
        this.verifiedForBikeOwner = verifiedForBikeOwner;
    }
}