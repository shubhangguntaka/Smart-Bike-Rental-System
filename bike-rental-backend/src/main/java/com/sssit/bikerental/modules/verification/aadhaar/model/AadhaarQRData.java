package com.sssit.bikerental.modules.verification.aadhaar.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Stores data extracted from Aadhaar QR Code.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AadhaarQRData {

    /**
     * 12-digit Aadhaar Number
     */
    private String aadhaarNumber;

    /**
     * Aadhaar Holder Name
     */
    private String name;

    /**
     * Date of Birth
     * Example: 20/06/1986
     */
    private String dateOfBirth;

    /**
     * Gender
     */
    private String gender;

    /**
     * Full Address
     */
    private String address;

    /**
     * District
     */
    private String district;

    /**
     * State
     */
    private String state;

    /**
     * PIN Code
     */
    private String pinCode;

    /**
     * Base64 encoded photo (if available)
     */
    private String photoBase64;

    /**
     * Raw QR Content
     */
    private String rawQRText;

    /**
     * QR detected?
     */
    private boolean qrAvailable;

    /**
     * QR parsed successfully?
     */
    private boolean qrValid;

    /**
     * Result of verifying the QR's digital signature against
     * UIDAI's public certificate. Null if never checked.
     * One of: VALID, INVALID, NOT_CONFIGURED, NOT_SIGNED_QR, NO_RAW_BYTES
     */
    private String signatureStatus;

    /**
     * Human-readable explanation of signatureStatus.
     */
    private String signatureMessage;

    /**
     * Pixel width/height of the uploaded image that was scanned for
     * a QR code. Populated even when qrAvailable is false, so a
     * rejection message can tell the user what was actually
     * received (helps distinguish "too small a crop" from "QR just
     * wasn't found despite a normal-sized photo").
     */
    private Integer scannedImageWidth;
    private Integer scannedImageHeight;

}