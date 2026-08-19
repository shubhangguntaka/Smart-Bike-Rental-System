package com.sssit.bikerental.modules.verification.bikedocument.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Registration Certificate (RC) verification record for a bike
 * listed on the platform.
 *
 * Unlike Aadhaar/DrivingLicense (which are tied to customerId - the
 * person RENTING a bike), this is tied to ownerId - the person
 * LISTING/owning the bike.
 *
 * ownerId lives in the same user/customer id space as customerId
 * elsewhere in this app; it is just named differently here to
 * reflect the actual business role.
 */
@Entity
@Table(name = "bike_document_verification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BikeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id")
    private Long ownerId;

    /**
     * Optional: which bike this RC belongs to.
     * Kept nullable so a document can be verified before
     * a bike listing row necessarily exists.
     */
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

    /**
     * Path/location of the uploaded RC document.
     */
    @Column(name = "document_path")
    private String documentPath;

    /**
     * Timestamp when the RC document was uploaded.
     */
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Lob
    @Column(name = "ocr_text", columnDefinition = "LONGTEXT")
    private String ocrText;

    /**
     * Stamp shown by the frontend:
     * VERIFIED / REJECTED
     */
    @Column(name = "stamp_label")
    private String stampLabel;

    @Column(name = "stamp_icon")
    private String stampIcon;

    @Column(name = "stamp_color")
    private String stampColor;
}