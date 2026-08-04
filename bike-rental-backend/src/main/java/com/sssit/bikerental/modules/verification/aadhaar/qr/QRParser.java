package com.sssit.bikerental.modules.verification.aadhaar.qr;

import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.verification.aadhaar.model.AadhaarQRData;

/**
 * Parses the data out of a decoded Aadhaar QR.
 *
 * A real (post-2017) Aadhaar "Secure QR Code" is NOT plain text - the
 * raw QR bytes are Deflate-compressed, and the decompressed payload
 * is a sequence of fields separated by the byte 0xFF, in a fixed
 * order, followed by an embedded photo and an RSA signature (see
 * QRSignatureVerifier, which already understands this for signature
 * checking). Field extraction now uses that same real structure -
 * previously this class only searched the ZXing library's lossy TEXT
 * conversion of those raw bytes for literal "Name: ..." style lines,
 * which never actually appear in a real Secure QR and meant
 * name/gender/address from the QR were always blank in practice,
 * silently falling back to (much less reliable) OCR everywhere they
 * were used.
 */
@Component
public class QRParser {

    private static final Logger log = LoggerFactory.getLogger(QRParser.class);

    // Field order per UIDAI's published "Aadhaar Secure QR Code" V2
    // spec.
    private static final int FIELD_EMAIL_MOBILE_STATUS = 0;
    private static final int FIELD_REFERENCE_ID = 1;
    private static final int FIELD_NAME = 2;
    private static final int FIELD_DOB = 3;
    private static final int FIELD_GENDER = 4;
    private static final int FIELD_CARE_OF = 5;
    private static final int FIELD_DISTRICT = 6;
    private static final int FIELD_LANDMARK = 7;
    private static final int FIELD_HOUSE = 8;
    private static final int FIELD_LOCATION = 9;
    private static final int FIELD_PINCODE = 10;
    private static final int FIELD_POST_OFFICE = 11;
    private static final int FIELD_STATE = 12;
    private static final int FIELD_SUB_DISTRICT = 13;
    private static final int FIELD_VTC = 14;
    private static final int FIELD_STREET = 15;
    private static final int FIELD_COUNT = 16;

    // Legacy fallback pattern, kept for QR payloads that AREN'T a
    // real compressed Secure QR (e.g. hand-built test data, or a
    // pre-2017 plain-text Aadhaar QR).
    private static final Pattern AADHAAR_PATTERN =
            Pattern.compile("\\b\\d{4}\\s?\\d{4}\\s?\\d{4}\\b");

    private static final Pattern DOB_PATTERN =
            Pattern.compile("\\b\\d{2}[-/]\\d{2}[-/]\\d{4}\\b");

    /**
     * @param qrText   the ZXing-decoded TEXT of the QR - kept only for
     *                 the Aadhaar-number regex fallback (a real
     *                 Secure QR doesn't reliably contain the full
     *                 number as plain text; this has just been
     *                 observed to work on documents tested so far)
     *                 and for the legacy plain-text field format.
     * @param rawBytes the RAW undecoded QR bytes - required to
     *                 properly decompress and field-split a real
     *                 Secure QR v2 payload. Preferred source for
     *                 name/dob/gender/address whenever present.
     */
    public AadhaarQRData parse(String qrText, byte[] rawBytes) {

        AadhaarQRData data = new AadhaarQRData();

        boolean hasText = qrText != null && !qrText.isBlank();
        boolean hasBytes = rawBytes != null && rawBytes.length > 0;

        if (!hasText && !hasBytes) {
            data.setQrAvailable(false);
            data.setQrValid(false);
            return data;
        }

        data.setQrAvailable(true);
        data.setRawQRText(qrText);

        //--------------------------
        // Preferred path: real UIDAI Secure QR v2 binary payload.
        // Fills in whatever fields it can - a partial result here is
        // still far more trustworthy than OCR for the fields it does
        // find, since this data is the digitally-signed source of
        // truth being checked by QRSignatureVerifier.
        //--------------------------

        boolean looksLikeSecureQr = tryParseSecureQrFields(rawBytes, data);

        //--------------------------
        // Aadhaar Number
        //--------------------------

        if (hasText) {

            Matcher aadhaarMatcher = AADHAAR_PATTERN.matcher(qrText);

            if (aadhaarMatcher.find()) {
                data.setAadhaarNumber(aadhaarMatcher.group().replaceAll("\\s", ""));
            }
        }

        //--------------------------
        // Fallback: legacy plain-text QR ("Name: X" style lines).
        // Only fills in whatever the Secure QR field-split above
        // didn't already provide.
        //--------------------------

        if (!looksLikeSecureQr && hasText) {
            parseLegacyPlainTextFields(qrText, data);
        }

        if (data.getDateOfBirth() == null && hasText) {

            Matcher dobMatcher = DOB_PATTERN.matcher(qrText);

            if (dobMatcher.find()) {
                data.setDateOfBirth(dobMatcher.group());
            }
        }

        data.setQrValid(true);

        return data;
    }

