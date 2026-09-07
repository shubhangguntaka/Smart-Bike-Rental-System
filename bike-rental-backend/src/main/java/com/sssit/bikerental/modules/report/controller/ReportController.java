package com.sssit.bikerental.modules.report.controller;

import com.sssit.bikerental.modules.report.service.ReportService;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> getBookingReport(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        validateDateRange(from, to);

        return ResponseEntity.ok(
                reportService.getBookingReport(from, to)
        );
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenueReport(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        validateDateRange(from, to);

        return ResponseEntity.ok(
                reportService.getRevenueReport(from, to)
        );
    }

    @GetMapping("/bikes")
    public ResponseEntity<List<Map<String, Object>>> getBikeReport(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        validateDateRange(from, to);

        return ResponseEntity.ok(
                reportService.getBikeReport(from, to)
        );
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Map<String, Object>>> getPaymentReport(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        validateDateRange(from, to);

        return ResponseEntity.ok(
                reportService.getPaymentReport(from, to)
        );
    }

    private void validateDateRange(
            LocalDate from,
            LocalDate to) {

        if (from == null || to == null) {
            throw new IllegalArgumentException(
                    "Both from and to dates are required"
            );
        }

        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "From date cannot be after to date"
            );
        }
    }
}