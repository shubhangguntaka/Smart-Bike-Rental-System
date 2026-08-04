package com.sssit.bikerental.modules.verification.aadhaar.qr;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.zxing.Result;
import com.sssit.bikerental.modules.verification.aadhaar.model.AadhaarQRData;
import com.sssit.bikerental.modules.verification.aadhaar.qr.QRCodeReader.Outcome;

@Service
public class QRVerificationService {

    @Autowired
    private QRCodeReader qrCodeReader;

    @Autowired
    private QRParser qrParser;

    @Autowired
    private QRSignatureVerifier signatureVerifier;

    public AadhaarQRData verify(MultipartFile multipartFile) {

        File tempFile = null;

        try {

            tempFile = File.createTempFile("aadhaar-", ".png");

            Files.copy(
                    multipartFile.getInputStream(),
                    tempFile.toPath(),
                    StandardCopyOption.REPLACE_EXISTING
            );

            Outcome outcome = qrCodeReader.decode(tempFile);
            Result decoded = outcome.getResult();

            if (decoded == null || decoded.getText() == null || decoded.getText().isBlank()) {

                AadhaarQRData data = new AadhaarQRData();

                data.setQrAvailable(false);
                data.setQrValid(false);
                data.setScannedImageWidth(outcome.getImageWidth());
                data.setScannedImageHeight(outcome.getImageHeight());

                return data;
            }

            AadhaarQRData data = qrParser.parse(decoded.getText(), decoded.getRawBytes());
            data.setScannedImageWidth(outcome.getImageWidth());
            data.setScannedImageHeight(outcome.getImageHeight());

            //-----------------------------------
            // Digital Signature Verification
            // (reuses the same decode pass above - raw bytes come
            // from the same Result, no second scan of the image)
            //-----------------------------------

            byte[] rawBytes = decoded.getRawBytes();

            QRSignatureVerifier.Result sigResult =
                    signatureVerifier.verify(rawBytes);

            data.setSignatureStatus(sigResult.getStatus().name());
            data.setSignatureMessage(sigResult.getMessage());

            return data;

        } catch (Exception e) {

            throw new RuntimeException("Unable to read uploaded Aadhaar image.", e);

        } finally {

            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }

        }

    }

}