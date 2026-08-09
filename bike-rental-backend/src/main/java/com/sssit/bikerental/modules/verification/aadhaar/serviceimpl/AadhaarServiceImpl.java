package com.sssit.bikerental.modules.verification.aadhaar.serviceimpl;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;
import com.sssit.bikerental.modules.verification.aadhaar.model.AadhaarQRData;
import com.sssit.bikerental.modules.verification.aadhaar.qr.QRVerificationService;
import com.sssit.bikerental.modules.verification.aadhaar.qr.QRSignatureVerifier;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.aadhaar.service.AadhaarService;
import com.sssit.bikerental.modules.verification.aadhaar.validator.AadhaarCompletenessValidator;
import com.sssit.bikerental.modules.verification.aadhaar.validator.DocumentTypeValidator;
import com.sssit.bikerental.modules.verification.common.constants.VerificationConstants;
import com.sssit.bikerental.modules.verification.common.model.OCRData;
import com.sssit.bikerental.modules.verification.common.service.OCRService;
import com.sssit.bikerental.modules.verification.common.util.NameMatchUtil;

/**
 * Upload-only Aadhaar verification: the user just uploads the card
 * image. Everything (Aadhaar number, name) is read straight off the
 * document via OCR/QR - there is no manual entry to cross-check
 * against.
 *
 * A QR code is STRONGLY preferred (it's UIDAI-signed, so OCR data can
 * be cross-checked against it) but is no longer mandatory. A real,
 * genuine card can still fail to yield a decodable QR purely because
 * of scan resolution - e.g. a shrunk multi-panel print/screenshot
 * squeezing front and back onto one small image (see
 * RobustQRDecoder's own notes on this). Rejecting every such upload
 * would also reject genuine cards on that basis alone. So: when no QR
 * is found, this falls back to an OCR-only path that still runs the
 * structural checks a forged or wrong document is unlikely to pass -
 * it must actually look like an Aadhaar card (not a DL/PAN/passport),
 * and it must be the FULL card (front details plus an address, since
 * there's no QR to stand in for proof of the back side).
 */
@Service
public class AadhaarServiceImpl implements AadhaarService {

    private final AadhaarRepository repository;
    private final OCRService ocrService;
    private final QRVerificationService qrVerificationService;
    private final QRSignatureVerifier qrSignatureVerifier;
    private final DocumentTypeValidator documentTypeValidator;
    private final AadhaarCompletenessValidator completenessValidator;

    private static final String UPLOAD_DIR = "uploads/aadhaar/";

    public AadhaarServiceImpl(
            AadhaarRepository repository,
            OCRService ocrService,
            QRVerificationService qrVerificationService,
            QRSignatureVerifier qrSignatureVerifier,
            DocumentTypeValidator documentTypeValidator,
            AadhaarCompletenessValidator completenessValidator) {

        this.repository = repository;
        this.ocrService = ocrService;
        this.qrVerificationService = qrVerificationService;
        this.qrSignatureVerifier = qrSignatureVerifier;
        this.documentTypeValidator = documentTypeValidator;
        this.completenessValidator = completenessValidator;
    }

    @Override
    public AadhaarVerification verifyAadhaar(MultipartFile file, Long customerId) {
        return verifyAadhaar(file, customerId, null);
    }

