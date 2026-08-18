package com.sssit.bikerental.modules.verification.drivinglicense.serviceimpl;

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
import com.sssit.bikerental.modules.verification.common.constants.VerificationConstants;
import com.sssit.bikerental.modules.verification.common.model.OCRData;
import com.sssit.bikerental.modules.verification.common.service.OCRService;
import com.sssit.bikerental.modules.verification.common.util.NameMatchUtil;
import com.sssit.bikerental.modules.verification.drivinglicense.dto.DrivingLicenseResponseDTO;
import com.sssit.bikerental.modules.verification.drivinglicense.entity.DrivingLicense;
import com.sssit.bikerental.modules.verification.drivinglicense.model.DLData;
import com.sssit.bikerental.modules.verification.drivinglicense.repository.DrivingLicenseRepository;
import com.sssit.bikerental.modules.verification.drivinglicense.service.DrivingLicenseService;
import com.sssit.bikerental.modules.verification.drivinglicense.util.DLExtractor;
import com.sssit.bikerental.modules.verification.drivinglicense.util.DLValidator;
import com.sssit.bikerental.modules.verification.drivinglicense.util.QRReader;

@Service
public class DrivingLicenseServiceImpl implements DrivingLicenseService {

    @Autowired
    private OCRService ocrService;

    @Autowired
    private DrivingLicenseRepository repository;

    @Autowired
    private AadhaarRepository aadhaarRepository;

    @Autowired
    private DLExtractor dlExtractor;

    @Autowired
    private DLValidator validator;

    @Autowired
    private QRReader qrReader;

    private static final String UPLOAD_DIR = "uploads/driving-license/";

