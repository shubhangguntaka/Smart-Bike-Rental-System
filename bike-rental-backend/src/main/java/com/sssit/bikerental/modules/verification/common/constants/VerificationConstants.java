package com.sssit.bikerental.modules.verification.common.constants;

/**
 * Shared constants used across all verification modules
 * (Aadhaar, Driving Licence, Bike Documents, etc.)
 */
public class VerificationConstants {

    private VerificationConstants() {
    }

    //-----------------------------------
    // Image quality thresholds
    //-----------------------------------

    // A real full-length document photo (taken with a phone camera
    // or scanned) will comfortably exceed these. Tiny crops /
    // thumbnails / zoomed-in screenshots will not.
    public static final int MIN_IMAGE_WIDTH_PX = 500;
    public static final int MIN_IMAGE_HEIGHT_PX = 300;

    //-----------------------------------
    // Standard error / rejection messages
    //-----------------------------------

    public static final String ERROR_SMALL_OR_CROPPED_IMAGE =
            "Please upload the full-length Aadhaar card image, including the QR code. "
                    + "The uploaded image is too small or cropped.";

    public static final String ERROR_INVALID_DOCUMENT_TYPE =
            "Invalid document. Please upload your Aadhaar card.";

    public static final String ERROR_INCOMPLETE_UPLOAD =
            "Please upload the full Aadhaar card (front and back side, including the QR code).";

    public static final String ERROR_QR_NOT_DETECTED =
            "Could not detect a QR code on the uploaded Aadhaar card. "
                    + "This usually means the image resolution is too low for the QR "
                    + "patch to be read (e.g. a shrunk multi-panel screenshot/printout "
                    + "with both front and back squeezed onto one small image). "
                    + "Please upload EITHER a single high-resolution scan (300 DPI or "
                    + "higher) of the full card, OR two separate native-resolution "
                    + "photos - one of the front, one of the back - each filling the "
                    + "camera frame with just that side of the card.";

    public static final String ERROR_OCR_NUMBER_NOT_FOUND =
            "Could not detect an Aadhaar Number on the uploaded document. "
                    + "Please upload a clearer image.";

    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";

    //-----------------------------------
    // Driving License cross-check messages
    // (DL identity must match the same customer's
    // already-verified Aadhaar)
    //-----------------------------------

    public static final String ERROR_AADHAAR_NOT_VERIFIED_FIRST =
            "Please verify your Aadhaar card before uploading your Driving License.";

    public static final String ERROR_DL_NAME_MISMATCH =
            "The name on the Driving License does not match your verified Aadhaar name.";

    //-----------------------------------
    // Duplicate-document checks
    // (this exact physical document has already been verified and
    // approved under a DIFFERENT customer account)
    //-----------------------------------

    public static final String ERROR_AADHAAR_ALREADY_EXISTS =
            "This Aadhaar card is already verified under a different customer account.";

    public static final String ERROR_DL_ALREADY_EXISTS =
            "This Driving License is already verified under a different customer account.";

    //-----------------------------------
    // Same-customer re-upload of an already-verified document
    // (e.g. re-verifying Aadhaar for a second role such as bike
    // owner). This is accepted, NOT rejected - the message is purely
    // informational so the user knows why it approved instantly.
    //-----------------------------------

    public static final String INFO_AADHAAR_ALREADY_VERIFIED_FOR_ACCOUNT =
            "You already have a verified Aadhaar card on this account.";

    //-----------------------------------
    // Verification "purpose" (which role the upload is for).
    // Determines whether re-using an already-approved Aadhaar is a
    // legitimate second-role verification or a plain repeat upload.
    //-----------------------------------

    public static final String PURPOSE_USER = "USER";
    public static final String PURPOSE_BIKE_OWNER = "BIKE_OWNER";

    public static final String ERROR_AADHAAR_ALREADY_VERIFIED_FOR_PURPOSE =
            "This Aadhaar card is already verified on your account for this purpose.";

    //-----------------------------------
    // Approval / rejection "stamp" shown in API responses.
    // Frontend renders these as a stamp-style badge; kept as plain
    // text/color/icon here (not baked into the ID image itself).
    //-----------------------------------

    public static final String STAMP_APPROVED_LABEL = "VERIFIED";
    public static final String STAMP_APPROVED_ICON = "✅";
    public static final String STAMP_APPROVED_COLOR = "green";

    public static final String STAMP_REJECTED_LABEL = "REJECTED";
    public static final String STAMP_REJECTED_ICON = "❌";
    public static final String STAMP_REJECTED_COLOR = "red";

}
