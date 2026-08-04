package com.sssit.bikerental.common.security;

import org.springframework.stereotype.Service;

import com.sssit.bikerental.common.exception.ResourceOwnershipException;
import com.sssit.bikerental.modules.user.service.CurrentUserService;

/**
 * Service to validate permissions and verify resource ownership.
 * Future modules can inject this service to validate access.
 */
@Service("authService")
public class AuthorizationService {

    private final CurrentUserService currentUserService;

    public AuthorizationService(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    /**
     * Check if the given userId belongs to the currently logged in user.
     */
    public boolean isCurrentUser(Long userId) {
        return currentUserService.getCurrentUserId().equals(userId);
    }

    /**
     * Check if user is an ADMIN.
     */
    public boolean isAdmin() {
        return currentUserService.isAdmin();
    }

    /**
     * Check if user is an OWNER.
     */
    public boolean isOwner() {
        return currentUserService.isOwner();
    }

    /**
     * Check if user is a CUSTOMER.
     */
    public boolean isCustomer() {
        return currentUserService.isCustomer();
    }

    /**
     * Validate that the logged in user is the owner of the user account or an Admin.
     */
    public void validateCurrentUser(Long userId) {
        if (!isAdmin() && !isCurrentUser(userId)) {
            throw new ResourceOwnershipException("Access Denied: You can only access your own data");
        }
    }

    /**
     * Validate that the logged in user has ADMIN role.
     */
    public void validateAdmin() {
        if (!isAdmin()) {
            throw new ResourceOwnershipException("Access Denied: Admin access required");
        }
    }

    /**
     * Validate that the logged in user is the owner of the resource or an Admin.
     */
    public void validateOwner(Long ownerId) {
        if (!isAdmin() && (!isOwner() || !currentUserService.getCurrentUserId().equals(ownerId))) {
            throw new ResourceOwnershipException("Access Denied: You do not own this resource");
        }
    }
}
