package com.sssit.bikerental.modules.verification.common.util;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Reusable utility for recognizing and validating Indian State and Union Territory
 * codes used in vehicle registration certificates (RC) and driving licenses (DL).
 */
public final class IndianStateCodeUtil {

    private static final Map<String, String> STATE_CODE_MAP;

    static {
        Map<String, String> map = new HashMap<>();
        map.put("AN", "Andaman and Nicobar Islands");
        map.put("AP", "Andhra Pradesh");
        map.put("AR", "Arunachal Pradesh");
        map.put("AS", "Assam");
        map.put("BR", "Bihar");
        map.put("CG", "Chhattisgarh");
        map.put("CH", "Chandigarh");
        map.put("DD", "Daman and Diu");
        map.put("DN", "Dadra and Nagar Haveli");
        map.put("DL", "Delhi");
        map.put("GA", "Goa");
        map.put("GJ", "Gujarat");
        map.put("HR", "Haryana");
        map.put("HP", "Himachal Pradesh");
        map.put("JH", "Jharkhand");
        map.put("JK", "Jammu and Kashmir");
        map.put("KA", "Karnataka");
        map.put("KL", "Kerala");
        map.put("LA", "Ladakh");
        map.put("LD", "Lakshadweep");
        map.put("MP", "Madhya Pradesh");
        map.put("MH", "Maharashtra");
        map.put("MN", "Manipur");
        map.put("ML", "Meghalaya");
        map.put("MZ", "Mizoram");
        map.put("NL", "Nagaland");
        map.put("OD", "Odisha");
        map.put("OR", "Odisha"); // Historical Orissa code
        map.put("PB", "Punjab");
        map.put("PY", "Puducherry");
        map.put("RJ", "Rajasthan");
        map.put("SK", "Sikkim");
        map.put("TN", "Tamil Nadu");
        map.put("TR", "Tripura");
        map.put("TS", "Telangana");
        map.put("TG", "Telangana"); // Telangana state transport code
        map.put("UK", "Uttarakhand");
        map.put("UA", "Uttarakhand"); // Historical Uttaranchal code
        map.put("UP", "Uttar Pradesh");
        map.put("WB", "West Bengal");
        map.put("IN", "India (Bharat Series / All India)");
        STATE_CODE_MAP = Collections.unmodifiableMap(map);
    }

    private IndianStateCodeUtil() {
        // Utility class
    }

    /**
     * Checks if the given 2-character code represents a recognized Indian state or UT.
     *
     * @param code Two-character state code (case-insensitive)
     * @return true if valid recognized state code
     */
    public static boolean isValidStateCode(String code) {
        if (code == null || code.trim().length() != 2) {
            return false;
        }
        return STATE_CODE_MAP.containsKey(code.trim().toUpperCase());
    }

    /**
     * Returns the name of the state or UT corresponding to the 2-character code.
     *
     * @param code Two-character state code
     * @return State name or null if unrecognized
     */
    public static String getStateName(String code) {
        if (code == null) return null;
        return STATE_CODE_MAP.get(code.trim().toUpperCase());
    }

    /**
     * Returns all recognized 2-character state codes.
     */
    public static Set<String> getAllStateCodes() {
        return STATE_CODE_MAP.keySet();
    }
}
