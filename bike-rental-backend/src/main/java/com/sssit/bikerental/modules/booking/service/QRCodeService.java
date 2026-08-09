package com.sssit.bikerental.modules.booking.service;

public interface QRCodeService {
    /**
     * Generates a QR Code as a Base64-encoded PNG image string.
     * Optionally saves the QR code image to a local folder and returns the path or Base64 string.
     *
     * @param text   The content to encode in the QR code.
     * @param width  The width of the QR code image.
     * @param height The height of the QR code image.
     * @return The Base64 image data URI or local file path.
     */
    String generateQRCode(String text, int width, int height);
}
