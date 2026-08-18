package com.sssit.bikerental.modules.admin.controller;

import com.sssit.bikerental.modules.admin.dto.AdminDashboardDTO;
import com.sssit.bikerental.modules.admin.dto.OwnerAdminDTO;
import com.sssit.bikerental.modules.admin.dto.UserAdminDTO;
import com.sssit.bikerental.modules.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/dashboard
     *
     * Dashboard aggregation will be completed during Day 4.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {

        return ResponseEntity.ok(
                adminService.getDashboard()
        );
    }

    /**
     * GET /api/admin/users
     *
     * Section 3 M3 user administration endpoint.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserAdminDTO>> getUsers() {

        return ResponseEntity.ok(
                adminService.getUsers()
        );
    }

    /**
     * PUT /api/admin/users/{id}/status
     *
     * Enables or disables an existing user account.
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserAdminDTO> updateUserStatus(
            @PathVariable("id") Long userId,
            @RequestParam("enabled") Boolean enabled) {

        return ResponseEntity.ok(
                adminService.updateUserStatus(
                        userId,
                        enabled
                )
        );
    }

    /**
     * GET /api/admin/owners
     *
     * Returns existing owner records through OwnerService.
     */
    @GetMapping("/owners")
    public ResponseEntity<List<OwnerAdminDTO>> getOwners() {

        return ResponseEntity.ok(
                adminService.getOwners()
        );
    }
}