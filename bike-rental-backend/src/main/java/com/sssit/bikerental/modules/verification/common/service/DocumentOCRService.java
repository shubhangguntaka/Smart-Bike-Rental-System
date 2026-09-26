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
     * Preserves red text, performs upper registration region cropping, applies
     * color-aware filters, and merges candidates.
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
                }
            } catch (Exception e) {
                log.warn("RC Pass 1 (full image) error: {}", e.getMessage());
            }

            // PASS 2: Upper Registration Region Crop (top 42% of document)
            BufferedImage upperCrop = ImageUtil.cropRegion(original, 0.0, 0.42);
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

                // PASS 3: Color-aware red-text preservation pass
                // Red text absorbs green/blue light; green-channel difference turns red text dark on bright background
                try {
                    BufferedImage redContrast = ImageUtil.extractRedContrastGrayscale(upscaledCrop);
                    tesseract.setPageSegMode(6);
                    String redText = tesseract.doOCR(redContrast);
                    if (redText != null && !redText.isBlank()) {
                        combinedText.append("\n--- RED CONTRAST PASS ---\n").append(redText).append("\n");
                    }
                } catch (Exception e) {
                    log.warn("RC Pass 3 (red contrast) error: {}", e.getMessage());
                }

                // PASS 4: Binary red-text foreground isolation
                try {
                    BufferedImage redBinary = ImageUtil.extractRedTextBinary(upscaledCrop);
                    tesseract.setPageSegMode(6);
                    String binText = tesseract.doOCR(redBinary);
                    if (binText != null && !binText.isBlank()) {
                        combinedText.append("\n--- RED BINARY PASS ---\n").append(binText).append("\n");
                    }
                } catch (Exception e) {
                    log.warn("RC Pass 4 (red binary) error: {}", e.getMessage());
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
