package com.sssit.bikerental.modules.verification.common.config;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import net.sourceforge.tess4j.Tesseract;

/**
 * Builds a fresh Tesseract instance per OCR call.
 *
 * IMPORTANT: this used to be a singleton @Bean (one Tesseract shared
 * by every request). Tess4J's Tesseract wraps a single native
 * TessBaseAPI handle and is NOT thread-safe - two overlapping
 * requests driving the same instance from different threads corrupt
 * its internal native buffers and crash with
 * "java.lang.Error: Invalid memory access" deep inside JNA
 * (intermittent, hard to reproduce, and unrelated to any particular
 * image). Handing out a brand-new instance per call removes any
 * state shared between threads, at the cost of Tesseract's cheap
 * per-instance init overhead - a small price for not crashing under
 * concurrent load.
 *
 * PORTABILITY: the .traineddata language files no longer live at a
 * developer-specific path. They are bundled inside the jar under
 * src/main/resources/tessdata/ and copied out to a per-machine cache
 * folder ("~/.bikerental/tessdata") the first time the app starts.
 * From then on every environment - your laptop, a teammate's laptop,
 * CI, or the deployment server - resolves the exact same way with
 * zero manual setup. TESSDATA_PREFIX / -Dtessdata.path are still
 * honored first, in case someone wants to override with a system
 * install, but nothing requires them to be set anymore.
 *
 * NOTE - this only solves the language-data half of the story. Tess4J
 * still calls into the native Tesseract/Leptonica engine via JNA.
 * That native engine is NOT something you can bundle as a plain
 * classpath resource for every OS. See the deployment notes at the
 * bottom of this file (or the chat message this came with) for what
 * that means for Windows vs Linux deployment.
 */
@Component
public class OCRConfig {

    private static final Logger log = LoggerFactory.getLogger(OCRConfig.class);

    // Names of the trained-data files bundled at src/main/resources/tessdata/.
    // "tel.traineddata" is optional - if it isn't on the classpath we quietly
    // fall back to English-only, same as before.
    private static final String[] BUNDLED_LANG_FILES = { "eng.traineddata", "tel.traineddata" };

    private static final String DATAPATH = resolveDatapath();
    private static final String LANGUAGE = resolveLanguage();

    public Tesseract newTesseract() {
        return newTesseract(3);
    }

    public Tesseract newTesseract(int pageSegMode) {
        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(DATAPATH);
        tesseract.setLanguage(LANGUAGE);
        tesseract.setPageSegMode(pageSegMode);
        tesseract.setOcrEngineMode(1);
        return tesseract;
    }

    private static String resolveDatapath() {

        // 1) Explicit override - someone deliberately pointing at a system
        //    Tesseract install.
        String fromEnv = System.getenv("TESSDATA_PREFIX");
        if (fromEnv != null && !fromEnv.isBlank()) {
            log.info("Using TESSDATA_PREFIX override: {}", fromEnv);
            return fromEnv;
        }

        String fromProperty = System.getProperty("tessdata.path");
        if (fromProperty != null && !fromProperty.isBlank()) {
            log.info("Using -Dtessdata.path override: {}", fromProperty);
            return fromProperty;
        }

        // 2) Default, portable path: extract the bundled .traineddata files
        //    from the jar to a per-machine cache folder, once.
        return extractBundledTessdata();
    }

    private static String extractBundledTessdata() {

        Path cacheDir = Paths.get(System.getProperty("user.home"), ".bikerental", "tessdata");

        try {
            Files.createDirectories(cacheDir);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Could not create tessdata cache directory at " + cacheDir, e);
        }

        for (String fileName : BUNDLED_LANG_FILES) {
            Path target = cacheDir.resolve(fileName);

            if (Files.exists(target)) {
                continue; // already extracted on a previous run
            }

            String resourcePath = "tessdata/" + fileName;
            try (InputStream in = OCRConfig.class.getClassLoader().getResourceAsStream(resourcePath)) {
                if (in == null) {
                    // eng.traineddata missing is a hard failure (OCR can't run at all).
                    // tel.traineddata missing is fine - resolveLanguage() handles that.
                    if (fileName.equals("eng.traineddata")) {
                        throw new IllegalStateException(
                                "Required resource '" + resourcePath + "' not found on classpath. "
                                        + "Add it at src/main/resources/tessdata/eng.traineddata.");
                    }
                    log.info("Optional resource '{}' not bundled - skipping.", resourcePath);
                    continue;
                }

                try (OutputStream out = Files.newOutputStream(target)) {
                    in.transferTo(out);
                }
                log.info("Extracted bundled '{}' to {}", fileName, target);

            } catch (IOException e) {
                throw new IllegalStateException("Failed extracting " + resourcePath + " to " + target, e);
            }
        }

        log.info("Using extracted tessdata cache at {}", cacheDir);
        return cacheDir.toString();
    }

    private static String resolveLanguage() {

        File telData = new File(DATAPATH, "tel.traineddata");

        if (telData.isFile()) {
            return "eng+tel";
        }

        log.warn("tel.traineddata not found in '{}' - OCR will run in English-only "
                + "mode. Regional-language text on bilingual Aadhaar/DL cards will be "
                + "misread as noisy English, which can degrade name/address/DOB "
                + "extraction. Add tel.traineddata to src/main/resources/tessdata/ "
                + "to enable bilingual OCR.", DATAPATH);

        return "eng";
    }
}
