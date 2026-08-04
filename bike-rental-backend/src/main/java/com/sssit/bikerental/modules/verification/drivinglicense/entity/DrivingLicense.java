package com.sssit.bikerental.modules.verification.drivinglicense.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "driving_license_verification")
public class DrivingLicense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "license_number", unique = true)
    private String licenseNumber;

    private LocalDate dob;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "valid_till")
    private LocalDate validTill;

    @Column(length = 500)
    private String address;

    @Column(length = 20)
    private String status;

    @Column(length = 500)
    private String remarks;

    @Column(name = "verified_by")
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "document_path")
    private String documentPath;

    @Lob
    @Column(name = "ocr_text", columnDefinition = "LONGTEXT")
    private String ocrText;

    // Stamp shown by the frontend (VERIFIED/green or REJECTED/red)
    @Column(name = "stamp_label")
    private String stampLabel;

    @Column(name = "stamp_icon")
    private String stampIcon;

    @Column(name = "stamp_color")
    private String stampColor;

    public DrivingLicense() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getValidTill() {
        return validTill;
    }

    public void setValidTill(LocalDate validTill) {
        this.validTill = validTill;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getDocumentPath() {
        return documentPath;
    }

    public void setDocumentPath(String documentPath) {
        this.documentPath = documentPath;
    }

    public String getOcrText() {
        return ocrText;
    }

    public void setOcrText(String ocrText) {
        this.ocrText = ocrText;
    }

    public String getStampLabel() {
        return stampLabel;
    }

    public void setStampLabel(String stampLabel) {
        this.stampLabel = stampLabel;
    }

    public String getStampIcon() {
        return stampIcon;
    }

    public void setStampIcon(String stampIcon) {
        this.stampIcon = stampIcon;
    }

    public String getStampColor() {
        return stampColor;
    }

    public void setStampColor(String stampColor) {
        this.stampColor = stampColor;
    }
}