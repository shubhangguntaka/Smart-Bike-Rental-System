package com.sssit.bikerental.modules.verification.bikedocument.model;

import java.time.LocalDate;

/**
 * Structured fields extracted from the OCR text of an uploaded
 * Registration Certificate (RC) / "Certificate of Registration"
 * image, mirroring how DLData holds the fields extracted off a
 * Driving License.
 */
public class RCData {

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

    private String ocrText;

    public RCData() {
    }

    public String getOcrText() {
        return ocrText;
    }

    public void setOcrText(String ocrText) {
        this.ocrText = ocrText;
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
}
