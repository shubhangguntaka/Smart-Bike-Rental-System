package com.sssit.bikerental.modules.analytics.controller;

import com.sssit.bikerental.modules.analytics.dto.DashboardAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.dto.RevenueAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.dto.RideAnalyticsDTO;
import com.sssit.bikerental.modules.analytics.service.AnalyticsService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAnalyticsDTO> getDashboardAnalytics() {
        return ResponseEntity.ok(
                analyticsService.getDashboardAnalytics()
        );
    }

    @GetMapping("/revenue")
    public ResponseEntity<RevenueAnalyticsDTO> getRevenueAnalytics(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        return ResponseEntity.ok(
                analyticsService.getRevenueAnalytics(from, to)
        );
    }

    @GetMapping("/bookings")
    public ResponseEntity<Map<String, Long>> getBookingAnalytics(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        return ResponseEntity.ok(
                analyticsService.getBookingAnalytics(from, to)
        );
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Long>> getUserAnalytics(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        return ResponseEntity.ok(
                analyticsService.getUserAnalytics(from, to)
        );
    }

    @GetMapping("/bikes")
    public ResponseEntity<Map<String, Long>> getBikeAnalytics(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        return ResponseEntity.ok(
                analyticsService.getBikeAnalytics(from, to)
        );
    }

    @GetMapping("/rides")
    public ResponseEntity<RideAnalyticsDTO> getRideAnalytics(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        return ResponseEntity.ok(
                analyticsService.getRideAnalytics(from, to)
        );
    }
}