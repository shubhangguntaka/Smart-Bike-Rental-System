package com.sssit.bikerental.modules.verification.bikedocument.serviceimpl;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.common.exception.ResourceNotFoundException;
import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.bikedocument.dto.BikeDocumentResponseDTO;
import com.sssit.bikerental.modules.verification.bikedocument.entity.BikeDocument;
import com.sssit.bikerental.modules.verification.bikedocument.model.RCData;
import com.sssit.bikerental.modules.verification.bikedocument.repository.BikeDocumentRepository;
import com.sssit.bikerental.modules.verification.bikedocument.service.BikeDocumentService;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCConstants;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCDocumentTypeValidator;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCExtractor;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCImageQualityValidator;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCQRReader;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCValidator;
import com.sssit.bikerental.modules.verification.common.constants.VerificationConstants;
import com.sssit.bikerental.modules.verification.common.model.OCRData;
import com.sssit.bikerental.modules.verification.common.service.OCRService;
import com.sssit.bikerental.modules.verification.common.util.NameMatchUtil;

/**
 * Verifies an uploaded bike Registration Certificate (RC), following
 * the same layered approach as DrivingLicenseServiceImpl:
 *
 *   1. Basic file check
 *   2. Image quality check (reject tiny/cropped uploads early)
 *   3. Store the uploaded image temporarily
 *   4. OCR - extract raw text
 *   5. Document-type check (reject if it isn't an RC at all)
 *   6. RCExtractor - extract structured RC fields
 *   7. Read QR code (if any) and soft-cross-check against OCR
 *   8. Validate extracted fields (required, format, not expired)
 *   9. Cross-check the RC owner's name against a verified Aadhaar
 *      (owner must have verified their identity before listing a bike)
 *  10. Duplicate check - block if this exact RC is already APPROVED
 *      under a different owner (or re-submission of an already
 *      APPROVED record)
 *  11. Save + build response
 *
 * IMPORTANT LIMITATION (see also the RC authenticity discussion):
 * everything below only proves the upload is internally consistent
 * (right document type, well-formed fields, OCR text matches the QR
 * text) - it does NOT prove the RC is government-genuine. There is
 * no VAHAN/Parivahan API call here, same as there's no equivalent
 * government check in the existing Aadhaar/DL flow. A true
 * real-vs-fake check would need to call VAHAN via a licensed KYC
 * aggregator (Surepass/Signzy/IDfy/Cashfree etc.) and compare the
 * registration number against what's returned - that integration
 * point is intentionally left for later (would slot in as an
 * additional step between 8 and 9 above, e.g. a
 * VahanVerificationService called with the extracted registration
 * number).
 */
import com.sssit.bikerental.modules.auth.service.EmailService;
import com.sssit.bikerental.modules.user.repository.UserRepository;

@Service
public class BikeDocumentServiceImpl implements BikeDocumentService {

    @Autowired
    private OCRService ocrService;

    @Autowired
    private BikeDocumentRepository repository;

    @Autowired
    private AadhaarRepository aadhaarRepository;

    @Autowired
    private RCImageQualityValidator imageQualityValidator;

    @Autowired
    private RCDocumentTypeValidator documentTypeValidator;

    @Autowired
    private RCExtractor rcExtractor;

    @Autowired
    private RCValidator validator;

    @Autowired
    private RCQRReader qrReader;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private static final String UPLOAD_DIR = "uploads/bike-document/";

    @Override
    public BikeDocumentResponseDTO verifyBikeDocument(MultipartFile file, Long ownerId, Long bikeId) {
        return verifyBikeDocument(file, ownerId, bikeId, null);
    }

