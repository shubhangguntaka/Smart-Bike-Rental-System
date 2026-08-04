package com.sssit.bikerental.modules.verification.bikedocument.util;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Rejects uploads that are too small / tightly cropped to be a
 * genuine full RC card photo (e.g. just a corner, a tiny thumbnail,
 * a heavily zoomed-in crop), mirroring
 * aadhaar.validator.ImageQualityValidator.
 *
 * Cheap check done BEFORE OCR/QR processing, so obviously bad
 * uploads fail fast with a clear message.
 */
@Component
public class RCImageQualityValidator {

    private static final int MIN_WIDTH_PX = RCConstants.MIN_IMAGE_WIDTH_PX;
    private static final int MIN_HEIGHT_PX = RCConstants.MIN_IMAGE_HEIGHT_PX;

    public boolean isFullLengthRCImage(MultipartFile file) {

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
