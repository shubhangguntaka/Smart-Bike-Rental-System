package com.sssit.bikerental.security.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.exception.ResourceOwnershipException;
import com.sssit.bikerental.common.exception.UnauthorizedOperationException;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Reusable Security Service providing helper methods for current user details,
 * role checks, ownership validation, and PreAuthorize security expressions.
 */
@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final UserRepository userRepository;

    /**
     * Get currently authenticated User details.
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedOperationException("User is not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedOperationException("User not found"));
    }

    /**
     * Get currently authenticated user's ID.
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Get currently authenticated user's role.
     */
    public Role getCurrentUserRole() {
        return getCurrentUser().getRole();
    }

    /**
     * Check if currently authenticated user is an ADMIN.
     */
    public boolean isAdmin() {
        return getCurrentUserRole() == Role.ADMIN;
    }

    /**
     * Check if currently authenticated user is an OWNER.
     */
    public boolean isOwner() {
        return getCurrentUserRole() == Role.OWNER;
    }

    /**
     * Check if currently authenticated user is a CUSTOMER.
     */
    public boolean isCustomer() {
        return getCurrentUserRole() == Role.CUSTOMER;
    }

    /**
     * Check if the authenticated user is the target user (or ADMIN).
     */
    public boolean canAccessUser(Long userId) {
        if (isAdmin()) {
            return true;
        }
        return isCurrentUser(userId);
    }

    /**
     * Check if user is exactly the current user.
     */
    public boolean isCurrentUser(Long userId) {
        return getCurrentUserId().equals(userId);
    }

    /**
     * Check if owner is exactly the current owner.
     */
    public boolean isCurrentOwner(Long ownerId) {
        return isOwner() && getCurrentUserId().equals(ownerId);
    }

    /**
     * Helper to validate that the logged-in user is either the target user or an admin.
     */
    public void validateCurrentUser(Long userId) {
        if (!canAccessUser(userId)) {
            throw new ResourceOwnershipException("You are not authorized to access this user's data");
        }
    }

    /**
     * Helper to validate that the logged-in user is the owner (or ADMIN).
     */
    public void validateOwner(Long ownerId) {
        if (isAdmin()) {
            return;
        }
        if (!isCurrentOwner(ownerId)) {
            throw new ResourceOwnershipException("You do not own this resource");
        }
    }

    /**
     * Helper to validate that the logged-in user is an admin.
     */
    public void validateAdmin() {
        if (!isAdmin()) {
            throw new ResourceOwnershipException("Admin privilege is required");
        }
    }
}