    @Override
    public DrivingLicenseResponseDTO verifyDrivingLicense(MultipartFile file, Long customerId) {

        DrivingLicenseResponseDTO response = new DrivingLicenseResponseDTO();

        File uploadedFile = null;
        boolean fileRetained = false;

        try {

            //-----------------------------------
            // Step 1-2: Basic file check
            //-----------------------------------

            if (file == null || file.isEmpty()) {

                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage("Please upload a Driving License.");
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
            // Step 5: DLExtractor - extract DL fields
            //-----------------------------------

            DLData dlData = dlExtractor.extract(rawText);

            //-----------------------------------
            // Step 6: Read QR code (if available)
            //-----------------------------------

            String qrText = qrReader.readQRCode(uploadedFile);

            //-----------------------------------
            // Step 7: Compare OCR data with QR data
            // Most Indian DL QR codes just encode a Parivahan
            // verification URL rather than structured fields (unlike
            // Aadhaar's Secure QR), so we do a best-effort soft check:
            // if a QR was found and it contains the OCR license
            // number as a substring, we mark it as cross-verified.
            // A missing/non-matching QR does NOT fail verification on
            // its own, since many valid DLs have no QR or an
            // unparsable one.
            //-----------------------------------

            boolean qrVerified = false;

            if (qrText != null && dlData.getLicenseNumber() != null) {

                String normalizedQr = qrText.toUpperCase().replaceAll("[\\s-]", "");
                String normalizedLicense = dlData.getLicenseNumber().toUpperCase();

                qrVerified = normalizedQr.contains(normalizedLicense);
            }

            //-----------------------------------
            // Step 8: Validate extracted fields
            //-----------------------------------

            String validationResult = validator.validate(dlData);

            // Populate whatever was extracted regardless of outcome,
            // so a REJECTED response still shows what OCR could (and
            // couldn't) read - much easier to debug than blank fields.
            response.setCustomerName(dlData.getCustomerName());
            response.setLicenseNumber(dlData.getLicenseNumber());
            response.setDob(dlData.getDob());
            response.setIssueDate(dlData.getIssueDate());
            response.setValidTill(dlData.getValidTill());
            response.setAddress(dlData.getAddress());
            response.setQrVerified(qrVerified);

            if (!"VALID".equals(validationResult)) {

                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage(validationResult);
                applyStamp(response, false);

                return response;
            }

            //-----------------------------------
            // Step 8b: Cross-check the DL holder's name against a
            // verified Aadhaar. No customerId is required for this -
            // instead, every APPROVED Aadhaar record is searched for
            // one whose name roughly matches the DL name (fuzzy /
            // order-independent, same as the OCR-vs-QR check), and
            // the first one found close enough is treated as the
            // match.
            //
            // Note: this is a weaker link than matching by
            // customerId - it's possible (if unlikely) for two
            // different people with very similar names to
            // cross-match. If that becomes a real problem, matching
            // by a shared identifier (Aadhaar/DL uploaded together in
            // one session, a logged-in customerId, etc.) would be
            // safer than name-only matching across the whole table.
            //-----------------------------------

            List<AadhaarVerification> approvedAadhaars =
                    new java.util.ArrayList<>(aadhaarRepository.findByStatus(VerificationConstants.STATUS_APPROVED));
            approvedAadhaars.addAll(aadhaarRepository.findByStatus("VERIFIED"));

            AadhaarVerification matchedAadhaar = null;

            for (AadhaarVerification candidate : approvedAadhaars) {

                if (NameMatchUtil.namesRoughlyMatch(
                        candidate.getCustomerName(), dlData.getCustomerName())) {

                    matchedAadhaar = candidate;
                    break;
                }
            }

            if (matchedAadhaar == null) {

                response.setVerified(false);
                response.setStatus("REJECTED");
                response.setMessage(VerificationConstants.ERROR_AADHAAR_NOT_VERIFIED_FIRST);
                applyStamp(response, false);

                return response;
            }

            response.setAadhaarNameMatched(true);

            // Adopt the matched Aadhaar's customerId (if it has one)
            // so downstream records (and future re-uploads) stay
            // linked to the same customer, without the caller having
            // to supply/know that id themselves.
            if (customerId == null) {
                customerId = matchedAadhaar.getCustomerId();
            }

            //-----------------------------------
            // Step 9-10: Create entity and save
            //
            // If this exact license number is already APPROVED under
            // a DIFFERENT customer, this is not "the same customer
            // re-uploading their own DL" - block it instead of
            // silently reassigning customerId (which used to quietly
            // break the other customer's own DL verification the
            // next time it was checked).
            //-----------------------------------

            Optional<DrivingLicense> existing =
                    repository.findByLicenseNumber(dlData.getLicenseNumber());

            if (existing.isPresent()) {

                DrivingLicense existingRecord = existing.get();

                // Block re-submitting a license that's already
                // APPROVED, full stop - not just when it belongs to a
                // different customer. Once a license number is
                // approved, any further upload of that same DL is
                // treated as a duplicate rather than silently
                // re-approved/updated.
                boolean alreadyApproved = "APPROVED".equals(existingRecord.getStatus());

                if (alreadyApproved) {

                    response.setVerified(false);
                    response.setStatus("REJECTED");
                    response.setMessage(VerificationConstants.ERROR_DL_ALREADY_EXISTS);
                    applyStamp(response, false);

                    // Not saved - existingRecord (already approved) is
                    // left completely untouched.
                    return response;
                }
            }

            DrivingLicense entity = existing.orElseGet(DrivingLicense::new);

            entity.setCustomerId(customerId);
            entity.setCustomerName(dlData.getCustomerName());
            entity.setLicenseNumber(dlData.getLicenseNumber());
            entity.setDob(dlData.getDob());
            entity.setIssueDate(dlData.getIssueDate());
            entity.setValidTill(dlData.getValidTill());
            entity.setAddress(dlData.getAddress());
            entity.setStatus("APPROVED");
            entity.setRemarks(qrVerified ? "QR verified against OCR." : "QR not verified.");
            entity.setVerifiedBy("SYSTEM");
            entity.setVerifiedAt(LocalDateTime.now());
            entity.setStampLabel(VerificationConstants.STAMP_APPROVED_LABEL);
            entity.setStampIcon(VerificationConstants.STAMP_APPROVED_ICON);
            entity.setStampColor(VerificationConstants.STAMP_APPROVED_COLOR);
            // The saved image is now kept permanently (not deleted in
            // the finally block below) so an admin can view it later
            // - see the fileRetained flag.
            entity.setDocumentPath(path(uploadedFile));
            entity.setOcrText(rawText);

            repository.save(entity);
            fileRetained = true;

            //-----------------------------------
            // Step 11: Build response
            //-----------------------------------

            response.setVerified(true);
            response.setStatus("APPROVED");
            response.setMessage("Driving License verified successfully.");
            applyStamp(response, true);

            return response;

        } catch (IOException e) {

            response.setVerified(false);
            response.setStatus("REJECTED");
            response.setMessage("Unable to upload file.");
            applyStamp(response, false);

            return response;

        } catch (Exception e) {

            response.setVerified(false);
            response.setStatus("REJECTED");
            response.setMessage(e.getMessage());
            applyStamp(response, false);

            return response;

        } finally {

            //-----------------------------------
            // Step 12: Delete the uploaded file, UNLESS it was just
            // saved as part of an APPROVED (persisted) record above -
            // in that case it's now the permanent copy an admin can
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

    private void applyStamp(DrivingLicenseResponseDTO response, boolean approved) {

        if (approved) {
            response.setStampLabel(VerificationConstants.STAMP_APPROVED_LABEL);
            response.setStampIcon(VerificationConstants.STAMP_APPROVED_ICON);
            response.setStampColor(VerificationConstants.STAMP_APPROVED_COLOR);
        } else {
            response.setStampLabel(VerificationConstants.STAMP_REJECTED_LABEL);
            response.setStampIcon(VerificationConstants.STAMP_REJECTED_ICON);
            response.setStampColor(VerificationConstants.STAMP_REJECTED_COLOR);
        }
    }

    //-----------------------------------
    // Plain CRUD (used by the non-verify endpoints)
    //-----------------------------------

    @Override
    public DrivingLicense save(DrivingLicense drivingLicense) {
        return repository.save(drivingLicense);
    }

    @Override
    public java.util.List<DrivingLicense> getAll() {
        return repository.findAll();
    }

    @Override
    public DrivingLicense getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
        new ResourceNotFoundException(
                "Driving License not found with id: " + id));
    }

    @Override
    public DrivingLicense update(Long id, DrivingLicense drivingLicense) {

        DrivingLicense existing = getById(id);

        existing.setCustomerName(drivingLicense.getCustomerName());
        existing.setLicenseNumber(drivingLicense.getLicenseNumber());
        existing.setDob(drivingLicense.getDob());
        existing.setIssueDate(drivingLicense.getIssueDate());
        existing.setValidTill(drivingLicense.getValidTill());
        existing.setAddress(drivingLicense.getAddress());
        existing.setStatus(drivingLicense.getStatus());
        existing.setRemarks(drivingLicense.getRemarks());

        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    //-----------------------------------
    // Status check - lets the frontend ask "has this customer already
    // been Driving-License-verified?" BEFORE showing the upload form,
    // so a returning customer booking again is never asked to
    // re-upload. Returns null when nothing is approved yet.
    //-----------------------------------

    @Override
    public DrivingLicense getApprovedLicense(Long customerId) {

        if (customerId == null) {
            return null;
        }

        DrivingLicense res = repository
                .findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(
                        customerId, VerificationConstants.STATUS_APPROVED)
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