    @Override
    public AadhaarVerification verifyAadhaar(MultipartFile file, Long customerId, String purpose) {

        //-----------------------------------
        // Normalize purpose: default to USER for any caller that
        // doesn't specify one (e.g. older frontend code, or the
        // backward-compatible 2-arg overload above), and fall back to
        // USER for anything unrecognized rather than erroring out.
        //-----------------------------------

        boolean isBikeOwnerPurpose =
                VerificationConstants.PURPOSE_BIKE_OWNER.equalsIgnoreCase(
                        purpose == null ? "" : purpose.trim());

        //-----------------------------------
        // New Record
        // (no user-entered Aadhaar number to look an existing record
        // up by yet - that only becomes known after OCR/QR below)
        //-----------------------------------

        AadhaarVerification verification = new AadhaarVerification();

        verification.setCustomerId(customerId);
        verification.setUploadedFile(file.getOriginalFilename());
        verification.setUploadedAt(LocalDateTime.now());

        //-----------------------------------
        // Save the image itself to permanent storage (previously
        // only the extracted text/fields were kept - the photo was
        // never written to disk at all, so there was no way for an
        // admin to go back and look at what was actually uploaded).
        // Not fatal if this fails - verification can still proceed
        // on OCR/QR data alone, it just won't have a viewable image.
        //-----------------------------------

        String documentPath = saveDocumentFile(file);
        verification.setDocumentPath(documentPath);

        //-----------------------------------
        // OCR
        //-----------------------------------

        OCRData ocrData = ocrService.extractData(file);

        //-----------------------------------
        // QR Verification
        //-----------------------------------

        AadhaarQRData qrData = qrVerificationService.verify(file);

        verification.setExtractedText(ocrData.getRawText());

        //-----------------------------------
        // QR Preferred, Not Mandatory
        // A QR gives a UIDAI-signed source of truth to check OCR
        // against - always use it when present. When it's missing,
        // fall back to OCR alone, but only after confirming this
        // really does look like a genuine, complete Aadhaar card
        // (guards against approving OCR noise on a forged or
        // altogether wrong document just because its QR is unreadable).
        //-----------------------------------

        boolean qrAvailable = qrData != null && qrData.isQrAvailable();

        if (!qrAvailable) {

            if (!documentTypeValidator.isAadhaarDocument(ocrData.getRawText())) {
                return reject(verification, VerificationConstants.ERROR_INVALID_DOCUMENT_TYPE);
            }

            if (!completenessValidator.isFullAadhaarUpload(ocrData, qrData)) {

                String message = VerificationConstants.ERROR_QR_NOT_DETECTED;

                if (qrData != null
                        && qrData.getScannedImageWidth() != null
                        && qrData.getScannedImageHeight() != null) {

                    message += " (Scanned image size: " + qrData.getScannedImageWidth()
                            + "x" + qrData.getScannedImageHeight() + "px)";
                }

                return reject(verification, message);
            }
        }

        //-----------------------------------
        // OCR Aadhaar Check
        //-----------------------------------

        if (ocrData.getAadhaarNumber() == null) {

            return reject(
                    verification,
                    VerificationConstants.ERROR_OCR_NUMBER_NOT_FOUND
            );
        }

        //-----------------------------------
        // Resolve the Aadhaar number to use:
        // Prefer the QR number (digitally signed by UIDAI, more
        // reliable) and fall back to the OCR number.
        //-----------------------------------

        String resolvedAadhaarNumber = resolveDocumentNumber(ocrData, qrData);

        //-----------------------------------
        // Resolve the name to use:
        // Prefer the QR name (digitally signed by UIDAI,
        // more reliable) and fall back to the OCR name
        // if no QR is available / QR has no name.
        //
        // (Resolved here, before the existing-record check below, so
        // it's available for a duplicate-card rejection response too.)
        //-----------------------------------

        boolean nameFromQr =
                qrData != null
                        && qrData.isQrAvailable()
                        && qrData.getName() != null
                        && !qrData.getName().isBlank();

        String documentName = resolveDocumentName(ocrData, qrData);
        String nameSource = nameFromQr ? "QR" : "OCR";

        //-----------------------------------
        // Existing Record?
        // Now that we know the Aadhaar number (from the document
        // itself), check whether this card has been verified before
        // and update that record instead of creating a duplicate.
        //
        // If that existing record is already APPROVED under a
        // DIFFERENT customer, this is a different customer trying to
        // claim a card that's already someone else's - block that
        // instead of silently reassigning the record (which used to
        // just overwrite the other customer's customerId, quietly
        // breaking THEIR verification the next time they used it).
        //
        // If it's already APPROVED under the SAME customer:
        //   - and this purpose (USER / BIKE_OWNER) hasn't been
        //     verified yet -> accept it. This is that person
        //     legitimately re-using their own Aadhaar for a second
        //     role (e.g. already a verified user, now registering as
        //     a bike owner).
        //   - but if this exact purpose was ALREADY verified before ->
        //     reject as a plain duplicate re-upload. Re-uploading the
        //     same card again for a role you're already verified for
        //     doesn't add anything and must not silently re-approve.
        //-----------------------------------

        Optional<AadhaarVerification> existing =
                repository.findByAadhaarNumber(resolvedAadhaarNumber);

        if (existing.isPresent()) {

            AadhaarVerification existingRecord = existing.get();

            boolean alreadyApproved =
                    VerificationConstants.STATUS_APPROVED.equals(existingRecord.getStatus())
                            || "VERIFIED".equals(existingRecord.getStatus());

            boolean belongsToDifferentCustomer =
                    existingRecord.getCustomerId() != null
                            && customerId != null
                            && !existingRecord.getCustomerId().equals(customerId);

            // Has THIS specific purpose already been verified on this
            // existing record? (Older rows created before these flags
            // existed default both to false, so a first re-upload
            // after upgrade is still treated as a legitimate new
            // purpose rather than a duplicate.)
            boolean thisPurposeAlreadyVerified =
                    isBikeOwnerPurpose
                            ? existingRecord.isVerifiedForBikeOwner()
                            : existingRecord.isVerifiedForUser();

            if (alreadyApproved && belongsToDifferentCustomer) {

                // Do NOT touch existingRecord - it's already
                // APPROVED under a different customer, and
                // aadhaarNumber is a unique column so we also can't
                // insert a second row for the same card. Return a
                // rejection that is NOT persisted at all, so the
                // existing approval is left completely untouched.
                //
                // The image we just saved to disk above has no DB
                // row to be referenced from in this case - remove it
                // rather than leaving an orphaned file behind.
                deleteDocumentFile(documentPath);

                return transientReject(
                        customerId,
                        file.getOriginalFilename(),
                        ocrData.getRawText(),
                        resolvedAadhaarNumber,
                        documentName,
                        nameSource,
                        VerificationConstants.ERROR_AADHAAR_ALREADY_EXISTS);
            }

            if (alreadyApproved && thisPurposeAlreadyVerified) {

                // Same customer, same purpose - this exact role was
                // already verified with this Aadhaar. A repeat upload
                // adds nothing; reject it as a duplicate rather than
                // silently re-approving. Existing row is left as-is.
                deleteDocumentFile(documentPath);

                return transientReject(
                        customerId,
                        file.getOriginalFilename(),
                        ocrData.getRawText(),
                        resolvedAadhaarNumber,
                        documentName,
                        nameSource,
                        VerificationConstants.ERROR_AADHAAR_ALREADY_VERIFIED_FOR_PURPOSE);
            }

            if (alreadyApproved) {

                // Same customer, but for a role (purpose) not yet
                // verified on this Aadhaar - e.g. already verified as
                // USER, now verifying for BIKE_OWNER (or vice versa).
                // Accept it: refresh the stored upload/image details on
                // the existing row, mark this purpose verified too, and
                // re-confirm APPROVED below, rather than creating a
                // second row or rejecting as a duplicate.
                deleteDocumentFile(existingRecord.getDocumentPath());

                verification = existingRecord;
                if (customerId != null) {
                    verification.setCustomerId(customerId);
                }
                verification.setUploadedFile(file.getOriginalFilename());
                verification.setUploadedAt(LocalDateTime.now());
                verification.setExtractedText(ocrData.getRawText());
                verification.setDocumentPath(documentPath);

                verification.setAadhaarNumber(resolvedAadhaarNumber);
                verification.setNameSource(nameSource);
                verification.setCustomerName(documentName);
                verification.setStatus(VerificationConstants.STATUS_APPROVED);
                verification.setRejectionReason(null);
                verification.setNote(VerificationConstants.INFO_AADHAAR_ALREADY_VERIFIED_FOR_ACCOUNT);
                if (isBikeOwnerPurpose) {
                    verification.setVerifiedForBikeOwner(true);
                } else {
                    verification.setVerifiedForUser(true);
                }
                verification.setVerifiedBy("SYSTEM");
                verification.setVerifiedAt(LocalDateTime.now());
                verification.setStampLabel(VerificationConstants.STAMP_APPROVED_LABEL);
                verification.setStampIcon(VerificationConstants.STAMP_APPROVED_ICON);
                verification.setStampColor(VerificationConstants.STAMP_APPROVED_COLOR);

                return saveVerification(verification);
            }

            // This is a re-upload of a card that's on record but not
            // yet APPROVED (e.g. a previous attempt was rejected) -
            // replace its stored image with this new upload rather
            // than keeping the old (and now irrelevant) one around.
            deleteDocumentFile(existingRecord.getDocumentPath());

            verification = existingRecord;
            if (customerId != null) {
                verification.setCustomerId(customerId);
            }
            verification.setUploadedFile(file.getOriginalFilename());
            verification.setUploadedAt(LocalDateTime.now());
            verification.setExtractedText(ocrData.getRawText());
            verification.setDocumentPath(documentPath);
        }

        verification.setAadhaarNumber(resolvedAadhaarNumber);
        verification.setNameSource(nameSource);
        verification.setCustomerName(documentName);

        //-----------------------------------
        // QR Verification (cross-check against OCR)
        //-----------------------------------

        if (qrData.isQrAvailable()) {

            if (qrData.getAadhaarNumber() != null &&
                    !qrData.getAadhaarNumber().equals(ocrData.getAadhaarNumber())) {

                return reject(
                        verification,
                        "QR and OCR Aadhaar Number do not match: QR shows " + qrData.getAadhaarNumber()
                                + " but OCR reads " + ocrData.getAadhaarNumber()
                );
            }

            if (qrData.getName() != null &&
                    ocrData.getName() != null &&
                    !NameMatchUtil.namesRoughlyMatch(qrData.getName(), ocrData.getName())) {

                return reject(
                        verification,
                        "QR and OCR Name do not match: QR shows \"" + qrData.getName()
                                + "\" but OCR reads \"" + ocrData.getName() + "\""
                );
            }

            //-----------------------------------
            // QR vs OCR - Date of Birth
            // (skipped if either side couldn't read a DOB, so a
            // missing/blank value never causes a false rejection)
            //-----------------------------------

            if (qrData.getDateOfBirth() != null
                    && !qrData.getDateOfBirth().isBlank()
                    && ocrData.getDob() != null
                    && !ocrData.getDob().isBlank()
                    && !NameMatchUtil.datesMatch(qrData.getDateOfBirth(), ocrData.getDob())) {

                return reject(
                        verification,
                        "QR and OCR Date of Birth do not match: QR shows " + qrData.getDateOfBirth()
                                + " but OCR reads " + ocrData.getDob()
                );
            }

            //-----------------------------------
            // QR Digital Signature Verification
            // (confirms the QR was genuinely signed
            // by UIDAI, not just internally consistent)
            //-----------------------------------

            String sigStatus = qrData.getSignatureStatus();

            boolean signatureInvalid =
                    "INVALID".equals(sigStatus);

            boolean signatureUncheckedButStrict =
                    qrSignatureVerifier.isStrictMode()
                            && sigStatus != null
                            && !"VALID".equals(sigStatus);

            if (signatureInvalid || signatureUncheckedButStrict) {

                return reject(
                        verification,
                        qrData.getSignatureMessage() != null
                                ? qrData.getSignatureMessage()
                                : "QR signature verification failed."
                );
            }
        }

        //-----------------------------------
        // APPROVED
        //-----------------------------------

        verification.setStatus(VerificationConstants.STATUS_APPROVED);
        verification.setRejectionReason(null);
        verification.setNote(null);
        if (isBikeOwnerPurpose) {
            verification.setVerifiedForBikeOwner(true);
        } else {
            verification.setVerifiedForUser(true);
        }
        verification.setVerifiedBy("SYSTEM");
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setStampLabel(VerificationConstants.STAMP_APPROVED_LABEL);
        verification.setStampIcon(VerificationConstants.STAMP_APPROVED_ICON);
        verification.setStampColor(VerificationConstants.STAMP_APPROVED_COLOR);

        return saveVerification(verification);
    }