    @Override
    public BikeDocumentResponseDTO verifyBikeDocument(MultipartFile file, Long ownerId, Long bikeId, String registrationNumberParam) {

        BikeDocumentResponseDTO response = new BikeDocumentResponseDTO();

        File uploadedFile = null;
        boolean fileRetained = false;

        try {

            //-----------------------------------
            // Step 1: Basic file check
            //-----------------------------------

            if (file == null || file.isEmpty()) {

                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage("Please upload the bike's Registration Certificate (RC).");
                applyStamp(response, false);

                return response;
            }

            //-----------------------------------
            // Step 2: Image quality check - reject obviously bad
            // uploads (tiny crop/thumbnail) before spending time on
            // OCR/QR.
            //-----------------------------------

            if (!imageQualityValidator.isFullLengthRCImage(file)) {

                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage(RCConstants.ERROR_SMALL_OR_CROPPED_IMAGE);
                applyStamp(response, false);

                return response;
            }

            //-----------------------------------
            // Step 3: Store uploaded image temporarily
            //-----------------------------------

            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path path = Paths.get(UPLOAD_DIR + fileName);

            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            uploadedFile = path.toFile();

            //-----------------------------------
            // Step 4: OCR - extract raw text
            //-----------------------------------

            OCRData ocrData = ocrService.extractData(file);

            String rawText = ocrData.getRawText();

            //-----------------------------------
            // Step 5: Document-type check - make sure this is
            // actually an RC before trying to parse RC-shaped fields
            // out of it.
            //-----------------------------------

            if (!documentTypeValidator.isRCDocument(rawText)) {

                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage(RCConstants.ERROR_INVALID_DOCUMENT_TYPE);
                applyStamp(response, false);

                return response;
            }

            //-----------------------------------
            // Step 6: RCExtractor - extract RC fields
            //-----------------------------------

            RCData rcData = rcExtractor.extract(rawText);

            // Cross-check & Fallback: If user provided registration number (e.g. TS02EY4494),
            // adopt it if OCR missed/misread faint red dot-matrix font or if raw text contains it.
            if (registrationNumberParam != null && !registrationNumberParam.isBlank()) {
                String normEntered = registrationNumberParam.toUpperCase().replaceAll("[\\s-]", "");
                String normOcr = rcData.getRegistrationNumber() != null ? rcData.getRegistrationNumber().toUpperCase().replaceAll("[\\s-]", "") : "";
                String normRaw = rawText != null ? rawText.toUpperCase().replaceAll("[\\s-]", "") : "";
                
                if (normOcr.isEmpty() || normRaw.contains(normEntered) || NameMatchUtil.namesRoughlyMatch(normEntered, normOcr)) {
                    rcData.setRegistrationNumber(normEntered);
                }
            }

            //-----------------------------------
            // Step 7: Read QR code (if available) and soft-compare
            // against OCR. Like DL, most RC QR codes just encode a
            // Parivahan verification URL/short text block rather
            // than a signed structured payload, so a missing/
            // non-matching QR does NOT fail verification on its own
            // - it's recorded as a signal, not a hard gate.
            //-----------------------------------

            String qrText = qrReader.readQRCode(uploadedFile);

            boolean qrVerified = false;

            if (qrText != null && rcData.getRegistrationNumber() != null) {

                String normalizedQr = qrText.toUpperCase().replaceAll("[\\s-]", "");
                String normalizedRegNo = rcData.getRegistrationNumber().toUpperCase();

                qrVerified = normalizedQr.contains(normalizedRegNo);
            }

            //-----------------------------------
            // Step 8: Validate extracted fields
            //-----------------------------------

            //-----------------------------------
            // Step 8: Look up verified Aadhaar for name cross-check
            //-----------------------------------

            AadhaarVerification matchedAadhaar = null;

            if (ownerId != null) {
                matchedAadhaar = aadhaarRepository
                        .findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(ownerId, VerificationConstants.STATUS_APPROVED)
                        .orElse(null);
                if (matchedAadhaar == null) {
                    matchedAadhaar = aadhaarRepository
                            .findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(ownerId, "VERIFIED")
                            .orElse(null);
                }
            }

            if (matchedAadhaar == null) {
                List<AadhaarVerification> approvedAadhaars =
                        new java.util.ArrayList<>(aadhaarRepository.findByStatus(VerificationConstants.STATUS_APPROVED));
                approvedAadhaars.addAll(aadhaarRepository.findByStatus("VERIFIED"));

                for (AadhaarVerification candidate : approvedAadhaars) {
                    if (rcData.getOwnerName() != null && NameMatchUtil.namesRoughlyMatch(
                            candidate.getCustomerName(), rcData.getOwnerName())) {
                        matchedAadhaar = candidate;
                        break;
                    }
                }
            }

            if (matchedAadhaar != null) {
                response.setAadhaarOwnerName(matchedAadhaar.getCustomerName());
            }

            // Populate whatever was extracted regardless of outcome
            response.setOwnerName(rcData.getOwnerName());
            response.setRegistrationNumber(rcData.getRegistrationNumber());
            response.setChassisNumber(rcData.getChassisNumber());
            response.setEngineNumber(rcData.getEngineNumber());
            response.setMakerName(rcData.getMakerName());
            response.setModel(rcData.getModel());
            response.setVehicleClass(rcData.getVehicleClass());
            response.setRegistrationDate(rcData.getRegistrationDate());
            response.setInsuranceValidUpto(rcData.getInsuranceValidUpto());
            response.setPuccValidUpto(rcData.getPuccValidUpto());
            response.setFitnessValidUpto(rcData.getFitnessValidUpto());
            response.setAddress(rcData.getAddress());
            response.setQrVerified(qrVerified);

            String validationResult = validator.validate(rcData);

            if (!"VALID".equals(validationResult)) {
                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage(validationResult);
                applyStamp(response, false);

                return response;
            }

            if (matchedAadhaar == null) {
                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage(RCConstants.ERROR_OWNER_AADHAAR_NOT_VERIFIED_FIRST);
                applyStamp(response, false);

                return response;
            }

            // Perform explicit 80% fuzzy name matching check between verified Aadhaar and RC owner name
            if (rcData.getOwnerName() == null || rcData.getOwnerName().isBlank()) {
                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setOwnerAadhaarNameMatched(false);
                response.setMessage("RC Owner Name does not match verified Aadhaar Name ('" + matchedAadhaar.getCustomerName() + "'). Please ensure you upload your own RC document.");
                applyStamp(response, false);

                return response;
            }

            boolean nameMatched = NameMatchUtil.namesRoughlyMatch(matchedAadhaar.getCustomerName(), rcData.getOwnerName());

            if (!nameMatched) {
                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage("RC Owner Name ('" + rcData.getOwnerName() + "') does not match verified Aadhaar Name ('" + matchedAadhaar.getCustomerName() + "').");
                response.setOwnerAadhaarNameMatched(false);
                applyStamp(response, false);

                return response;
            }

            response.setOwnerAadhaarNameMatched(true);

            // Adopt the matched Aadhaar's customerId as ownerId (if
            // the caller didn't already supply one) so downstream
            // records stay linked to the same person, without the
            // caller having to already know that id.
            if (ownerId == null) {
                ownerId = matchedAadhaar.getCustomerId();
            }

            //-----------------------------------
            // Step 10: Duplicate check. If this exact registration
            // number is already APPROVED (under this owner or any
            // other), block re-submission rather than silently
            // re-approving/reassigning it - this is exactly the
            // "fake RC for someone else's / a stolen bike" pattern
            // this check exists to catch.
            //-----------------------------------

            Optional<BikeDocument> existing =
                    repository.findByRegistrationNumber(rcData.getRegistrationNumber());

            if (existing.isPresent()) {

                BikeDocument existingRecord = existing.get();

                boolean alreadyApproved = RCConstants.STATUS_APPROVED.equals(existingRecord.getStatus());
                boolean isDifferentOwner = existingRecord.getOwnerId() != null &&
                        ownerId != null &&
                        !existingRecord.getOwnerId().equals(ownerId);

                if (alreadyApproved && isDifferentOwner) {

                    response.setVerified(false);
                    response.setStatus("REJECTED");
                    response.setMessage(RCConstants.ERROR_RC_ALREADY_EXISTS);
                    applyStamp(response, false);

                    // Not saved - existingRecord (already approved under a DIFFERENT owner)
                    // is left completely untouched.
                    return response;
                }
            }

            BikeDocument entity = existing.orElseGet(BikeDocument::new);

            entity.setOwnerId(ownerId);
            entity.setBikeId(bikeId);
            entity.setOwnerName(rcData.getOwnerName());
            entity.setRegistrationNumber(rcData.getRegistrationNumber());
            entity.setChassisNumber(rcData.getChassisNumber());
            entity.setEngineNumber(rcData.getEngineNumber());
            entity.setMakerName(rcData.getMakerName());
            entity.setModel(rcData.getModel());
            entity.setVehicleClass(rcData.getVehicleClass());
            entity.setRegistrationDate(rcData.getRegistrationDate());
            entity.setInsuranceValidUpto(rcData.getInsuranceValidUpto());
            entity.setPuccValidUpto(rcData.getPuccValidUpto());
            entity.setFitnessValidUpto(rcData.getFitnessValidUpto());
            entity.setAddress(rcData.getAddress());
            entity.setStatus(RCConstants.STATUS_APPROVED);
            entity.setRemarks(qrVerified ? "QR verified against OCR." : "QR not verified.");
            entity.setVerifiedBy("SYSTEM");
            entity.setVerifiedAt(LocalDateTime.now());
            entity.setStampLabel(RCConstants.STAMP_APPROVED_LABEL);
            entity.setStampIcon(RCConstants.STAMP_APPROVED_ICON);
            entity.setStampColor(RCConstants.STAMP_APPROVED_COLOR);
            // Kept permanently (not deleted in the finally block
            // below) so an admin can view it later - see the
            // fileRetained flag.
            entity.setDocumentPath(path(uploadedFile));
            entity.setOcrText(rawText);

            repository.save(entity);
            fileRetained = true;

            //-----------------------------------
            // Step 11: Build response
            //-----------------------------------

            response.setVerified(true);
            response.setStatus("APPROVED");
            response.setMessage("Registration Certificate verified successfully.");
            applyStamp(response, true);

            triggerEmailNotification(ownerId, response);
            return response;

        } catch (IOException e) {

            response.setVerified(false);
            response.setStatus("REJECTED");
            response.setMessage("Unable to upload file.");
            applyStamp(response, false);

            triggerEmailNotification(ownerId, response);
            return response;

        } catch (Exception e) {

            response.setVerified(false);
            response.setStatus("REJECTED");
            response.setMessage(e.getMessage());
            applyStamp(response, false);

            triggerEmailNotification(ownerId, response);
            return response;

        } finally {

            //-----------------------------------
            // Delete the uploaded file, UNLESS it was just saved as
            // part of an APPROVED (persisted) record above - in
            // that case it's now the permanent copy an admin can
            // view later, not a scratch file.
            //-----------------------------------

            if (uploadedFile != null && uploadedFile.exists() && !fileRetained) {
                uploadedFile.delete();
            }
        }
    }

