package com.sssit.bikerental.modules.verification.drivinglicense.util;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Component;

import com.google.zxing.Result;
import com.sssit.bikerental.modules.verification.common.util.RobustQRDecoder;

/**
 * Reads the QR code (if any) off a Driving License image.
 *
 * Delegates the actual locate-and-decode work to RobustQRDecoder,
 * which tries multiple rotations/scales/binarizers before giving up
 * - the same robust logic used for Aadhaar QR reading.
 *
 * Note: unlike Aadhaar's Secure QR (a digitally signed, structured
 * payload), most Indian DL QR codes just encode a Parivahan
 * verification URL or a short pipe/@-separated text block. So this
 * reader only returns the raw decoded text - it's up to the caller
 * to decide what (if anything) can be cross-checked against OCR.
 */
@Component
public class QRReader {

    /**
     * @param file Uploaded Driving License image
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
