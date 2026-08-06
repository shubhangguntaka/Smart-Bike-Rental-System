package com.sssit.bikerental.modules.bike.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result of checking whether this owner already has an APPROVED RC
 * for a given registration number (so re-listing the same bike can
 * skip RC re-upload).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovedRcDTO {

    private boolean verified;

    private String message;

    private Long documentId;

    private Long ownerId;

    private String ownerName;

    private String registrationNumber;

    private String makerName;

    private String model;

    private String vehicleClass;

    private String status;

    /** True when a bike listing with this registration already exists */
    private boolean alreadyListed;
}
