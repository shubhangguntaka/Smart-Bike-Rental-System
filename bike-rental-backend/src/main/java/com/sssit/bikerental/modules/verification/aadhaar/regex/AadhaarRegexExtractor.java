package com.sssit.bikerental.modules.verification.aadhaar.regex;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.sssit.bikerental.modules.verification.common.util.DocumentIdentifierUtil;

public class AadhaarRegexExtractor {

    private static final Pattern AADHAAR_GROUPED_PATTERN =
            Pattern.compile("(?<!\\d)([2-9]\\d{3})[\\s-]?(\\d{4})[\\s-]?(\\d{4})(?!\\d)");

    private static final Pattern GENERIC_12_DIGIT_PATTERN =
            Pattern.compile("(?<!\\d)(\\d{4})[\\s-]?(\\d{4})[\\s-]?(\\d{4})(?!\\d)");

    private AadhaarRegexExtractor() {
    }

    public static String extractAadhaarNumber(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        List<AadhaarCandidate> candidates = new ArrayList<>();
        String[] lines = text.split("\\r?\\n");

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            String lowerLine = line.toLowerCase();

            // Ignore enrollment number lines or VID lines if labeled as such
            if (lowerLine.contains("enrollment") || lowerLine.contains("enrolment") || lowerLine.contains("vid :")) {
                continue;
            }

            Matcher matcher = GENERIC_12_DIGIT_PATTERN.matcher(line);
            while (matcher.find()) {
                String rawMatch = matcher.group();
                String normalized = DocumentIdentifierUtil.normalizeAadhaarNumber(rawMatch);

                if (!DocumentIdentifierUtil.isValidAadhaarNumber(normalized)) {
                    continue;
                }

                int score = 0;
                // Standard Aadhaar begins with 2-9
                if (normalized.charAt(0) >= '2' && normalized.charAt(0) <= '9') {
                    score += 100;
                }

                // Check for grouped spacing format "XXXX XXXX XXXX" (very common on Aadhaar cards)
                if (rawMatch.contains(" ")) {
                    score += 40;
                }

                // Check context in surrounding lines
                int startCtx = Math.max(0, i - 2);
                int endCtx = Math.min(lines.length - 1, i + 2);
                for (int c = startCtx; c <= endCtx; c++) {
                    String ctx = lines[c].toLowerCase();
                    if (ctx.contains("aadhaar") || ctx.contains("aadhar") || ctx.contains("uidai")
                            || ctx.contains("unique identification") || ctx.contains("government of india")
                            || ctx.contains("mera aadhaar") || ctx.contains("my aadhaar") || ctx.contains("help@uidai.gov.in")) {
                        score += 50;
                        break;
                    }
                }

                candidates.add(new AadhaarCandidate(normalized, score));
            }
        }

        if (candidates.isEmpty()) {
            // Direct regex search across entire raw text as fallback
            Matcher matcher = AADHAAR_GROUPED_PATTERN.matcher(text);
            if (matcher.find()) {
                String candidate = DocumentIdentifierUtil.normalizeAadhaarNumber(matcher.group());
                if (DocumentIdentifierUtil.isValidAadhaarNumber(candidate)) {
                    return candidate;
                }
            }
            return null;
        }

        candidates.sort((a, b) -> Integer.compare(b.score, a.score));
        return candidates.get(0).number;
    }

    private static class AadhaarCandidate {
        final String number;
        final int score;

        AadhaarCandidate(String number, int score) {
            this.number = number;
            this.score = score;
        }
    }
}