    /**
     * @return true if the payload decompressed into something that
     *         actually looks like a Secure QR v2 field layout (i.e.
     *         at least FIELD_COUNT delimited fields were found) -
     *         regardless of whether every individual field happened
     *         to be non-blank.
     */
    private boolean tryParseSecureQrFields(byte[] rawBytes, AadhaarQRData data) {

        if (rawBytes == null || rawBytes.length == 0) {
            return false;
        }

        byte[] payload;

        try {
            payload = SecureQRPayloadUtil.decompress(rawBytes);
        } catch (Exception e) {
            // Some QR generators emit already-uncompressed bytes.
            payload = rawBytes;
        }

        String[] fields = SecureQRPayloadUtil.splitFields(payload, FIELD_COUNT);

        if (fields.length < FIELD_COUNT) {

            log.info("QR payload does not look like a Secure QR v2 field layout "
                            + "({} of {} fields found, rawBytes={}, decompressedBytes={}) "
                            + "- falling back to legacy parsing.",
                    fields.length, FIELD_COUNT, rawBytes.length, payload.length);

            return false;
        }

        log.info("Secure QR fields decoded ({} bytes decompressed): name='{}', dob='{}', gender='{}'",
                payload.length, fields[FIELD_NAME], fields[FIELD_DOB], fields[FIELD_GENDER]);

        setIfPresent(fields[FIELD_NAME], data::setName);
        setIfPresent(fields[FIELD_DOB], data::setDateOfBirth);
        setIfPresent(fields[FIELD_GENDER], data::setGender);

        String address = buildAddress(fields);

        if (address != null && !address.isBlank()) {
            data.setAddress(address);
        }

        return true;
    }

    private String buildAddress(String[] fields) {

        StringBuilder sb = new StringBuilder();

        appendIfPresent(sb, fields[FIELD_CARE_OF]);
        appendIfPresent(sb, fields[FIELD_HOUSE]);
        appendIfPresent(sb, fields[FIELD_STREET]);
        appendIfPresent(sb, fields[FIELD_LANDMARK]);
        appendIfPresent(sb, fields[FIELD_LOCATION]);
        appendIfPresent(sb, fields[FIELD_VTC]);
        appendIfPresent(sb, fields[FIELD_SUB_DISTRICT]);
        appendIfPresent(sb, fields[FIELD_DISTRICT]);
        appendIfPresent(sb, fields[FIELD_POST_OFFICE]);
        appendIfPresent(sb, fields[FIELD_STATE]);
        appendIfPresent(sb, fields[FIELD_PINCODE]);

        if (sb.length() == 0) {
            return null;
        }

        // Trim the trailing ", " separator left by appendIfPresent.
        return sb.substring(0, sb.length() - 2).trim();
    }

    private void appendIfPresent(StringBuilder sb, String value) {

        if (value != null && !value.isBlank()) {
            sb.append(value.trim()).append(", ");
        }
    }

    private void setIfPresent(String value, Consumer<String> setter) {

        if (value != null && !value.isBlank()) {
            setter.accept(value.trim());
        }
    }

    private void parseLegacyPlainTextFields(String qrText, AadhaarQRData data) {

        String[] lines = qrText.split("\\r?\\n");

        for (String line : lines) {

            line = line.trim();

            if (line.toLowerCase().startsWith("name") && data.getName() == null) {

                String[] split = line.split(":", 2);

                if (split.length == 2) {
                    data.setName(split[1].trim());
                }
            }

            if (line.toLowerCase().startsWith("gender") && data.getGender() == null) {

                String[] split = line.split(":", 2);

                if (split.length == 2) {
                    data.setGender(split[1].trim());
                }
            }

            if (line.toLowerCase().startsWith("address") && data.getAddress() == null) {

                String[] split = line.split(":", 2);

                if (split.length == 2) {
                    data.setAddress(split[1].trim());
                }
            }
        }
    }
}
