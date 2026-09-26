package com.sssit.bikerental.modules.verification.common.service;

import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sssit.bikerental.modules.verification.common.config.OCRConfig;
import com.sssit.bikerental.modules.verification.common.model.OCRData;
import com.sssit.bikerental.modules.verification.common.util.ImageUtil;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

@Service
public class OCRService {

    @Autowired
    private OCRConfig ocrConfig;

    public OCRData extractData(MultipartFile file) {

        File tempFile = null;
        File optimized = null;

        try {

            String originalFilename = file.getOriginalFilename();
            String extension = ".tmp";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            } else if (file.getContentType() != null && file.getContentType().contains("jpeg")) {
                extension = ".jpg";
            } else if (file.getContentType() != null && file.getContentType().contains("png")) {
                extension = ".png";
            }

            tempFile = File.createTempFile("ocr_", extension);

            Files.copy(
                    file.getInputStream(),
                    tempFile.toPath(),
                    StandardCopyOption.REPLACE_EXISTING
            );

            Tesseract tesseract = ocrConfig.newTesseract();

            // Perform OCR using ImageIO BufferedImage first to avoid extension/header format mismatches
            String text = null;
            try {
                BufferedImage img = ImageIO.read(tempFile);
                if (img != null) {
                    text = tesseract.doOCR(img);
                }
            } catch (Exception ignored) {
            }

            if (text == null || text.isBlank()) {
                text = tesseract.doOCR(tempFile);
            }

            if (text == null || text.trim().length() < 30) {
                optimized = ImageUtil.optimizeImage(tempFile);
                String optimizedText = tesseract.doOCR(optimized);
                if (optimizedText != null && (text == null || optimizedText.length() > text.length())) {
                    text = optimizedText;
                }
            }

            OCRData data = new OCRData();
            data.setRawText(text);

            extractAadhaar(text, data);
            extractDOB(text, data);
            extractGender(text, data);
            extractName(text, data);
            extractAddress(text, data);

            return data;

        } catch (TesseractException e) {

            throw new RuntimeException("OCR Extraction Failed: " + e.getMessage(), e);

        } catch (Exception e) {

            throw new RuntimeException("Error while processing OCR: " + e.getMessage(), e);

        } finally {

            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }

            if (optimized != null && optimized.exists()) {
                optimized.delete();
            }
        }
    }

    //-------------------------------------------------------
    // Aadhaar Number
    //-------------------------------------------------------

    private void extractAadhaar(String text, OCRData data) {
        String extracted = com.sssit.bikerental.modules.verification.aadhaar.regex.AadhaarRegexExtractor.extractAadhaarNumber(text);
        if (extracted != null) {
            data.setAadhaarNumber(extracted);
        }
    }

    //-------------------------------------------------------
    // DOB
    //-------------------------------------------------------

    private void extractDOB(String text, OCRData data) {

        String[] lines = text.split("\\r?\\n");

        // Prefer a date on a line explicitly labelled DOB / Date of
        // Birth. A full Aadhaar PDF (enrolment slip + card front +
        // card back all in one image) also contains an "Aadhaar no.
        // issued: dd/mm/yyyy" date, which is also date-shaped and
        // often appears earlier in the document - so blindly taking
        // the first date in the whole text can grab the issue date
        // instead of the actual date of birth.
        for (String line : lines) {

            String lower = line.toLowerCase();

            if (lower.contains("issued")) {
                continue;
            }

            if (lower.contains("dob") || lower.contains("date of birth")) {

                Matcher matcher = DOB_LINE_PATTERN.matcher(line);

                if (matcher.find()) {
                    data.setDob(matcher.group());
                    return;
                }
            }
        }

        // Fallback: no explicit DOB label found (e.g. the "DOB"
        // label itself got OCR-garbled, which happens often on
        // busy bilingual scans). Take the LAST date-shaped value in
        // the document rather than the first: on a full two-sided
        // Aadhaar scan (enrolment slip + front + back all in one
        // image), the front/enrolment block's "Aadhaar no. issued"
        // date always appears before the back/photo block's actual
        // date of birth, so the last match is far more likely to be
        // correct than the first. The "issued" line itself is
        // explicitly excluded from candidates below - taking it as
        // DOB would be confidently wrong rather than merely
        // imprecise, and if it's the ONLY date-shaped match (e.g.
        // the real DOB got OCR-garbled into an unparseable shape),
        // it's better to leave DOB blank than report the issue date.
        String[] textLines = text.split("\\r?\\n");
        String lastMatch = null;

        for (String line : textLines) {

            String lowerLine = line.toLowerCase();

            // "Details as on: dd/mm/yyyy" (the print/download
            // timestamp UIDAI stamps on every Aadhaar PDF) and
            // similar administrative dates are also date-shaped and
            // typically appear even later in the document than the
            // real DOB line, which was outranking the genuine DOB
            // under the "take the last match" fallback below.
            if (containsAny(lowerLine, DOB_FALLBACK_EXCLUDED_PHRASES)) {
                continue;
            }

            Matcher lineMatcher = DOB_LINE_PATTERN.matcher(line);

            while (lineMatcher.find()) {
                lastMatch = lineMatcher.group();
            }
        }

        if (lastMatch != null) {
            data.setDob(lastMatch);
        }
    }

    //-------------------------------------------------------
    // Gender
    //-------------------------------------------------------

    private void extractGender(String text, OCRData data) {

        String lower = text.toLowerCase();

        if (lower.contains("male")) {
            data.setGender("Male");
        } else if (lower.contains("female")) {
            data.setGender("Female");
        }
    }

    //-------------------------------------------------------
    // Name
    //-------------------------------------------------------

    // Matches a DOB value like 02/08/2004 or 02-08-2004
    private static final Pattern DOB_LINE_PATTERN =
            Pattern.compile("\\d{2}[/-]\\d{2}[/-]\\d{4}");

    // Administrative/print timestamps that are date-shaped but are
    // never the person's DOB - excluded from the "last date-shaped
    // line" fallback in extractDOB so they can't outrank the real
    // DOB line.
    private static final String[] DOB_FALLBACK_EXCLUDED_PHRASES = {
            "issued", "details as on", "printed on", "downloaded on",
            "generated on", "verified on"
    };

    private void extractName(String text, OCRData data) {

        String[] lines = text.split("\\r?\\n");

        //-------------------------------------------------------
        // Strategy 0 (most reliable, tried first): official UIDAI
        // Aadhaar "enrolment letter" PDFs always print the name
        // directly after a standalone "To" line, e.g.:
        //     To
        //     <name in regional language>
        //     <name in English>
        //     C/O: ...
        // This anchor is unambiguous and, unlike Strategy 1/1b
        // below, isn't confused by multi-page scans that contain
        // several DOB/Gender blocks (enrolment slip + card front +
        // card back all in one image/PDF).
        //-------------------------------------------------------

        int toIndex = -1;

        for (int i = 0; i < lines.length; i++) {
            if (isToAnchorLine(lines[i])) {
                toIndex = i;
                break;
            }
        }

        if (toIndex >= 0) {

            String candidate = findNameCandidate(lines, toIndex + 1, lines.length - 1, true);

            if (candidate != null) {
                data.setName(candidate);
                return;
            }
        }

        //-------------------------------------------------------
        // Strategy 1 (preferred): on every standard Aadhaar
        // layout, the name is the line immediately above the
        // DOB line. This avoids picking up footer/contact text
        // (e.g. "help@uidai.gov.in | www.uidai.gov.in") which
        // can otherwise out-score the real name when the image
        // contains both the front and back of the card, or other
        // long address/footer lines.
        //-------------------------------------------------------

        int dobIndex = -1;

        for (int i = 0; i < lines.length; i++) {

            // Skip the "Aadhaar no. issued: dd/mm/yyyy" line - it's
            // also date-shaped but is NOT the person's DOB, and
            // anchoring here grabs whatever garbled text sits above
            // the issue line instead of the real name.
            if (lines[i].toLowerCase().contains("issued")) {
                continue;
            }

            if (DOB_LINE_PATTERN.matcher(lines[i]).find()) {
                dobIndex = i;
                break;
            }
        }

        if (dobIndex > 0) {

            String candidate = findNameCandidate(lines, dobIndex - 1, 0, false);

            if (candidate != null) {
                data.setName(candidate);
                return;
            }
        }

        //-------------------------------------------------------
        // Strategy 1b: no DOB line found (some crops/scans omit
        // it), but the Gender line ("Male"/"Female") is almost
        // always right below the name on an Aadhaar card. This is
        // still a positional anchor - far more reliable than the
        // blind word-count scoring in Strategy 2 below, which can
        // be fooled by OCR noise that happens to contain more
        // "word-shaped" tokens than the real name.
        //-------------------------------------------------------

        int genderIndex = -1;

        for (int i = 0; i < lines.length; i++) {

            String lower = lines[i].toLowerCase();

            if (lower.contains("male") || lower.contains("female")) {
                genderIndex = i;
                break;
            }
        }

        if (genderIndex > 0) {

            String candidate = findNameCandidate(lines, genderIndex - 1, 0, false);

            if (candidate != null) {
                data.setName(candidate);
                return;
            }
        }

        //-------------------------------------------------------
        // Strategy 2 (fallback): no DOB or Gender line found, e.g.
        // blurry scan. Fall back to scoring every valid line and
        // taking the highest-scoring one. Least reliable strategy -
        // only reached when there's no positional anchor at all.
        //-------------------------------------------------------

        String bestName = null;
        int bestScore = 0;

        for (String line : lines) {

            String cleaned = cleanNameLine(line);

            if (cleaned == null)
                continue;

            int score = wordScore(cleaned);

            if (score > bestScore) {
                bestScore = score;
                bestName = cleaned;
            }
        }

        if (bestName != null) {
            data.setName(bestName);
        }
    }

    /**
     * Scans lines starting at `from`, moving toward `to` (inclusive),
     * looking for a name candidate anchored near a DOB/Gender/"To"
     * line. Prefers a line where every word is in proper Title Case
     * (e.g. "Koothati Karthik") - the pattern a genuine printed
     * English name always has. This distinguishes the real name
     * from adjacent regional-language text that Tesseract (an
     * English-trained model) often garbles into short lowercase or
     * ALL-CAPS "words" that would otherwise also pass the generic
     * word-count check in cleanNameLine (e.g. "Sek SOE", "Bie aso ane").
     *
     * If no Title-Case candidate is found in the scanned range,
     * falls back to the first line that merely passes cleanNameLine,
     * to preserve the original behavior for documents printed in a
     * different case style.
     */
    private String findNameCandidate(String[] lines, int from, int to, boolean forward) {

        String fallback = null;

        int i = from;

        while (forward ? i <= to : i >= to) {

            String candidate = cleanNameLine(lines[i]);

            if (candidate != null) {

                if (isProperCaseName(candidate)) {
                    return candidate;
                }

                if (fallback == null) {
                    fallback = candidate;
                }
            }

            i = forward ? i + 1 : i - 1;
        }

        return fallback;
    }

    // Matches a properly capitalized word, e.g. "Karthik", "Sadwika"
    private static final Pattern TITLE_CASE_WORD = Pattern.compile("^[A-Z][a-z]+$");

    private boolean isProperCaseName(String cleaned) {

        String[] words = cleaned.split("\\s+");

        for (String word : words) {
            if (!TITLE_CASE_WORD.matcher(word).matches()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Detects the standalone "To" line at the top of an Aadhaar
     * enrolment letter, tolerant of common single-character OCR
     * misreads of this very short word (e.g. Tesseract reading
     * "To" as "Te", "T0", "1o", etc.). Restricted to very short
     * (<= 3 character) lines so it can't accidentally match
     * unrelated text elsewhere in the document.
     */
    private boolean isToAnchorLine(String rawLine) {

        if (rawLine == null) {
            return false;
        }

        String cleaned = rawLine.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "");

        if (cleaned.isEmpty() || cleaned.length() > 3) {
            return false;
        }

        // "ww" is a specific, observed Tesseract misread of "To"
        // (both characters garbled) on busy bilingual scans -
        // allowlisted explicitly rather than raising the general
        // edit-distance tolerance to 2, which would match almost
        // any 2-character noise line and cause false positives
        // elsewhere in the document.
        if (cleaned.equals("ww")) {
            return true;
        }

        return smallEditDistance(cleaned, "to") <= 1;
    }

    /**
     * Levenshtein edit distance, used only for the short "To"
     * anchor check above (not a general-purpose replacement for
     * the Aadhaar name-matching distance check in AadhaarServiceImpl).
     */
    private int smallEditDistance(String a, String b) {

        int[][] dp = new int[a.length() + 1][b.length() + 1];

        for (int i = 0; i <= a.length(); i++) {
            dp[i][0] = i;
        }

        for (int j = 0; j <= b.length(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {

                int cost = (a.charAt(i - 1) == b.charAt(j - 1)) ? 0 : 1;

                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
            }
        }

        return dp[a.length()][b.length()];
    }

    /**
     * Cleans a raw OCR line and returns it only if it's a plausible
     * name candidate (score >= 2). Returns null for blank, junk
     * (labels/footer/contact info), Aadhaar-number, or too-short lines.
     */
    private String cleanNameLine(String rawLine) {

        if (rawLine == null)
            return null;

        String line = rawLine.trim();

        if (line.isBlank())
            return null;

        String lower = line.toLowerCase();

        // Ignore any labeled field line (C/O:, DOB:, VTC:, PO:,
        // District:, State:, PIN Code:, etc.) - a genuine printed
        // name line never contains a colon, but stripping the
        // colon+punctuation from a label line during cleaning can
        // otherwise leave behind something that looks name-shaped
        // (e.g. "C/O: Daram Venkanna," -> "Daram Venkanna").
        if (line.contains(":"))
            return null;

        // Ignore label / section lines
        if (lower.contains("government")
                || lower.contains("india")
                || lower.contains("aadhaar")
                || lower.contains("aadhar")
                || lower.contains("male")
                || lower.contains("female")
                || lower.contains("dob")
                || lower.contains("address")
                || lower.contains("vid"))
            return null;

        // Ignore footer / contact-info lines
        // (email, website, helpline, UIDAI signature block)
        if (line.contains("@")
                || lower.contains("www")
                || lower.contains("http")
                || lower.contains("uidai")
                || lower.contains("help"))
            return null;

        // Skip Aadhaar number line
        if (line.matches(".*\\d{4}\\s*\\d{4}\\s*\\d{4}.*"))
            return null;

        // Remove numbers and special characters
        String cleaned = line.replaceAll("[^A-Za-z ]", " ");

        // Remove extra spaces
        cleaned = cleaned.replaceAll("\\s+", " ").trim();

        // Remove single OCR noise at beginning
        cleaned = cleaned.replaceAll("^[A-Za-z]\\s+", "");

        // Remove single OCR noise at end (example: Kalyan z)
        cleaned = cleaned.replaceAll("\\s+[A-Za-z]$", "");

        if (cleaned.length() < 5)
            return null;

        if (wordScore(cleaned) < 2)
            return null;

        return cleaned;
    }

    private int wordScore(String cleaned) {

        String[] words = cleaned.split("\\s+");

        int score = 0;

        for (String word : words) {

            // Ignore one/two-letter words
            if (word.length() >= 3) {
                score++;
            }
        }

        return score;
    }

    //-------------------------------------------------------
    // Address
    //-------------------------------------------------------

    // Where an Aadhaar card's address block genuinely ends and the
    // bilingual "INFORMATION" footer / UIDAI boilerplate begins.
    // The old version had no stop condition at all and would run
    // straight through this footer, producing garbage like "...
    // helps you avail of varius Government and Non-Government
    // benefits/services ... www.uidai.gov.in" appended onto the
    // real address.
    private static final String[] ADDRESS_STOP_WORDS = {
            "information", "help@", "www", "uidai", "gov.in",
            "signature", "vid", "issued", "download", "maadhaar",
            "lock/unlock", "biometrics", "consent", "aadhaar is proof",
            "aadhaar no.", "your aadhaar no", "digitally signed"
    };

    // Safety cap so a card with no clear end-of-address marker
    // doesn't vacuum up the rest of the document.
    private static final int MAX_ADDRESS_LINES = 8;

    private void extractAddress(String text, OCRData data) {

        StringBuilder address = new StringBuilder();

        boolean start = false;
        int collected = 0;
        int consecutiveBlanks = 0;

        for (String line : text.split("\\r?\\n")) {

            String lower = line.toLowerCase();

            // Must actually be the "Address:" label line, not just
            // any line that happens to mention the word "address" -
            // the Aadhaar back panel's INFORMATION section contains
            // prose like "...identity and address should be updated
            // in..." which would otherwise falsely trigger here
            // (and start collecting footer text) well before the
            // real Address: label further down the document.
            if (!start && lower.trim().startsWith("address")) {
                start = true;
                continue;
            }

            if (!start) {
                continue;
            }

            if (collected >= MAX_ADDRESS_LINES) {
                break;
            }

            if (containsAny(lower, ADDRESS_STOP_WORDS)) {
                break;
            }

            if (line.matches(".*\\d{4}\\s*\\d{4}\\s*\\d{4}.*")) {
                break;
            }

            if (line.isBlank()) {

                consecutiveBlanks++;

                if (consecutiveBlanks >= 2) {
                    break;
                }

                continue;
            }

            consecutiveBlanks = 0;

            String cleaned = cleanAddressLine(line);

            if (cleaned != null && !cleaned.isBlank()) {
                address.append(cleaned).append(" ");
                collected++;
            }

            // A genuine Aadhaar address block always ends with a
            // 6-digit PIN code (e.g. "Telangana - 508001"). Once
            // we've captured that line, stop - anything after it is
            // footer/disclaimer text (often OCR-garbled regional
            // script that got misread as noisy Latin characters),
            // not part of the address. Without this, that trailing
            // garbage was getting appended onto an otherwise-correct
            // address.
            if (line.matches(".*\\b\\d{6}\\b.*")) {
                break;
            }
        }

        if (!address.toString().isBlank()) {
            data.setAddress(address.toString().trim());
        }
    }

    private boolean containsAny(String text, String[] words) {

        for (String word : words) {
            if (text.contains(word)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Drops lines/tokens that are just OCR noise - e.g. a lone digit
     * or letter picked up from a stray mark near the address block -
     * while keeping genuine short address lines like house numbers
     * ("2-125").
     */
    private String cleanAddressLine(String line) {

        if (line == null) {
            return null;
        }

        String trimmed = line.trim();

        if (trimmed.length() <= 2 && !trimmed.matches("[0-9][0-9,-]*")) {
            return null;
        }

        String cleaned = trimmed.replaceAll("(^|\\s)[A-Za-z0-9](\\s|$)", " ")
                .replaceAll("\\s+", " ")
                .trim();

        return cleaned.isBlank() ? null : cleaned;
    }
}