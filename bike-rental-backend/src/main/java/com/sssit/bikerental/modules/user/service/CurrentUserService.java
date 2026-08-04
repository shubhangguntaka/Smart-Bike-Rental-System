package com.sssit.bikerental.modules.user.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.exception.UnauthorizedOperationException;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service to retrieve information about the currently authenticated user
 * from the security context.
 */
@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get the currently logged-in user from database.
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
     * Get the ID of the current authenticated user.
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Get the Email of the current authenticated user.
     */
    public String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }

    /**
     * Get the Role of the current authenticated user.
     */
    public Role getCurrentUserRole() {
        return getCurrentUser().getRole();
    }

    /**
     * Check if user is an ADMIN.
     */
    public boolean isAdmin() {
        return getCurrentUserRole() == Role.ADMIN;
    }

    /**
     * Check if user is an OWNER.
     */
    public boolean isOwner() {
        return getCurrentUserRole() == Role.OWNER;
    }

    /**
     * Check if user is a CUSTOMER.
     */
    public boolean isCustomer() {
        return getCurrentUserRole() == Role.CUSTOMER;
    }
}