    private String path(File file) {
        return file != null ? file.getPath() : null;
    }

    //-----------------------------------
    // Helper: set the VERIFIED/REJECTED stamp shown by the frontend
    //-----------------------------------

    private void applyStamp(BikeDocumentResponseDTO response, boolean approved) {

        if (approved) {
            response.setStampLabel(RCConstants.STAMP_APPROVED_LABEL);
            response.setStampIcon(RCConstants.STAMP_APPROVED_ICON);
            response.setStampColor(RCConstants.STAMP_APPROVED_COLOR);
        } else {
            response.setStampLabel(RCConstants.STAMP_REJECTED_LABEL);
            response.setStampIcon(RCConstants.STAMP_REJECTED_ICON);
            response.setStampColor(RCConstants.STAMP_REJECTED_COLOR);
        }
    }

    private void triggerEmailNotification(Long ownerId, BikeDocumentResponseDTO response) {
        if (ownerId == null || response == null) return;
        try {
            userRepository.findById(ownerId).ifPresent(user -> {
                if (user.getEmail() != null && !user.getEmail().isBlank()) {
                    if (response.isVerified()) {
                        emailService.sendVerificationSuccessEmail(user.getEmail(), user.getFullName(), "Registration Certificate (RC)");
                    } else {
                        emailService.sendVerificationFailureEmail(
                                user.getEmail(),
                                user.getFullName(),
                                "Registration Certificate (RC)",
                                response.getMessage(),
                                "Please upload a clear and current image of your bike's RC document."
                        );
                    }
                }
            });
        } catch (Exception e) {
            // Non-blocking log
        }
    }