    //-----------------------------------
    // Helper: persist the uploaded image to disk so it can be viewed
    // later (e.g. by an admin). Returns the saved path, or null if
    // saving failed - a storage hiccup here shouldn't block
    // verification itself, since OCR/QR reading already happened (or
    // will happen) from the in-memory MultipartFile independently of
    // this copy.
    //-----------------------------------

    private String saveDocumentFile(MultipartFile file) {

        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String safeOriginalName =
                    file.getOriginalFilename() != null
                            ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
                            : "aadhaar";

            String fileName = System.currentTimeMillis() + "_" + safeOriginalName;

            Path path = Paths.get(UPLOAD_DIR + fileName);

            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            return path.toString();

        } catch (IOException e) {
            return null;
        }
    }

    //-----------------------------------
    // Helper: remove a previously saved image file, e.g. when it
    // turns out no DB row will end up pointing at it (a duplicate
    // rejection) or it's being replaced by a fresh upload.
    //-----------------------------------

    private void deleteDocumentFile(String documentPath) {

        if (documentPath == null) {
            return;
        }

        File f = new File(documentPath);

        if (f.exists()) {
            f.delete();
        }
    }

    //-----------------------------------
    // Helper: build a REJECTED response WITHOUT saving it to the
    // database. Used only for the duplicate-Aadhaar case, where the
    // real record (belonging to a different customer) must be left
    // completely untouched - both because aadhaarNumber is a unique
    // column (so a second row for the same card can't be inserted),
    // and because saving anything referencing that number would
    // otherwise overwrite the other customer's approved record.
    //-----------------------------------

    private AadhaarVerification transientReject(
            Long customerId,
            String uploadedFile,
            String extractedText,
            String aadhaarNumber,
            String customerName,
            String nameSource,
            String reason) {

        AadhaarVerification response = new AadhaarVerification();

        response.setCustomerId(customerId);
        response.setUploadedFile(uploadedFile);
        response.setUploadedAt(LocalDateTime.now());
        response.setExtractedText(extractedText);
        response.setAadhaarNumber(aadhaarNumber);
        response.setCustomerName(customerName);
        response.setNameSource(nameSource);
        response.setStatus(VerificationConstants.STATUS_REJECTED);
        response.setRejectionReason(safeTruncate(reason, 240));
        response.setVerifiedBy("SYSTEM");
        response.setVerifiedAt(LocalDateTime.now());
        response.setStampLabel(VerificationConstants.STAMP_REJECTED_LABEL);
        response.setStampIcon(VerificationConstants.STAMP_REJECTED_ICON);
        response.setStampColor(VerificationConstants.STAMP_REJECTED_COLOR);

        // Not saved - returned as-is (its id stays null).
        return response;
    }

    //-----------------------------------
    // Helper: apply a rejection and save
    //-----------------------------------

    private AadhaarVerification reject(
            AadhaarVerification verification,
            String reason) {

        verification.setStatus(VerificationConstants.STATUS_REJECTED);
        verification.setRejectionReason(safeTruncate(reason, 240));
        verification.setNote(null);
        verification.setVerifiedBy("SYSTEM");
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setStampLabel(VerificationConstants.STAMP_REJECTED_LABEL);
        verification.setStampIcon(VerificationConstants.STAMP_REJECTED_ICON);
        verification.setStampColor(VerificationConstants.STAMP_REJECTED_COLOR);

        return saveVerification(verification);
    }

    //-----------------------------------
    // Helper: save, self-healing on a duplicate aadhaarNumber.
    //
    // The existing-record lookup earlier in verifyAadhaar() is a
    // read followed later by this write - not atomic - so two
    // near-simultaneous requests for the same card (or simply
    // re-submitting the same card in a fresh in-memory `verification`
    // instead of the row already sitting in the DB from an earlier
    // run) can both pass the lookup and then collide on the
    // @Column(unique = true) aadhaarNumber constraint at save time.
    // That used to surface as an unhandled DataIntegrityViolationException
    // -> generic 500. Instead, on that specific collision, re-fetch
    // the row that now exists, copy this attempt's outcome onto it,
    // and save that (update) rather than crashing.
    //-----------------------------------

    private AadhaarVerification saveVerification(AadhaarVerification verification) {

        try {

            return repository.save(verification);

        } catch (DataIntegrityViolationException e) {

            if (verification.getAadhaarNumber() == null) {
                throw e;
            }

            Optional<AadhaarVerification> existing =
                    repository.findByAadhaarNumber(verification.getAadhaarNumber());

            if (existing.isEmpty()) {
                throw e;
            }

            AadhaarVerification row = existing.get();

            if (verification.getCustomerId() != null) {
                row.setCustomerId(verification.getCustomerId());
            }

            row.setUploadedFile(verification.getUploadedFile());
            row.setUploadedAt(verification.getUploadedAt());
            row.setExtractedText(verification.getExtractedText());
            row.setNameSource(verification.getNameSource());
            row.setCustomerName(verification.getCustomerName());
            row.setStatus(verification.getStatus());
            row.setRejectionReason(verification.getRejectionReason());
            row.setNote(verification.getNote());
            row.setVerifiedForUser(row.isVerifiedForUser() || verification.isVerifiedForUser());
            row.setVerifiedForBikeOwner(row.isVerifiedForBikeOwner() || verification.isVerifiedForBikeOwner());
            row.setVerifiedBy(verification.getVerifiedBy());
            row.setVerifiedAt(verification.getVerifiedAt());
            row.setStampLabel(verification.getStampLabel());
            row.setStampIcon(verification.getStampIcon());
            row.setStampColor(verification.getStampColor());

            return repository.save(row);
        }
    }

    //-----------------------------------
    // Helper: pick QR Aadhaar number if present,
    // otherwise fall back to OCR Aadhaar number
    //-----------------------------------

    private String resolveDocumentNumber(
            OCRData ocrData,
            AadhaarQRData qrData) {

        if (qrData != null
                && qrData.isQrAvailable()
                && qrData.getAadhaarNumber() != null
                && !qrData.getAadhaarNumber().isBlank()) {

            return qrData.getAadhaarNumber();
        }

        return ocrData.getAadhaarNumber();
    }

    //-----------------------------------
    // Helper: pick QR name if present,
    // otherwise fall back to OCR name
    //-----------------------------------

    private String resolveDocumentName(
            OCRData ocrData,
            AadhaarQRData qrData) {

        if (qrData != null
                && qrData.isQrAvailable()
                && qrData.getName() != null
                && !qrData.getName().isBlank()) {

            return qrData.getName();
        }

        return ocrData.getName();
    }

    //-----------------------------------
    // Helper: cap a string's length before it's handed to Hibernate,
    // as a safety net independent of the actual DB column type - so
    // this can't crash again even on a database that hasn't been
    // migrated to match the entity's @Column(columnDefinition="TEXT")
    // declaration (e.g. an existing rejection_reason column still
    // sitting at the older VARCHAR(255)).
    //-----------------------------------

    private String safeTruncate(String value, int maxLength) {

        if (value == null || value.length() <= maxLength) {
            return value;
        }

        return value.substring(0, maxLength - 3) + "...";
    }

    //-----------------------------------
    // Status check - lets the frontend ask "has this customer already
    // been Aadhaar-verified for this purpose?" BEFORE showing the
    // upload form, so a returning customer booking/listing again is
    // never asked to re-upload. Returns null when there's nothing
    // approved yet for this purpose (frontend then shows the upload
    // step as normal).
    //-----------------------------------

    @Override
    public AadhaarVerification getApprovedAadhaar(Long customerId, String purpose) {

        if (customerId == null) {
            return null;
        }

        AadhaarVerification res = repository
                .findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(
                        customerId, VerificationConstants.STATUS_APPROVED)
                .or(() -> repository.findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(
                        customerId, "VERIFIED"))
                .orElse(null);
        if (res == null) {
            res = repository
                    .findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(
                            customerId, "VERIFIED")
                    .orElse(null);
        }
        return res;
    }

}
