package com.sssit.bikerental.modules.admin.controller;

import com.sssit.bikerental.modules.admin.dto.AdminDashboardDTO;
import com.sssit.bikerental.modules.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    /**
     * Section 3 - M3 Admin Operations
     *
     * Day 1:
     * Establishes the Admin dashboard API contract.
     *
     * Other Admin endpoints are intentionally not mapped here yet
     * because the current project already contains legacy/admin
     * controllers for some of those endpoints.
     *
     * They will be integrated carefully during Days 2 and 3
     * without duplicating existing request mappings.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }
}