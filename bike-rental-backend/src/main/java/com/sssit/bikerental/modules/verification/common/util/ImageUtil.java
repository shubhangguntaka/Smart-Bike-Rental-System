package com.sssit.bikerental.modules.verification.common.util;

import net.coobird.thumbnailator.Thumbnails;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

public class ImageUtil {

    private ImageUtil() {
    }

    // Was 1800 - too small for the fine bilingual text on a
    // full-page, multi-panel Aadhaar scan (front + back + enrolment
    // slip all in one image). Raised so small text stays legible
    // after resizing.
    private static final int MAX_DIMENSION = 2400;

    public static File optimizeImage(File inputFile) throws IOException {

        // Resize image
        BufferedImage resized = Thumbnails.of(inputFile)
                .size(MAX_DIMENSION, MAX_DIMENSION)
                .outputQuality(1.0)
                .asBufferedImage();

        int width = resized.getWidth();
        int height = resized.getHeight();

        // Convert to grayscale first - thresholding should operate
        // on luminance, not per-channel RGB.
        BufferedImage gray = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_GRAY);

        Graphics2D g = gray.createGraphics();

        g.setRenderingHint(
                RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BICUBIC);

        g.drawImage(resized, 0, 0, null);

        g.dispose();

        // Binarize using Otsu's method instead of a fixed threshold.
        //
        // The old code used a hardcoded cutoff of 150 for every
        // image. That only works for evenly-lit, high-contrast
        // scans; on anything else (a phone photo with shadow/glare,
        // or a flatbed scan with slightly grey background) it either
        // crushes real text to solid black/white blobs or wipes it
        // out entirely - which is exactly what was happening on
        // bilingual Aadhaar scans and corrupting name/DOB/address
        // extraction. Otsu's method computes the threshold that best
        // separates foreground from background FOR THIS SPECIFIC
        // IMAGE, so it adapts instead of using one magic number for
        // every document.
        int threshold = otsuThreshold(gray);

        BufferedImage processed =
                new BufferedImage(width, height, BufferedImage.TYPE_BYTE_BINARY);

        for (int y = 0; y < height; y++) {

            for (int x = 0; x < width; x++) {

                int grayValue = gray.getRaster().getSample(x, y, 0);

                if (grayValue > threshold) {
                    processed.setRGB(x, y, Color.WHITE.getRGB());
                } else {
                    processed.setRGB(x, y, Color.BLACK.getRGB());
                }
            }
        }

        File output =
                File.createTempFile("optimized_", ".png");

        ImageIO.write(processed, "png", output);

