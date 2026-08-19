package com.sssit.bikerental.modules.verification.admin.dto;

import java.time.LocalDateTime;

public class UserVerificationSummaryDTO {

    private Long userId;
    private String userName;
    private String userEmail;
    private String userRole; // OWNER or CUSTOMER
    private String overallStatus; // VERIFIED, REJECTED, PENDING, INCOMPLETE

    private AdminVerificationDTO aadhaarVerification;
    private AdminVerificationDTO secondaryVerification; // DL for CUSTOMER, RC for OWNER

    private Integer nameMatchPercentage;
    private String nameMatchStatus; // MATCHED, MISMATCHED, N/A
    private LocalDateTime latestUploadedAt;

    public UserVerificationSummaryDTO() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getOverallStatus() {
        return overallStatus;
    }

    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }

    public AdminVerificationDTO getAadhaarVerification() {
        return aadhaarVerification;
    }

    public void setAadhaarVerification(AdminVerificationDTO aadhaarVerification) {
        this.aadhaarVerification = aadhaarVerification;
    }

    public AdminVerificationDTO getSecondaryVerification() {
        return secondaryVerification;
    }

    public void setSecondaryVerification(AdminVerificationDTO secondaryVerification) {
        this.secondaryVerification = secondaryVerification;
    }

    public Integer getNameMatchPercentage() {
        return nameMatchPercentage;
    }

    public void setNameMatchPercentage(Integer nameMatchPercentage) {
        this.nameMatchPercentage = nameMatchPercentage;
    }

    public String getNameMatchStatus() {
        return nameMatchStatus;
    }

    public void setNameMatchStatus(String nameMatchStatus) {
        this.nameMatchStatus = nameMatchStatus;
    }

    public LocalDateTime getLatestUploadedAt() {
        return latestUploadedAt;
    }

    public void setLatestUploadedAt(LocalDateTime latestUploadedAt) {
        this.latestUploadedAt = latestUploadedAt;
    }
}
