package com.sssit.bikerental.modules.verification.aadhaar.validator;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.verification.aadhaar.model.AadhaarQRData;
import com.sssit.bikerental.modules.verification.common.model.OCRData;

/**
 * Makes sure the uploaded image is the FULL Aadhaar card, not just a
 * partial / cropped photo.
 *
 * "Full" means:
 *   - Front side details are readable (name, DOB, gender), AND
 *   - Back side proof is present, evidenced by EITHER:
 *       - a QR code being detected, OR
 *       - an address being readable via OCR
 *
 * This stops uploads like: only the photo, only the number, a
 * screenshot with the name cropped out, etc.
 */
@Component
public class AadhaarCompletenessValidator {

    public boolean isFullAadhaarUpload(OCRData ocrData, AadhaarQRData qrData) {

        if (ocrData == null) {
            return false;
        }

        boolean hasFrontDetails =
                notBlank(ocrData.getName())
                        && notBlank(ocrData.getDob())
                        && notBlank(ocrData.getGender());

        boolean hasBackProof =
                (qrData != null && qrData.isQrAvailable())
                        || notBlank(ocrData.getAddress());

        return hasFrontDetails && hasBackProof;
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }
}
