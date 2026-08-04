package com.sssit.bikerental.modules.verification.drivinglicense.dto;

import java.time.LocalDate;

public class DrivingLicenseResponseDTO {

    private boolean verified;

    private String status;

    private String message;

    private String customerName;

    private String licenseNumber;

    private LocalDate dob;

    private LocalDate issueDate;

    private LocalDate validTill;

    private String address;

    private boolean qrVerified;

    // Whether the DL name was cross-checked against the customer's
    // verified Aadhaar name (true only when both were compared)
    private boolean aadhaarNameMatched;

    // Stamp shown by the frontend (VERIFIED/green or REJECTED/red)
    private String stampLabel;
    private String stampIcon;
    private String stampColor;

    public DrivingLicenseResponseDTO() {
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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

    public boolean isQrVerified() {
        return qrVerified;
    }

    public void setQrVerified(boolean qrVerified) {
        this.qrVerified = qrVerified;
    }

    public boolean isAadhaarNameMatched() {
        return aadhaarNameMatched;
    }

    public void setAadhaarNameMatched(boolean aadhaarNameMatched) {
        this.aadhaarNameMatched = aadhaarNameMatched;
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