package com.sssit.bikerental.modules.verification.aadhaar.qr;

import java.io.InputStream;
import java.security.PublicKey;
import java.security.Signature;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

/**
 * Verifies that an Aadhaar "Secure QR Code" was genuinely digitally
 * signed by UIDAI, using UIDAI's published offline-verification
 * public certificate.
 *
 * Format (UIDAI Secure QR Code spec):
 *   1. Raw QR bytes are Deflate-compressed.
 *   2. Decompressed bytes are a sequence of fields separated by the
 *      delimiter byte 0xFF (255), in a fixed order (version, refId,
 *      name, dob, gender, address fields, photo, ...).
 *   3. An RSA signature (SHA256withRSA) is appended as the LAST
 *      `signatureLength` bytes of the decompressed payload, where
 *      signatureLength = keySizeInBits / 8 (256 bytes for a 2048-bit
 *      key). The signature covers every byte that precedes it.
 *
 * IMPORTANT SETUP STEP (cannot be done for you automatically):
 * You must obtain UIDAI's official offline-verification public
 * certificate (a .cer / .pem file) from UIDAI's official resources
 * page and place it on the classpath at:
 *     src/main/resources/certs/uidai_offline_publickey.cer
 * (configurable via `aadhaar.qr.certificate.path`).
 * This tool cannot download that certificate for you - it must come
 * from UIDAI directly, since it's a trust anchor.
 *
 * Until the certificate is installed, verification is SKIPPED (not
 * treated as a hard failure) unless `aadhaar.qr.signature.strict=true`,
 * in which case a missing/invalid certificate or signature will
 * cause the QR to be treated as unverifiable/invalid.
 */
@Component
public class QRSignatureVerifier {

    private static final String SIGNATURE_ALGORITHM = "SHA256withRSA";

    @Value("${aadhaar.qr.certificate.path:classpath:certs/uidai_offline_publickey.cer}")
    private String certificatePath;

    @Value("${aadhaar.qr.signature.strict:false}")
    private boolean strictMode;

    public enum Status {
        VALID,              // signature present and cryptographically verified
        INVALID,            // signature present but verification FAILED
        NOT_CONFIGURED,     // UIDAI certificate not installed - can't verify
        NOT_SIGNED_QR,      // QR found, but doesn't look like a Secure QR payload
        NO_RAW_BYTES        // no raw QR bytes available to check at all
    }

    public static class Result {

        private final Status status;
        private final String message;

        public Result(Status status, String message) {
            this.status = status;
            this.message = message;
        }

        public Status getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }

        public boolean isStrictFailure(boolean strict) {

            if (status == Status.INVALID) {
                return true;
            }

            if (strict
                    && (status == Status.NOT_CONFIGURED
                    || status == Status.NOT_SIGNED_QR
                    || status == Status.NO_RAW_BYTES)) {
                return true;
            }

            return false;
        }
    }

    public boolean isStrictMode() {
        return strictMode;
    }

    public Result verify(byte[] rawQrBytes) {

        if (rawQrBytes == null || rawQrBytes.length == 0) {
            return new Result(
                    Status.NO_RAW_BYTES,
                    "No raw QR data available to verify.");
        }

        PublicKey publicKey;

        try {
            publicKey = loadUidaiPublicKey();
        } catch (Exception e) {
            return new Result(
                    Status.NOT_CONFIGURED,
                    "UIDAI verification certificate is not installed on this server "
                            + "(expected at " + certificatePath + "). "
                            + "QR signature could not be checked.");
        }

        byte[] payload;

        try {
            payload = decompress(rawQrBytes);
        } catch (Exception e) {
            // Some QR generators emit already-uncompressed bytes -
            // fall back to treating the raw bytes as the payload.
            payload = rawQrBytes;
        }

        int keyLengthBytes = estimateKeyLengthBytes(publicKey);

        if (payload.length <= keyLengthBytes) {
            return new Result(
                    Status.NOT_SIGNED_QR,
                    "QR payload too short to contain a valid UIDAI signature block.");
        }

        byte[] signedData =
                slice(payload, 0, payload.length - keyLengthBytes);

        byte[] signatureBytes =
                slice(payload, payload.length - keyLengthBytes, payload.length);

        try {

            Signature signature = Signature.getInstance(SIGNATURE_ALGORITHM);
            signature.initVerify(publicKey);
            signature.update(signedData);

            boolean valid = signature.verify(signatureBytes);

            if (valid) {
                return new Result(
                        Status.VALID,
                        "QR signature verified successfully against UIDAI certificate.");
            }

            return new Result(
                    Status.INVALID,
                    "QR signature does NOT match UIDAI's public certificate. "
                            + "This Aadhaar QR does not appear to be genuinely issued by UIDAI.");

        } catch (Exception e) {

            return new Result(
                    Status.NOT_SIGNED_QR,
                    "Could not evaluate QR signature: " + e.getMessage());
        }
    }

    //-----------------------------------
    // Helpers
    //-----------------------------------

    private PublicKey loadUidaiPublicKey() throws Exception {

        Resource resource = resolveResource(certificatePath);

        try (InputStream in = resource.getInputStream()) {

            CertificateFactory certificateFactory =
                    CertificateFactory.getInstance("X.509");

            Certificate certificate =
                    certificateFactory.generateCertificate(in);

            return certificate.getPublicKey();
        }
    }

    private Resource resolveResource(String location) throws Exception {

        PathMatchingResourcePatternResolver resolver =
                new PathMatchingResourcePatternResolver();

        Resource resource = resolver.getResource(location);

        if (!resource.exists()) {
            throw new IllegalStateException(
                    "UIDAI certificate not found at: " + location);
        }

        return resource;
    }

    private byte[] decompress(byte[] compressed) throws Exception {
        return SecureQRPayloadUtil.decompress(compressed);
    }

    private int estimateKeyLengthBytes(PublicKey publicKey) {

        if (publicKey instanceof java.security.interfaces.RSAPublicKey) {

            int bitLength =
                    ((java.security.interfaces.RSAPublicKey) publicKey)
                            .getModulus().bitLength();

            return (bitLength + 7) / 8;
        }

        // UIDAI certificates are RSA - default to 2048-bit (256 bytes)
        return 256;
    }

    private byte[] slice(byte[] source, int from, int to) {

        byte[] dest = new byte[to - from];

        System.arraycopy(source, from, dest, 0, to - from);

        return dest;
    }
}
