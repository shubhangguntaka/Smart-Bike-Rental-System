package com.sssit.bikerental.modules.verification.bikedocument.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Registration Certificate (RC) verification record for a bike
 * listed on the platform.
 *
 * Unlike Aadhaar/DrivingLicense (which are tied to customerId - the
 * person RENTING a bike), this is tied to ownerId - the person
 * LISTING/owning the bike. ownerId lives in the same user/customer id
 * space as customerId elsewhere in this app; it's just named
 * differently here to reflect the actual business role.
 */
@Entity
@Table(name = "bike_document_verification")
public class BikeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id")
    private Long ownerId;

    // Optional: which bike (in the app's own Bike/listing table, not
    // part of this zip) this RC belongs to, once that id is known.
    // Kept nullable so a document can be verified before a bike
    // listing row necessarily exists yet.
    @Column(name = "bike_id")
    private Long bikeId;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    @Column(name = "chassis_number")
    private String chassisNumber;

    @Column(name = "engine_number")
    private String engineNumber;

    @Column(name = "maker_name")
    private String makerName;

    private String model;

    @Column(name = "vehicle_class")
    private String vehicleClass;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Column(name = "insurance_valid_upto")
    private LocalDate insuranceValidUpto;

    @Column(name = "pucc_valid_upto")
    private LocalDate puccValidUpto;

    @Column(name = "fitness_valid_upto")
    private LocalDate fitnessValidUpto;

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

    public BikeDocument() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Long getBikeId() {
        return bikeId;
    }

    public void setBikeId(Long bikeId) {
        this.bikeId = bikeId;
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
