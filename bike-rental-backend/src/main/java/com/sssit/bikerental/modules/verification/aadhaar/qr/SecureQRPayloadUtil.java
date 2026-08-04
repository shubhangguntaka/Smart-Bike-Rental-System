package com.sssit.bikerental.modules.verification.aadhaar.qr;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.Inflater;

/**
 * Shared low-level helpers for UIDAI's Aadhaar "Secure QR Code"
 * binary payload: Deflate decompression, and splitting the
 * decompressed bytes into its 0xFF-delimited fields.
 *
 * Package-private on purpose - used internally by BOTH
 * QRSignatureVerifier (which needs the decompressed bytes to check
 * the RSA signature) and QRParser (which needs the individual
 * name/dob/gender/address fields), so the two never drift out of
 * sync on how decompression works.
 */
final class SecureQRPayloadUtil {

    private SecureQRPayloadUtil() {
    }

    static byte[] decompress(byte[] compressed) throws Exception {

        Inflater inflater = new Inflater(true);
        inflater.setInput(compressed);

        ByteArrayOutputStream out = new ByteArrayOutputStream(compressed.length * 3);
        byte[] buffer = new byte[2048];

        while (!inflater.finished()) {

            int count = inflater.inflate(buffer);

            if (count == 0) {
                if (inflater.needsInput() || inflater.needsDictionary()) {
                    break;
                }
            }

            out.write(buffer, 0, count);
        }

        inflater.end();

        byte[] result = out.toByteArray();

        if (result.length == 0) {
            throw new IllegalStateException("Decompression produced no data.");
        }

        return result;
    }

    /**
     * Splits the decompressed Secure QR payload into its first
     * `fieldCount` fields, delimited by the byte value 0xFF (255).
     *
     * Scans byte-by-byte and STOPS as soon as `fieldCount` fields
     * have been collected. This deliberately never touches the
     * binary photo (JPEG2000) + RSA signature bytes that follow the
     * text fields - those routinely contain 0xFF bytes of their own
     * (JPEG marker bytes), which would corrupt a naive String.split()
     * run over the whole payload.
     */
    static String[] splitFields(byte[] payload, int fieldCount) {

        List<String> fields = new ArrayList<>();
        int start = 0;

        for (int i = 0; i < payload.length && fields.size() < fieldCount; i++) {

            if ((payload[i] & 0xFF) == 0xFF) {
                fields.add(new String(payload, start, i - start, StandardCharsets.UTF_8));
                start = i + 1;
            }
        }

        return fields.toArray(new String[0]);
    }
}
