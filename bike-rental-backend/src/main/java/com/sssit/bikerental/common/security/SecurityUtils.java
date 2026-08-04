package com.sssit.bikerental.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.user.User;

/**
 * Reusable static utilities to check authentication state and retrieve
 * current authenticated user attributes from the Security Context.
 */
public class SecurityUtils {

    private SecurityUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Check if user is currently authenticated.
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getPrincipal());
    }

    /**
     * Get currently authenticated User object.
     */
    public static User getCurrentUser() {
        if (!isAuthenticated()) {
            return null;
        }
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        return null;
    }

    /**
     * Get currently authenticated user's ID.
     */
    public static Long getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    /**
     * Get currently authenticated user's role.
     */
    public static Role getCurrentRole() {
        User user = getCurrentUser();
        return user != null ? user.getRole() : null;
    }
}
