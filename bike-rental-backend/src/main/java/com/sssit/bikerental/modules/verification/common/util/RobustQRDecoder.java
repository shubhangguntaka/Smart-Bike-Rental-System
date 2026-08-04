package com.sssit.bikerental.modules.verification.common.util;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.Binarizer;
import com.google.zxing.DecodeHintType;
import com.google.zxing.LuminanceSource;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.NotFoundException;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.GlobalHistogramBinarizer;
import com.google.zxing.common.HybridBinarizer;

/**
 * Locates and decodes a QR code in a real-world document photo.
 *
 * A single ZXing decode() call with default settings misses a large
 * fraction of genuine phone-camera ID photos: the QR patch can be
 * small relative to a huge (12MP+) photo, the card can be sideways
 * or upside down, and lighting/glare can trip up one binarizer but
 * not another. This tries a handful of cheap variations (downscale x
 * rotation x binarizer), and - if all of those fail - falls back to
 * scanning overlapping TILES of the original at full resolution,
 * since a small QR patch (e.g. one half of a composite front+back
 * photo) is often invisible after downscaling but perfectly readable
 * in a native-resolution crop, even on images that aren't huge
 * overall.
 */
public final class RobustQRDecoder {

    private static final Logger log = LoggerFactory.getLogger(RobustQRDecoder.class);

    private static final int[] ROTATIONS = {0, 90, 180, 270};

    // Multiple downscale targets - a QR that's too small to find at
    // one scale is sometimes easier to find at another (ZXing's
    // finder-pattern search has a sweet spot; too big or too small
    // both hurt).
    private static final int[] SCAN_WIDTHS = {1600, 1000, 2200};

    private static final int TILE_GRID = 3; // 3x3 grid
    private static final double TILE_OVERLAP = 0.20; // 20% overlap between tiles

    private RobustQRDecoder() {
    }

    /**
     * @param original the full uploaded image
     * @return the decoded ZXing Result (text + raw bytes), or null
     *         if no QR code could be located after all attempts
     */
    public static Result decode(BufferedImage original) {

        if (original == null) {
            return null;
        }

        int attempts = 0;

        for (BufferedImage candidate : wholeImageCandidates(original)) {

            attempts++;
            Result result = tryDecode(candidate);

            if (result != null) {
                log.info("QR decoded on whole-image pass #{} ({}x{})",
                        attempts, candidate.getWidth(), candidate.getHeight());
                return result;
            }
        }

        // Tiling used to be gated behind a large-image-only size check
        // (TILING_MIN_WIDTH), on the assumption that a moderate-sized
        // photo is already fully covered by the whole-image passes
        // above. In practice, composite images (e.g. front+back of
        // the card stacked into one photo) can have a QR patch that's
        // small relative to the *whole* image even when the image
        // itself isn't huge - downscaling it during the whole-image
        // passes shrinks that patch past the point ZXing can lock
        // onto the finder patterns. So tiling now always runs as a
        // fallback once the (cheap) whole-image passes have failed -
        // the extra cost is bounded and only paid on already-failing
        // images.
        for (BufferedImage tile : tileImage(original)) {

            attempts++;
            Result result = tryDecode(tile);

            if (result != null) {
                log.info("QR decoded on tiled pass #{} (tile {}x{} from {}x{} original)",
                        attempts, tile.getWidth(), tile.getHeight(),
                        original.getWidth(), original.getHeight());
                return result;
            }
        }

        log.info("QR not found after {} attempts on {}x{} image",
                attempts, original.getWidth(), original.getHeight());

        return null;
    }

    private static Map<DecodeHintType, Object> buildHints() {

        Map<DecodeHintType, Object> hints = new EnumMap<>(DecodeHintType.class);

        hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);
        hints.put(DecodeHintType.POSSIBLE_FORMATS, Collections.singletonList(BarcodeFormat.QR_CODE));