        return output;
    }

    /**
     * Computes the Otsu threshold (0-255) for a grayscale image:
     * the pixel intensity that minimizes the combined variance of
     * the "dark" and "light" pixel groups it would split the image
     * into. Standard histogram-based Otsu's method, O(width*height)
     * to build the histogram plus a single O(256) pass to search it.
     */
    private static int otsuThreshold(BufferedImage gray) {

        int width = gray.getWidth();
        int height = gray.getHeight();
        int totalPixels = width * height;

        int[] histogram = new int[256];

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                histogram[gray.getRaster().getSample(x, y, 0)]++;
            }
        }

        long sumAll = 0;
        for (int t = 0; t < 256; t++) {
            sumAll += (long) t * histogram[t];
        }

        long sumBackground = 0;
        int weightBackground = 0;

        double bestVariance = -1;
        int bestThreshold = 128; // sane fallback if the loop never improves on it

        for (int t = 0; t < 256; t++) {

            weightBackground += histogram[t];

            if (weightBackground == 0) {
                continue;
            }

            int weightForeground = totalPixels - weightBackground;

            if (weightForeground == 0) {
                break;
            }

            sumBackground += (long) t * histogram[t];

            double meanBackground = (double) sumBackground / weightBackground;
            double meanForeground = (double) (sumAll - sumBackground) / weightForeground;

            double betweenClassVariance =
                    (double) weightBackground * weightForeground
                            * Math.pow(meanBackground - meanForeground, 2);

            if (betweenClassVariance > bestVariance) {
                bestVariance = betweenClassVariance;
                bestThreshold = t;
            }
        }

        return bestThreshold;
    }

    /**
     * Crops a vertical region of the image based on proportional percentages (0.0 to 1.0).
     * Creates a fresh, contiguous raster to prevent Leptonica/Tess4J stride/offset memory corruptions.
     */
    public static BufferedImage cropRegion(BufferedImage src, double yStartPercent, double yEndPercent) {
        if (src == null) return null;
        int w = src.getWidth();
        int h = src.getHeight();

        int yStart = (int) Math.max(0, Math.min(h - 1, h * yStartPercent));
        int yEnd = (int) Math.max(yStart + 10, Math.min(h, h * yEndPercent));
        int cropHeight = Math.max(1, yEnd - yStart);

        int imageType = src.getType() != 0 ? src.getType() : BufferedImage.TYPE_INT_RGB;
        BufferedImage cropped = new BufferedImage(w, cropHeight, imageType);
        Graphics2D g = cropped.createGraphics();
        g.drawImage(src, 0, 0, w, cropHeight, 0, yStart, w, yEnd, null);
        g.dispose();

        return cropped;
    }

    /**
     * Upscales a BufferedImage by a given factor using Bicubic interpolation.
     * Guards against excessive scaling if image is already sufficiently high resolution.
     */
    public static BufferedImage upscaleImage(BufferedImage src, double factor) {
        if (src == null || factor <= 1.0) return src;
        if (src.getWidth() >= 1400) return src;

        int targetW = (int) (src.getWidth() * factor);
        int targetH = (int) (src.getHeight() * factor);

        int imageType = src.getType() != 0 ? src.getType() : BufferedImage.TYPE_INT_RGB;
        BufferedImage upscaled = new BufferedImage(targetW, targetH, imageType);

        Graphics2D g = upscaled.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(src, 0, 0, targetW, targetH, null);
        g.dispose();

        return upscaled;
    }

    /**
     * Extracts a grayscale image tuned specifically for red/magenta text.
     * Since red pigments absorb green and blue wavelengths, examining the green channel
     * or subtracting red dominance causes red text to appear dark against light backgrounds.
     */
    public static BufferedImage extractRedContrastGrayscale(BufferedImage src) {
        if (src == null) return null;
        int w = src.getWidth();
        int h = src.getHeight();

        BufferedImage result = new BufferedImage(w, h, BufferedImage.TYPE_BYTE_GRAY);

        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int rgb = src.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;

                // Red text absorption metric: Green channel is low for red text
                // Subtract extra red chromatic difference to make red text even darker
                int redDiff = Math.max(0, r - Math.max(g, b));
                int val = Math.max(0, Math.min(255, g - redDiff));

                result.getRaster().setSample(x, y, 0, val);
            }
        }

        return enhanceContrast(result);
    }

    /**
     * Binarizes specifically targeting red / magenta foreground text.
     * Pixels with high red chromaticity relative to green/blue become black (foreground),
     * and non-red areas become white.
     */
    public static BufferedImage extractRedTextBinary(BufferedImage src) {
        if (src == null) return null;
        int w = src.getWidth();
        int h = src.getHeight();

        BufferedImage result = new BufferedImage(w, h, BufferedImage.TYPE_BYTE_BINARY);

        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int rgb = src.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;

                // Red text condition: high red relative to green/blue
                boolean isReddish = (r > 80) && ((r - g) > 20 || (r - b) > 20);

                if (isReddish) {
                    result.setRGB(x, y, Color.BLACK.getRGB());
                } else {
                    result.setRGB(x, y, Color.WHITE.getRGB());
                }
            }
        }

        return result;
    }

    /**
     * Contrast-enhances a grayscale image using histogram min-max stretching.
     */
    public static BufferedImage enhanceContrast(BufferedImage gray) {
        if (gray == null) return null;
        int w = gray.getWidth();
        int h = gray.getHeight();

        int min = 255;
        int max = 0;

        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int v = gray.getRaster().getSample(x, y, 0);
                if (v < min) min = v;
                if (v > max) max = v;
            }
        }

        if (max <= min) return gray;

        BufferedImage enhanced = new BufferedImage(w, h, BufferedImage.TYPE_BYTE_GRAY);
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int v = gray.getRaster().getSample(x, y, 0);
                int stretched = (v - min) * 255 / (max - min);
                enhanced.getRaster().setSample(x, y, 0, Math.max(0, Math.min(255, stretched)));
            }
        }

        return enhanced;
    }

    /**
     * Converts an image to 8-bit grayscale.
     */
    public static BufferedImage toGrayscale(BufferedImage src) {
        if (src == null) return null;
        if (src.getType() == BufferedImage.TYPE_BYTE_GRAY) return src;
        int w = src.getWidth();
        int h = src.getHeight();
        BufferedImage gray = new BufferedImage(w, h, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = gray.createGraphics();
        g.drawImage(src, 0, 0, null);
        g.dispose();
        return gray;
    }

    /**
     * Binarizes an image using adaptive Otsu thresholding.
     */
    public static BufferedImage binarizeAdaptive(BufferedImage src) {
        if (src == null) return null;
        BufferedImage gray = toGrayscale(src);
        int threshold = otsuThreshold(gray);
        int w = gray.getWidth();
        int h = gray.getHeight();
        BufferedImage bin = new BufferedImage(w, h, BufferedImage.TYPE_BYTE_BINARY);
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int sample = gray.getRaster().getSample(x, y, 0);
                bin.setRGB(x, y, sample > threshold ? Color.WHITE.getRGB() : Color.BLACK.getRGB());
            }
        }
        return bin;
    }

    /**
     * Rotates an image by 90, 180, or 270 degrees.
     */
    public static BufferedImage rotate(BufferedImage src, double angleDegrees) {
        if (src == null || angleDegrees == 0) return src;
        int w = src.getWidth();
        int h = src.getHeight();
        boolean is90or270 = ((int) Math.abs(angleDegrees) % 180) != 0;
        int newW = is90or270 ? h : w;
        int newH = is90or270 ? w : h;
        BufferedImage rotated = new BufferedImage(newW, newH, src.getType() != 0 ? src.getType() : BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rotated.createGraphics();
        g.translate((newW - w) / 2.0, (newH - h) / 2.0);
        g.rotate(Math.toRadians(angleDegrees), w / 2.0, h / 2.0);
        g.drawImage(src, 0, 0, null);
        g.dispose();
        return rotated;
    }
}
