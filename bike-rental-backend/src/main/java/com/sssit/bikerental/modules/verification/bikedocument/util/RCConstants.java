package com.sssit.bikerental.modules.verification.bikedocument.util;

/**
 * Constants used only by the Bike Document (RC) module.
 *
 * Kept local to this package instead of adding to the shared
 * VerificationConstants class, so the Aadhaar/DrivingLicense modules
 * (and the file they already depend on) are left completely
 * untouched.
 */
public final class RCConstants {

    private RCConstants() {
    }

    //-----------------------------------
    // Image quality thresholds (same reasoning as Aadhaar/DL: a
    // real full-card photo comfortably exceeds these, a tiny crop
    // or thumbnail does not)
    //-----------------------------------

    public static final int MIN_IMAGE_WIDTH_PX = 500;
    public static final int MIN_IMAGE_HEIGHT_PX = 300;

    //-----------------------------------
    // Standard error / rejection messages
    //-----------------------------------

    public static final String ERROR_SMALL_OR_CROPPED_IMAGE =
            "Please upload the full Registration Certificate (RC) image, including the QR code. "
                    + "The uploaded image is too small or cropped.";

    public static final String ERROR_INVALID_DOCUMENT_TYPE =
            "Invalid document. Please upload the bike's Registration Certificate (RC).";

    public static final String ERROR_RC_ALREADY_EXISTS =
            "This Registration Certificate is already verified under a different owner account.";

    public static final String ERROR_OWNER_AADHAAR_NOT_VERIFIED_FIRST =
            "Please verify your Aadhaar card before uploading your bike's Registration Certificate.";

    public static final String ERROR_INSURANCE_EXPIRED =
            "The insurance on this Registration Certificate has expired. "
                    + "Please renew the insurance and upload an updated RC.";

    public static final String ERROR_PUCC_EXPIRED =
            "The Pollution Under Control Certificate (PUCC) validity on this RC has expired. "
                    + "Please renew it and upload an updated RC.";

    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";

    //-----------------------------------
    // Approval / rejection "stamp" shown in API responses (same
    // shape as the Aadhaar/DL stamp fields)
    //-----------------------------------

    public static final String STAMP_APPROVED_LABEL = "VERIFIED";
    public static final String STAMP_APPROVED_ICON = "\u2705";
    public static final String STAMP_APPROVED_COLOR = "green";

    public static final String STAMP_REJECTED_LABEL = "REJECTED";
    public static final String STAMP_REJECTED_ICON = "\u274C";
    public static final String STAMP_REJECTED_COLOR = "red";
}
