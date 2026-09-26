package com.sssit.bikerental.modules.verification.common.service;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.bikedocument.model.RCData;
import com.sssit.bikerental.modules.verification.bikedocument.util.RCExtractor;
import com.sssit.bikerental.modules.verification.common.config.OCRConfig;
import com.sssit.bikerental.modules.verification.common.model.OCRData;
import com.sssit.bikerental.modules.verification.common.util.DocumentIdentifierUtil;
import com.sssit.bikerental.modules.verification.common.util.ImageUtil;
import com.sssit.bikerental.modules.verification.drivinglicense.model.DLData;
import com.sssit.bikerental.modules.verification.drivinglicense.util.DLExtractor;

import net.sourceforge.tess4j.Tesseract;

/**
 * High-precision document OCR strategy service implementing multi-pass,
 * layout-aware, and color-sensitive OCR for RC and Driving License documents.
 */
@Service
public class DocumentOCRService {

    private static final Logger log = LoggerFactory.getLogger(DocumentOCRService.class);

    @Autowired
    private OCRConfig ocrConfig;

    @Autowired
    private RCExtractor rcExtractor;

    @Autowired
    private DLExtractor dlExtractor;

    /**
     * Dedicated multi-pass OCR extraction for Registration Certificates (RC).
     * Generic, document-layout-agnostic, and color-agnostic: uses full document OCR,
     * upper registration region localization, adaptive contrast stretching, Otsu binarization,
     * and multiple segmentation modes (PSM 3, 6, 11).
     */
    public RCData extractRcDocument(File imageFile, String targetReg) {
        StringBuilder combinedText = new StringBuilder();

        try {
            BufferedImage original = ImageIO.read(imageFile);
            Tesseract tesseract = ocrConfig.newTesseract(3);

            if (original == null) {
                log.warn("ImageIO could not decode image file: {}", imageFile.getName());
                String fallbackText = tesseract.doOCR(imageFile);
                return rcExtractor.extract(fallbackText, targetReg);
            }

            // PASS 1: Full original image OCR (PSM 3)
            try {
                tesseract.setPageSegMode(3);
                String fullText = tesseract.doOCR(original);
                if (fullText != null && !fullText.isBlank()) {
                    combinedText.append(fullText).append("\n");
                    // Fast path check: if Pass 1 gave a high-confidence match with targetReg
                    RCData pass1Data = rcExtractor.extract(fullText, targetReg);
                    if (pass1Data.getRegistrationNumber() != null
                            && targetReg != null
                            && !pass1Data.isAmbiguous()
                            && pass1Data.getRegistrationNumber().equals(DocumentIdentifierUtil.normalizeRegistrationNumber(targetReg))) {
                        pass1Data.setOcrText(fullText);
                        return pass1Data;
                    }
                }
            } catch (Exception e) {
                log.warn("RC Pass 1 (full image) error: {}", e.getMessage());
            }

            // PASS 2: Upper Registration Region Crop (top 45% of document)
            BufferedImage upperCrop = ImageUtil.cropRegion(original, 0.0, 0.45);
            if (upperCrop != null) {
                BufferedImage upscaledCrop = ImageUtil.upscaleImage(upperCrop, 2.0);

                // Pass 2A: Crop PSM 6 (uniform block of text)
                try {
                    tesseract.setPageSegMode(6);
                    String cropText6 = tesseract.doOCR(upscaledCrop);
                    if (cropText6 != null && !cropText6.isBlank()) {
                        combinedText.append("\n--- UPPER REGION PSM 6 ---\n").append(cropText6).append("\n");
                    }
                } catch (Exception e) {
                    log.warn("RC Pass 2A (crop PSM 6) error: {}", e.getMessage());
                }

                // Pass 2B: Crop PSM 3 (auto page segmentation)
                try {
                    tesseract.setPageSegMode(3);
                    String cropText3 = tesseract.doOCR(upscaledCrop);
                    if (cropText3 != null && !cropText3.isBlank()) {
                        combinedText.append("\n--- UPPER REGION PSM 3 ---\n").append(cropText3).append("\n");
                    }
                } catch (Exception e) {
                    log.warn("RC Pass 2B (crop PSM 3) error: {}", e.getMessage());
                }

                // PASS 3: Adaptive Grayscale & High Contrast (Document Agnostic)
                // Enhances contrast for any color combination (black on white, light on dark, colored backgrounds)
                try {
                    BufferedImage gray = ImageUtil.toGrayscale(upscaledCrop);
                    BufferedImage enhancedGray = ImageUtil.enhanceContrast(gray);
                    tesseract.setPageSegMode(6);
                    String contrastText = tesseract.doOCR(enhancedGray);
                    if (contrastText != null && !contrastText.isBlank()) {
                        combinedText.append("\n--- ENHANCED CONTRAST PASS ---\n").append(contrastText).append("\n");
                    }

                    // Adaptive Otsu binarization
                    BufferedImage otsuBin = ImageUtil.binarizeAdaptive(upscaledCrop);
                    String otsuText = tesseract.doOCR(otsuBin);
                    if (otsuText != null && !otsuText.isBlank()) {
                        combinedText.append("\n--- ADAPTIVE BINARY PASS ---\n").append(otsuText).append("\n");
                    }
                } catch (Exception e) {
                    log.warn("RC Pass 3 (contrast & binary) error: {}", e.getMessage());
                }

                // PASS 4: Sparse Text Mode (PSM 11) for scattered document fields
                try {
                    tesseract.setPageSegMode(11);
                    String psm11Text = tesseract.doOCR(upscaledCrop);
                    if (psm11Text != null && !psm11Text.isBlank()) {
                        combinedText.append("\n--- SPARSE TEXT PSM 11 ---\n").append(psm11Text).append("\n");
                    }
                } catch (Exception e) {
                    log.warn("RC Pass 4 (PSM 11) error: {}", e.getMessage());
                }

                // PASS 5: Optional Color-aware fallback (ONLY if no candidate yet or target not found)
                RCData intermediate = rcExtractor.extract(combinedText.toString(), targetReg);
                if (intermediate.getRegistrationNumber() == null || intermediate.isAmbiguous()) {
                    try {
                        BufferedImage redContrast = ImageUtil.extractRedContrastGrayscale(upscaledCrop);
                        tesseract.setPageSegMode(6);
                        String redText = tesseract.doOCR(redContrast);
                        if (redText != null && !redText.isBlank()) {
                            combinedText.append("\n--- COLOR FALLBACK PASS ---\n").append(redText).append("\n");
                        }
                    } catch (Exception e) {
                        log.debug("Color fallback pass: {}", e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            log.error("Error during RC multi-pass OCR: {}", e.getMessage(), e);
        }

        String finalRawText = combinedText.toString();
        RCData data = rcExtractor.extract(finalRawText, targetReg);
        data.setOcrText(finalRawText);
        return data;
    }

    /**
     * Dedicated multi-pass OCR extraction for Driving License (DL).
     * Targets title region directly below "Indian Union Driving Licence" / "Issued by Telangana",
     * tries multiple page segmentation modes (PSM 6, PSM 11, PSM 3), and merges candidates.
     */
    public DLData extractDlDocument(File imageFile) {
        StringBuilder combinedText = new StringBuilder();

        try {
            BufferedImage original = ImageIO.read(imageFile);
            Tesseract tesseract = ocrConfig.newTesseract(3);

            if (original == null) {
                log.warn("ImageIO could not decode DL image file: {}", imageFile.getName());
                String fallbackText = tesseract.doOCR(imageFile);
                return dlExtractor.extract(fallbackText);
            }

            // PASS 1: Full original image OCR (PSM 3)
            try {
                tesseract.setPageSegMode(3);
                String fullText = tesseract.doOCR(original);
                if (fullText != null && !fullText.isBlank()) {
                    combinedText.append(fullText).append("\n");
                }
            } catch (Exception e) {
                log.warn("DL Pass 1 (full image) error: {}", e.getMessage());
            }

            // PASS 2: Title and License Number region crop (from 5% to 45% of height)
            BufferedImage dlTitleCrop = ImageUtil.cropRegion(original, 0.05, 0.45);
            if (dlTitleCrop != null) {
                BufferedImage upscaledCrop = ImageUtil.upscaleImage(dlTitleCrop, 2.0);

                // Pass 2A: Title crop PSM 6 (uniform block of text)
                try {
                    tesseract.setPageSegMode(6);
                    String text6 = tesseract.doOCR(upscaledCrop);
                    if (text6 != null && !text6.isBlank()) {
                        combinedText.append("\n--- DL TITLE REGION PSM 6 ---\n").append(text6).append("\n");
                    }
                } catch (Exception e) {
                    log.warn("DL Pass 2A (title crop PSM 6) error: {}", e.getMessage());
                }

                // Pass 2B: Title crop PSM 11 (sparse text)
                try {
                    tesseract.setPageSegMode(11);
                    String text11 = tesseract.doOCR(upscaledCrop);
                    if (text11 != null && !text11.isBlank()) {
                        combinedText.append("\n--- DL TITLE REGION PSM 11 ---\n").append(text11).append("\n");
                    }
                } catch (Exception e) {
                    log.warn("DL Pass 2B (title crop PSM 11) error: {}", e.getMessage());
                }

                // Pass 2C: High contrast grayscale on title crop
                try {
                    BufferedImage gray = new BufferedImage(upscaledCrop.getWidth(), upscaledCrop.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
                    Graphics2D g = gray.createGraphics();
                    g.drawImage(upscaledCrop, 0, 0, null);
                    g.dispose();
                    BufferedImage enhancedGray = ImageUtil.enhanceContrast(gray);
                    tesseract.setPageSegMode(6);
                    String enhancedText = tesseract.doOCR(enhancedGray);
                    if (enhancedText != null && !enhancedText.isBlank()) {
                        combinedText.append("\n--- DL ENHANCED CROP ---\n").append(enhancedText).append("\n");
                    }
                } catch (Exception e) {
                    log.warn("DL Pass 2C (enhanced crop) error: {}", e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Error during DL multi-pass OCR: {}", e.getMessage(), e);
        }

        String finalRawText = combinedText.toString();
        DLData data = dlExtractor.extract(finalRawText);
        data.setOcrText(finalRawText);
        return data;
    }

    public RCData extractRcDocument(MultipartFile file, String targetReg) throws IOException {
        File tempFile = createTempFile(file);
        try {
            return extractRcDocument(tempFile, targetReg);
        } finally {
            if (tempFile.exists()) tempFile.delete();
        }
    }

    public DLData extractDlDocument(MultipartFile file) throws IOException {
        File tempFile = createTempFile(file);
        try {
            return extractDlDocument(tempFile);
        } finally {
            if (tempFile.exists()) tempFile.delete();
        }
    }

    private File createTempFile(MultipartFile file) throws IOException {
        String ext = ".tmp";
        String orig = file.getOriginalFilename();
        if (orig != null && orig.contains(".")) {
            ext = orig.substring(orig.lastIndexOf('.'));
        }
        File tempFile = File.createTempFile("doc_ocr_", ext);
        Files.copy(file.getInputStream(), tempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
        return tempFile;
    }
}
