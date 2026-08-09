package com.sssit.bikerental.modules.booking.service.impl;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.sssit.bikerental.modules.booking.service.QRCodeService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

@Service
public class QRCodeServiceImpl implements QRCodeService {

    private static final String QR_DIR = "uploads/qrcodes/";

    @Override
    public String generateQRCode(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

            // Generate Base64 PNG image stream
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(pngData);
            String dataUri = "data:image/png;base64," + base64Image;

            // Save to local filesystem as requested
            Files.createDirectories(Paths.get(QR_DIR));
            String fileName = "booking_" + System.currentTimeMillis() + "_" + Math.abs(text.hashCode()) + ".png";
            Path path = Paths.get(QR_DIR + fileName);
            Files.write(path, pngData);

            return dataUri;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR Code", e);
        }
    }
}
