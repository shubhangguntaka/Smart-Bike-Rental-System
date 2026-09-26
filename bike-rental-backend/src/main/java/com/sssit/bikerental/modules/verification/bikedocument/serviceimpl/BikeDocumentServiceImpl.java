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
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
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
import com.sssit.bikerental.modules.auth.service.EmailService;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.verification.common.constants.VerificationConstants;
import com.sssit.bikerental.modules.verification.common.model.OCRData;
import com.sssit.bikerental.modules.verification.common.service.OCRService;
import com.sssit.bikerental.modules.verification.common.util.DocumentIdentifierUtil;
import com.sssit.bikerental.modules.verification.common.util.NameMatchUtil;

@Service
public class BikeDocumentServiceImpl implements BikeDocumentService {

    @Autowired
    private OCRService ocrService;

    @Autowired
    private com.sssit.bikerental.modules.verification.common.service.DocumentOCRService documentOCRService;

    @Autowired
    private BikeDocumentRepository repository;

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
    private BikeRepository bikeRepository;

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
            // Step 4: Determine Target Registration Number from Bike Details
            //-----------------------------------
            String targetReg = null;
            if (registrationNumberParam != null && !registrationNumberParam.isBlank()) {
                targetReg = DocumentIdentifierUtil.normalizeRegistrationNumber(registrationNumberParam);
            } else if (bikeId != null) {
                try {
                    com.sssit.bikerental.modules.bike.entity.Bike bike = bikeRepository.findById(bikeId).orElse(null);
                    if (bike != null && bike.getRegistrationNumber() != null) {
                        targetReg = DocumentIdentifierUtil.normalizeRegistrationNumber(bike.getRegistrationNumber());
                    }
                } catch (Exception ignored) {}
            }

            //-----------------------------------
            // Step 5: Multi-pass RC OCR Strategy
            // Performs full-image, upper crop (0-42%), red-contrast, and binary red passes,
            // preserving red registration text and extracting scored candidates.
            //-----------------------------------
            RCData rcData = documentOCRService.extractRcDocument(uploadedFile, targetReg);
            String rawText = rcData.getOcrText() != null ? rcData.getOcrText() : "";

            //-----------------------------------
            // Step 6: Document-type check
            //-----------------------------------
            if (!documentTypeValidator.isRCDocument(rawText, registrationNumberParam)) {

                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage(RCConstants.ERROR_INVALID_DOCUMENT_TYPE);
                applyStamp(response, false);

                return response;
            }

            //-----------------------------------
            // Step 7: Registration Number Match & Validation
            // Exactly distinguish:
            // 1. EXTRACTION_AMBIGUOUS (multiple competing candidates, neither matching target)
            // 2. EXTRACTION_FAILED (no valid registration number detected)
            // 3. REGISTRATION_MISMATCH (valid RC registration detected but does not match bike details)
            // 4. VERIFIED (valid RC registration matches bike details)
            //-----------------------------------
            String extractedReg = DocumentIdentifierUtil.normalizeRegistrationNumber(rcData.getRegistrationNumber());

            // Case 1: Ambiguity detected
            if (rcData.isAmbiguous()) {
                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage("Unable to confidently identify the vehicle registration number from this RC. Please upload a clearer document.");
                response.setRegistrationNumber(extractedReg);
                response.setOwnerName(rcData.getOwnerName());
                applyStamp(response, false);

                triggerEmailNotification(ownerId, response);
                return response;
            }

            // Case 2: Extraction failure - no valid identifier found
            if (extractedReg == null || extractedReg.isEmpty() || !DocumentIdentifierUtil.isValidRegistrationNumber(extractedReg)) {
                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage("Could not identify a valid vehicle registration number from the Registration Certificate (RC).");
                applyStamp(response, false);

                triggerEmailNotification(ownerId, response);
                return response;
            }

            // Case 3: Target reg provided -> Compare normalized values (Mismatch vs Match)
            if (targetReg != null && !targetReg.isEmpty()) {
                if (!extractedReg.equals(targetReg)) {
                    response.setVerified(false);
                    response.setStatus("REJECTED");
                    response.setMessage("Registration number on the RC does not match the registration number entered for this bike.");
                    response.setRegistrationNumber(extractedReg);
                    response.setOwnerName(rcData.getOwnerName());
                    applyStamp(response, false);

                    triggerEmailNotification(ownerId, response);
                    return response;
                } else {
                    rcData.setRegistrationNumber(targetReg);
                }
            }

            //-----------------------------------
            // Step 8: Read QR code (if available) and soft-compare against OCR
            //-----------------------------------

            String qrText = qrReader.readQRCode(uploadedFile);

            boolean qrVerified = false;

            if (qrText != null && rcData.getRegistrationNumber() != null) {
                String normalizedQr = qrText.toUpperCase().replaceAll("[\\s-]", "");
                String normalizedRegNo = rcData.getRegistrationNumber().toUpperCase();
                qrVerified = normalizedQr.contains(normalizedRegNo);
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

                triggerEmailNotification(ownerId, response);
                return response;
            }

            //-----------------------------------
            // Step 9: Duplicate check. If this exact registration
            // number is already APPROVED under a DIFFERENT owner,
            // block re-submission.
            //-----------------------------------

            Optional<BikeDocument> existing =
                    repository.findByRegistrationNumber(rcData.getRegistrationNumber());

            if (existing.isPresent()) {
                BikeDocument existingRecord = existing.get();
                boolean alreadyApproved = RCConstants.STATUS_APPROVED.equals(existingRecord.getStatus()) || "VERIFIED".equals(existingRecord.getStatus());
                boolean isDifferentOwner = existingRecord.getOwnerId() != null &&
                        ownerId != null &&
                        !existingRecord.getOwnerId().equals(ownerId);

                if (alreadyApproved && isDifferentOwner) {
                    response.setVerified(false);
                    response.setStatus("REJECTED");
                    response.setMessage(RCConstants.ERROR_RC_ALREADY_EXISTS);
                    applyStamp(response, false);

                    triggerEmailNotification(ownerId, response);
                    return response;
                }
            }

            BikeDocument entity = existing.orElseGet(BikeDocument::new);

            entity.setOwnerId(ownerId);
            entity.setBikeId(bikeId);
            entity.setOwnerName(rcData.getOwnerName() != null ? rcData.getOwnerName() : "Registered Owner");
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
            entity.setDocumentPath(path(uploadedFile));
            entity.setOcrText(rawText);

            repository.save(entity);
            fileRetained = true;

            // Also update the Bike entity if bikeId is present or looked up
            if (bikeId != null) {
                try {
                    bikeRepository.findById(bikeId).ifPresent(b -> {
                        b.setRcVerified(true);
                        bikeRepository.save(b);
                    });
                } catch (Exception ignored) {}
            } else if (rcData.getRegistrationNumber() != null) {
                try {
                    bikeRepository.findByRegistrationNumber(rcData.getRegistrationNumber()).ifPresent(b -> {
                        b.setRcVerified(true);
                        bikeRepository.save(b);
                    });
                } catch (Exception ignored) {}
            }

            //-----------------------------------
            // Step 10: Build response
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
