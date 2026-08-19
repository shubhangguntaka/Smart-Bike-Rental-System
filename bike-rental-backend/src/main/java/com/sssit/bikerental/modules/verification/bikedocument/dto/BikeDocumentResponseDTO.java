package com.sssit.bikerental.modules.verification.bikedocument.dto;

import java.time.LocalDate;

public class BikeDocumentResponseDTO {

    private boolean verified;

    private String status;

    private String message;

    private String ownerName;

    private String registrationNumber;

    private String chassisNumber;

    private String engineNumber;

    private String makerName;

    private String model;

    private String vehicleClass;

    private LocalDate registrationDate;

    private LocalDate insuranceValidUpto;

    private LocalDate puccValidUpto;

    private LocalDate fitnessValidUpto;

    private String address;

    private boolean qrVerified;

    private String aadhaarOwnerName;

    // Whether the RC owner name was cross-checked against the
    // owner's verified Aadhaar name (true only when both were
    // compared)
    private boolean ownerAadhaarNameMatched;

    // Stamp shown by the frontend (VERIFIED/green or REJECTED/red)
    private String stampLabel;
    private String stampIcon;
    private String stampColor;

    public BikeDocumentResponseDTO() {
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

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getChassisNumber() {
        return chassisNumber;
    }

    public void setChassisNumber(String chassisNumber) {
        this.chassisNumber = chassisNumber;
    }

    public String getEngineNumber() {
        return engineNumber;
    }

    public void setEngineNumber(String engineNumber) {
        this.engineNumber = engineNumber;
    }

    public String getMakerName() {
        return makerName;
    }

    public void setMakerName(String makerName) {
        this.makerName = makerName;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getVehicleClass() {
        return vehicleClass;
    }

    public void setVehicleClass(String vehicleClass) {
        this.vehicleClass = vehicleClass;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public LocalDate getInsuranceValidUpto() {
        return insuranceValidUpto;
    }

    public void setInsuranceValidUpto(LocalDate insuranceValidUpto) {
        this.insuranceValidUpto = insuranceValidUpto;
    }

    public LocalDate getPuccValidUpto() {
        return puccValidUpto;
    }

    public void setPuccValidUpto(LocalDate puccValidUpto) {
        this.puccValidUpto = puccValidUpto;
    }

    public LocalDate getFitnessValidUpto() {
        return fitnessValidUpto;
    }

    public void setFitnessValidUpto(LocalDate fitnessValidUpto) {
        this.fitnessValidUpto = fitnessValidUpto;
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

    public boolean isOwnerAadhaarNameMatched() {
        return ownerAadhaarNameMatched;
    }

    public void setOwnerAadhaarNameMatched(boolean ownerAadhaarNameMatched) {
        this.ownerAadhaarNameMatched = ownerAadhaarNameMatched;
    }

    public String getAadhaarOwnerName() {
        return aadhaarOwnerName;
    }

    public void setAadhaarOwnerName(String aadhaarOwnerName) {
        this.aadhaarOwnerName = aadhaarOwnerName;
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