        return hints;
    }

    //-----------------------------------
    // Whole-image passes: several downscale widths x 4 rotations,
    // plus the untouched original.
    //-----------------------------------

    private static List<BufferedImage> wholeImageCandidates(BufferedImage original) {

        List<BufferedImage> candidates = new ArrayList<>();

        for (int targetWidth : SCAN_WIDTHS) {

            BufferedImage base = scaleToWidth(original, targetWidth);

            for (int angle : ROTATIONS) {
                candidates.add(angle == 0 ? base : rotate(base, angle));
            }
        }

        candidates.add(original);

        return candidates;
    }

    //-----------------------------------
    // Tiled passes: split the ORIGINAL (native resolution) into an
    // overlapping grid so a small QR patch keeps its full pixel
    // detail instead of being shrunk away by whole-image downscaling.
    // No rotation per tile (bounded attempt count) - if the card is
    // rotated, the whole-image rotation passes above already cover
    // that case.
    //-----------------------------------

    private static List<BufferedImage> tileImage(BufferedImage original) {

        List<BufferedImage> tiles = new ArrayList<>();

        int width = original.getWidth();
        int height = original.getHeight();

        int tileW = (int) Math.ceil((double) width / TILE_GRID);
        int tileH = (int) Math.ceil((double) height / TILE_GRID);

        int overlapW = (int) (tileW * TILE_OVERLAP);
        int overlapH = (int) (tileH * TILE_OVERLAP);

        for (int row = 0; row < TILE_GRID; row++) {
            for (int col = 0; col < TILE_GRID; col++) {

                int x = Math.max(0, col * tileW - overlapW);
                int y = Math.max(0, row * tileH - overlapH);
                int w = Math.min(width - x, tileW + 2 * overlapW);
                int h = Math.min(height - y, tileH + 2 * overlapH);

                if (w <= 0 || h <= 0) {
                    continue;
                }

                tiles.add(original.getSubimage(x, y, w, h));
            }
        }

        return tiles;
    }

    private static BufferedImage scaleToWidth(BufferedImage image, int targetWidth) {

        if (image.getWidth() <= targetWidth) {
            return image;
        }

        double scale = (double) targetWidth / image.getWidth();
        int newHeight = (int) Math.round(image.getHeight() * scale);

        BufferedImage scaled = new BufferedImage(targetWidth, newHeight, BufferedImage.TYPE_INT_RGB);

        Graphics2D g = scaled.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(image, 0, 0, targetWidth, newHeight, null);
        g.dispose();

        return scaled;
    }

    private static BufferedImage rotate(BufferedImage image, int angleDegrees) {

        double radians = Math.toRadians(angleDegrees);

        int w = image.getWidth();
        int h = image.getHeight();

        int newW = (angleDegrees == 180) ? w : h;
        int newH = (angleDegrees == 180) ? h : w;

        BufferedImage rotated = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_RGB);

        Graphics2D g = rotated.createGraphics();

        AffineTransform transform = new AffineTransform();
        transform.translate(newW / 2.0, newH / 2.0);
        transform.rotate(radians);
        transform.translate(-w / 2.0, -h / 2.0);

        g.drawImage(image, transform, null);
        g.dispose();

        return rotated;
    }

    private static Result tryDecode(BufferedImage image) {

        LuminanceSource source = new BufferedImageLuminanceSource(image);

        // Try the standard adaptive binarizer first (best for most
        // photos with uneven lighting), then fall back to the
        // global-histogram binarizer (sometimes succeeds where
        // HybridBinarizer fails on flat, evenly-lit scans).
        Result result = tryBinarizer(new HybridBinarizer(source));

        if (result == null) {
            result = tryBinarizer(new GlobalHistogramBinarizer(source));
        }

        return result;
    }

    private static Result tryBinarizer(Binarizer binarizer) {

        try {

            BinaryBitmap bitmap = new BinaryBitmap(binarizer);
            return new MultiFormatReader().decode(bitmap, buildHints());

        } catch (NotFoundException e) {

            return null;

        } catch (Exception e) {

            // Any other decode-time error (e.g. checksum failure on
            // a partially obscured QR) is treated the same as "not
            // found" rather than surfaced as a hard failure - other
            // rotation/binarizer/tile combinations may still succeed.
            return null;
        }
    }
}
