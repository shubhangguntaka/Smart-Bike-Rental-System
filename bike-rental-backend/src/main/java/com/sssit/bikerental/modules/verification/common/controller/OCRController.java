package com.sssit.bikerental.modules.verification.common.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.aadhaar.validator.ImageQualityValidator;
import com.sssit.bikerental.modules.verification.common.constants.VerificationConstants;
import com.sssit.bikerental.modules.verification.common.exception.QRVerificationException;
import com.sssit.bikerental.modules.verification.common.model.OCRData;
import com.sssit.bikerental.modules.verification.common.service.OCRService;

@RestController
@RequestMapping("/api/ocr")
@CrossOrigin(origins = "*")
public class OCRController {

    private final OCRService ocrService;
    private final ImageQualityValidator imageQualityValidator;

    public OCRController(OCRService ocrService, ImageQualityValidator imageQualityValidator) {
        this.ocrService = ocrService;
        this.imageQualityValidator = imageQualityValidator;
    }

    @PostMapping(
            value = "/extract",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public OCRData extract(
            @RequestParam("file") MultipartFile file) {

        //-----------------------------------
        // Same "full-length image" gate used by the Aadhaar verify
        // flow, applied here too, so this endpoint can no longer be
        // used to run OCR on tiny/cropped images unchecked.
        //-----------------------------------

        if (!imageQualityValidator.isFullLengthAadhaarImage(file)) {

            throw new QRVerificationException(
                    VerificationConstants.ERROR_SMALL_OR_CROPPED_IMAGE
            );
        }

        return ocrService.extractData(file);
    }
}