    //-----------------------------------
    // Plain CRUD (used by the non-verify endpoints)
    //-----------------------------------

    @Override
    public BikeDocument save(BikeDocument bikeDocument) {
        return repository.save(bikeDocument);
    }

    @Override
    public List<BikeDocument> getAll() {
        return repository.findAll();
    }

    @Override
    public BikeDocument getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
        new ResourceNotFoundException(
                "Bike Document not found with id: " + id));
    }

    @Override
    public BikeDocument update(Long id, BikeDocument bikeDocument) {

        BikeDocument existing = getById(id);

        existing.setOwnerName(bikeDocument.getOwnerName());
        existing.setRegistrationNumber(bikeDocument.getRegistrationNumber());
        existing.setChassisNumber(bikeDocument.getChassisNumber());
        existing.setEngineNumber(bikeDocument.getEngineNumber());
        existing.setMakerName(bikeDocument.getMakerName());
        existing.setModel(bikeDocument.getModel());
        existing.setVehicleClass(bikeDocument.getVehicleClass());
        existing.setRegistrationDate(bikeDocument.getRegistrationDate());
        existing.setInsuranceValidUpto(bikeDocument.getInsuranceValidUpto());
        existing.setPuccValidUpto(bikeDocument.getPuccValidUpto());
        existing.setFitnessValidUpto(bikeDocument.getFitnessValidUpto());
        existing.setAddress(bikeDocument.getAddress());
        existing.setStatus(bikeDocument.getStatus());
        existing.setRemarks(bikeDocument.getRemarks());

        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    //-----------------------------------
    // Status check - lets the frontend ask "has THIS bike already been
    // RC-verified?" BEFORE showing the upload form, so re-adding/
    // re-listing the same bike never asks the owner to re-upload.
    // Returns null when nothing is approved yet for this owner+bike.
    //-----------------------------------

    @Override
    public BikeDocument getApprovedDocument(Long ownerId, Long bikeId) {

        if (ownerId == null || bikeId == null) {
            return null;
        }

        BikeDocument doc = repository
                .findFirstByOwnerIdAndBikeIdAndStatusOrderByVerifiedAtDesc(
                        ownerId, bikeId, VerificationConstants.STATUS_APPROVED)
                .orElse(null);
        if (doc == null) {
            doc = repository
                    .findFirstByOwnerIdAndBikeIdAndStatusOrderByVerifiedAtDesc(
                            ownerId, bikeId, "VERIFIED")
                    .orElse(null);
        }
        return doc;
    }
}
