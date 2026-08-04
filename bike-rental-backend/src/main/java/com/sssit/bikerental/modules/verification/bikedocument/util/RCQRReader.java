package com.sssit.bikerental.modules.verification.bikedocument.util;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Component;

import com.google.zxing.Result;
import com.sssit.bikerental.modules.verification.common.util.RobustQRDecoder;

/**
 * Reads the QR code (if any) off an RC image.
 *
 * Delegates the actual locate-and-decode work to RobustQRDecoder
 * (shared with Aadhaar/DL, read-only usage here). Like Vahan's
 * modern smart-card RC, the QR typically just encodes a
 * vahan.parivahan.gov.in verification URL or a short structured
 * text block rather than a digitally signed payload (unlike
 * Aadhaar's Secure QR) - so this reader only returns the raw decoded
 * text, and the caller decides what can be cross-checked against OCR.
 */
@Component
public class RCQRReader {

    /**
     * @param file Uploaded RC image
     * @return decoded QR text, or null if no QR code was found
     */
    public String readQRCode(File file) {

        try {

            if (file == null || !file.exists()) {
                return null;
            }

            BufferedImage bufferedImage = ImageIO.read(file);

            if (bufferedImage == null) {
                return null;
            }

            Result result = RobustQRDecoder.decode(bufferedImage);

            return result != null ? result.getText() : null;

        } catch (IOException e) {

            throw new RuntimeException("Unable to read image.", e);
        }
    }
}
