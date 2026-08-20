package com.sssit.bikerental.common.security;

import org.springframework.stereotype.Service;

import com.sssit.bikerental.common.exception.ResourceOwnershipException;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.gps.entity.Ride;
import com.sssit.bikerental.modules.user.service.CurrentUserService;

/**
 * Service to validate permissions and verify resource ownership.
 *
 * Centralizes authorization checks so that controllers and services
 * do not duplicate security logic.
 */
@Service("authService")
public class AuthorizationService {

    private final CurrentUserService currentUserService;
    private final BikeRepository bikeRepository;

    public AuthorizationService(
            CurrentUserService currentUserService,
            BikeRepository bikeRepository) {

        this.currentUserService = currentUserService;
        this.bikeRepository = bikeRepository;
    }

    /**
     * Get the currently authenticated user's ID.
     */
    public Long getCurrentUserId() {
        return currentUserService.getCurrentUserId();
    }

    /**
     * Check if the given userId belongs to the currently logged-in user.
     */
    public boolean isCurrentUser(Long userId) {
        return currentUserService.getCurrentUserId().equals(userId);
    }

    /**
     * Check if the current user is an ADMIN.
     */
    public boolean isAdmin() {
        return currentUserService.isAdmin();
    }

    /**
     * Check if the current user is an OWNER.
     */
    public boolean isOwner() {
        return currentUserService.isOwner();
    }

    /**
     * Check if the current user is a CUSTOMER.
     */
    public boolean isCustomer() {
        return currentUserService.isCustomer();
    }

    /**
     * Validate that the logged-in user is the specified user
     * or an ADMIN.
     */
    public void validateCurrentUser(Long userId) {
        if (!isAdmin() && !isCurrentUser(userId)) {
            throw new ResourceOwnershipException(
                    "Access Denied: You can only access your own data"
            );
        }
    }

    /**
     * Validate that the logged-in user has ADMIN role.
     */
    public void validateAdmin() {
        if (!isAdmin()) {
            throw new ResourceOwnershipException(
                    "Access Denied: Admin access required"
            );
        }
    }

    /**
     * Validate that the logged-in user is the owner of the resource
     * or an ADMIN.
     */
    public void validateOwner(Long ownerId) {
        if (!isAdmin()
                && (!isOwner()
                || !currentUserService.getCurrentUserId().equals(ownerId))) {

            throw new ResourceOwnershipException(
                    "Access Denied: You do not own this resource"
            );
        }
    }

    /**
     * Validate access to a ride.
     *
     * Allowed:
     * - ADMIN: any ride
     * - CUSTOMER: their own ride
     * - OWNER: ride belonging to their bike
     */
    public void validateRideAccess(Ride ride) {

        if (ride == null) {
            throw new ResourceOwnershipException(
                    "Access Denied: Ride information is required"
            );
        }

        Long currentUserId = getCurrentUserId();

        // ADMIN can access any ride.
        if (isAdmin()) {
            return;
        }

        // CUSTOMER can access their own ride.
        if (currentUserId.equals(ride.getCustomerId())) {
            return;
        }

        // OWNER can access rides belonging to their bike.
        Bike bike = bikeRepository.findById(ride.getBikeId())
                .orElseThrow(() ->
                        new ResourceOwnershipException(
                                "Access Denied: Bike associated with ride was not found"
                        )
                );

        if (currentUserId.equals(bike.getOwnerId())) {
            return;
        }

        throw new ResourceOwnershipException(
                "Access Denied: You are not authorized to access this ride"
        );
    }
}