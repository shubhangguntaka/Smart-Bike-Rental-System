package com.sssit.bikerental.modules.verification.aadhaar.qr;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Component;

import com.google.zxing.Result;
import com.sssit.bikerental.modules.verification.common.util.RobustQRDecoder;

/**
 * Reads QR Code from Aadhaar Image.
 *
 * Delegates the actual locate-and-decode work to RobustQRDecoder,
 * which tries multiple rotations/scales/tiles/binarizers before
 * giving up - a single default ZXing decode() pass misses a large
 * fraction of genuine phone-camera Aadhaar photos.
 */
@Component
public class QRCodeReader {

    /**
     * Simple holder for a decode attempt: the ZXing Result (null if
     * no QR found) plus the pixel dimensions of the image that was
     * scanned, so callers can build a useful diagnostic message even
     * on failure.
     */
    public static class Outcome {

        private final Result result;
        private final int imageWidth;
        private final int imageHeight;

        public Outcome(Result result, int imageWidth, int imageHeight) {
            this.result = result;
            this.imageWidth = imageWidth;
            this.imageHeight = imageHeight;
        }

        public Result getResult() {
            return result;
        }

        public int getImageWidth() {
            return imageWidth;
        }

        public int getImageHeight() {
            return imageHeight;
        }
    }

    /**
     * Decodes the image once and returns the full outcome (ZXing
     * Result + image dimensions), so callers that need both don't
     * have to pay for two separate decode passes.
     */
    public Outcome decode(File imageFile) {

        try {

            BufferedImage image = ImageIO.read(imageFile);

            if (image == null) {
                return new Outcome(null, 0, 0);
            }

            Result result = RobustQRDecoder.decode(image);

            return new Outcome(result, image.getWidth(), image.getHeight());

        } catch (IOException e) {

            throw new RuntimeException("Unable to read image.", e);
        }
    }

    /**
     * @param imageFile Uploaded Aadhaar Image
     * @return QR Text, or null if no QR code was found in the image
     */
    public String readQRCode(File imageFile) {

        Result result = decode(imageFile).getResult();
        return result != null ? result.getText() : null;
    }

    /**
     * Reads the RAW bytes encoded in the QR code (before any text/charset
     * interpretation). Aadhaar Secure QR codes are byte-mode QR codes
     * containing a compressed, digitally-signed binary payload - the
     * plain text() output can lose fidelity, so signature verification
     * must be done against these raw bytes.
     *
     * @param imageFile Uploaded Aadhaar Image
     * @return raw QR bytes, or null if no QR found / not byte-mode
     */
    public byte[] readQRCodeRawBytes(File imageFile) {

        Result result = decode(imageFile).getResult();
        return result != null ? result.getRawBytes() : null;
    }

}
