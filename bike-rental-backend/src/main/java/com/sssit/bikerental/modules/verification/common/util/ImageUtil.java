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
}
