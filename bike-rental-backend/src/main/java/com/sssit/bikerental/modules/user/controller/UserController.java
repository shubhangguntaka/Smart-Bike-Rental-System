package com.sssit.bikerental.modules.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sssit.bikerental.modules.user.dto.ChangePasswordRequest;
import com.sssit.bikerental.modules.user.dto.UpdateProfileRequest;
import com.sssit.bikerental.modules.user.dto.UserProfileResponse;
import com.sssit.bikerental.modules.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {

        return ResponseEntity.ok(userService.getCurrentUser());

    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(

            @Valid @RequestBody UpdateProfileRequest request

    ) {

        return ResponseEntity.ok(userService.updateProfile(request));

    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(

            @Valid @RequestBody ChangePasswordRequest request

    ) {

        userService.changePassword(request);

        return ResponseEntity.noContent().build();

    }

}
