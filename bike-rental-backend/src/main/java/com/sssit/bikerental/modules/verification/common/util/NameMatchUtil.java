package com.sssit.bikerental.modules.verification.common.util;

/**
 * Shared fuzzy name-comparison logic used by both Aadhaar (OCR vs QR)
 * and Driving License (DL vs verified Aadhaar) checks.
 *
 * Three kinds of noise are all expected and all legitimate here:
 *   - OCR misreads a character or two (e.g. "Koothati" -> "Koothani").
 *   - The same person's name is simply ORDERED differently across
 *     documents (e.g. Aadhaar shows "Koothayi Karthik" - surname
 *     first - while the Driving License shows "Karthik Koothati" -
 *     given name first, plus an OCR misread on the surname). This is
 *     common enough on real Indian ID documents that requiring the
 *     words to line up in the same order would reject genuine
 *     matches.
 *   - One document spells a name out in full while the other
 *     abbreviates it to just its initial (e.g. Aadhaar: "Daram Shiva
 *     Sai Kalyan" vs Driving License: "D Shiva Sai Kalyan"). This is
 *     a common, legitimate convention on Indian DLs.
 *
 * Requiring a byte-exact, in-order match would reject perfectly
 * genuine documents over any of these, so this allows small per-word
 * differences, word-order differences, AND initial-vs-full-word
 * differences, while still catching a name that's genuinely
 * different (every other word in the name still has to match closely
 * on its own).
 */
public final class NameMatchUtil {

    // Allow up to ~20% character-level difference on a whole-string
    // comparison - enough to absorb one or two OCR misreads on a
    // normal-length name, while still rejecting a genuinely different
    // name.
    private static final double SIMILARITY_THRESHOLD = 0.80;

    // Slightly more lenient per-WORD threshold used for the
    // order-independent comparison below: individual words are
    // short, so a single misread letter is a bigger fraction of the
    // word than it would be of the full name.
    private static final double TOKEN_SIMILARITY_THRESHOLD = 0.72;

    private NameMatchUtil() {
    }

    public static boolean namesRoughlyMatch(String name1, String name2) {

        String a = normalize(name1);
        String b = normalize(name2);

        if (a.isEmpty() || b.isEmpty()) {
            return false;
        }

        if (a.equals(b)) {
            return true;
        }

        // Whole-string comparison: catches OCR noise on names that
        // are already in the same word order.
        if (similarity(a, b) >= SIMILARITY_THRESHOLD) {
            return true;
        }

        // Word-order-independent comparison: catches the same set of
        // names (each individually allowed to be a bit noisy) written
        // in a different order - e.g. surname-first on one document,
        // given-name-first on the other.
        return tokensRoughlyMatch(a, b);
    }

    /**
     * True if every word in the SHORTER name has a close match
     * (regardless of position) among the words of the other name.
     * Extra words in the longer name are ignored - e.g. a middle
     * name present on one document but not the other shouldn't fail
     * the match on its own.
     */
    private static boolean tokensRoughlyMatch(String a, String b) {

        String[] tokensA = a.split(" ");
        String[] tokensB = b.split(" ");

        String[] shorter = tokensA.length <= tokensB.length ? tokensA : tokensB;
        String[] longer = tokensA.length <= tokensB.length ? tokensB : tokensA;

        if (shorter.length == 0 || longer.length == 0) {
            return false;
        }

        boolean[] used = new boolean[longer.length];

        for (String shortToken : shorter) {

            int bestIndex = -1;
            double bestSimilarity = 0;

            for (int i = 0; i < longer.length; i++) {

                if (used[i]) {
                    continue;
                }

                double sim = isInitialMatch(shortToken, longer[i])
                        ? 1.0
                        : similarity(shortToken, longer[i]);

                if (sim > bestSimilarity) {
                    bestSimilarity = sim;
                    bestIndex = i;
                }
            }

            if (bestIndex == -1 || bestSimilarity < TOKEN_SIMILARITY_THRESHOLD) {
                // This word from the shorter name has no reasonable
                // match anywhere in the other name - not the same
                // person.
                return false;
            }

            used[bestIndex] = true;
        }

        return true;
    }

    /**
     * True if one of the two tokens is a single letter and it equals
     * the first letter of the other token - e.g. "d" vs "daram".
     *
     * This is a very common, legitimate convention on Indian ID
     * documents, where a given/father's name is spelled out in full
     * on one document (e.g. Aadhaar: "Daram Shiva Sai Kalyan") and
     * abbreviated to just its initial on another (e.g. DL: "D Shiva
     * Sai Kalyan"). Treating it as a full mismatch would reject
     * genuine documents.
     *
     * This does not weaken the overall check: it only ever helps ONE
     * word pair match, and namesRoughlyMatch still requires every
     * other word in the name to independently match closely too - so
     * an unrelated name that merely starts with the same letter still
     * gets rejected on its other words.
     */
    private static boolean isInitialMatch(String tokenA, String tokenB) {

        if (tokenA.length() == 1 && tokenB.length() > 1) {
            return tokenA.charAt(0) == tokenB.charAt(0);
        }

        if (tokenB.length() == 1 && tokenA.length() > 1) {
            return tokenB.charAt(0) == tokenA.charAt(0);
        }

        return false;
    }

    private static double similarity(String a, String b) {

        if (a.equals(b)) {
            return 1.0;
        }

        int maxLen = Math.max(a.length(), b.length());

        if (maxLen == 0) {
            return 0;
        }

        int distance = editDistance(a, b);

        return 1.0 - ((double) distance / maxLen);
    }

    /**
     * Normalize a name for comparison: lowercase, strip anything
     * that isn't a letter or space, collapse whitespace.
     */
    public static String normalize(String name) {

        if (name == null) {
            return "";
        }

        return name.toLowerCase()
                .replaceAll("[^a-z ]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Compare two dates that may be formatted with either "/" or "-"
     * separators (e.g. "01/07/2004" vs "01-07-2004") by normalizing
     * to digits-only before comparing.
     */
    public static boolean datesMatch(String date1, String date2) {

        if (date1 == null || date2 == null) {
            return false;
        }

        String d1 = date1.replaceAll("[^0-9]", "");
        String d2 = date2.replaceAll("[^0-9]", "");

        return !d1.isEmpty() && d1.equals(d2);
    }

    private static int editDistance(String a, String b) {

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
}
