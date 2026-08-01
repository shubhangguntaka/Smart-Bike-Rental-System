package com.sssit.bikerental.modules.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.user.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by phone number.
     */
    Optional<User> findByPhoneNumber(String phoneNumber);

    /**
     * Check whether email already exists.
     */
    boolean existsByEmail(String email);

    /**
     * Check whether phone number already exists.
     */
    boolean existsByPhoneNumber(String phoneNumber);

    /**
     * Find users by role.
     */
    List<User> findByRole(Role role);

    /**
     * Find verified users.
     */
    List<User> findByEnabled(Boolean enabled);

}