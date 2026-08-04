package com.sssit.bikerental.modules.verification.aadhaar.validator;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.common.constants.VerificationConstants;

/**
 * Rejects uploads that are too small / tightly cropped to be a
 * genuine full-length Aadhaar card photo (e.g. just the photo,
 * just the number, a tiny thumbnail, a heavily zoomed-in crop).
 *
 * This is a cheap check done BEFORE OCR/QR processing, so obviously
 * bad uploads fail fast with a clear message instead of falling
 * through to a confusing OCR-related rejection.
 */
@Component
public class ImageQualityValidator {

    // A real Aadhaar photo (front or back, or both stacked) taken
    // with a phone camera or scanned will comfortably exceed these.
    // Tiny crops / thumbnails will not.
    private static final int MIN_WIDTH_PX = VerificationConstants.MIN_IMAGE_WIDTH_PX;
    private static final int MIN_HEIGHT_PX = VerificationConstants.MIN_IMAGE_HEIGHT_PX;

    public boolean isFullLengthAadhaarImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return false;
        }

        try (InputStream in = file.getInputStream()) {

            BufferedImage image = ImageIO.read(in);

            if (image == null) {
                return false;
            }

            int width = image.getWidth();
            int height = image.getHeight();

            return width >= MIN_WIDTH_PX && height >= MIN_HEIGHT_PX;

        } catch (IOException e) {

            return false;
        }
    }
}
