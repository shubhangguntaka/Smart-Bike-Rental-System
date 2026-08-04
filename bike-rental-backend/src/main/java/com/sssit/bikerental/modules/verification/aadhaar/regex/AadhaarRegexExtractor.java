package com.sssit.bikerental.modules.verification.aadhaar.regex;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AadhaarRegexExtractor {

    private AadhaarRegexExtractor() {
    }

    public static String extractAadhaarNumber(String text) {

        Pattern pattern =
                Pattern.compile("\\d{4}\\s?\\d{4}\\s?\\d{4}");

        Matcher matcher =
                pattern.matcher(text);

        if (matcher.find()) {

            return matcher.group()
                    .replaceAll("\\s+", "");

        }

        return null;

    }

}