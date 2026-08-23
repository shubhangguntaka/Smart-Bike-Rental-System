package com.sssit.bikerental.modules.report.controller;

import com.sssit.bikerental.modules.report.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    private LocalDate from;
    private LocalDate to;

    @BeforeEach
    void setUp() {
        from = LocalDate.of(2026, 8, 1);
        to = LocalDate.of(2026, 8, 20);
    }

    @Test
    @DisplayName("GET /api/reports/bookings: Returns 200 OK with booking rows")
    void testGetBookingReport() {
        List<Map<String, Object>> mockList = Collections.singletonList(Collections.singletonMap("bookingId", 101L));
        when(reportService.getBookingReport(eq(from), eq(to))).thenReturn(mockList);

        ResponseEntity<List<Map<String, Object>>> response = reportController.getBookingReport(from, to);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockList, response.getBody());
    }

    @Test
    @DisplayName("GET /api/reports/revenue: Returns 200 OK with revenue rows")
    void testGetRevenueReport() {
        List<Map<String, Object>> mockList = Collections.singletonList(Collections.singletonMap("paymentId", 201L));
        when(reportService.getRevenueReport(eq(from), eq(to))).thenReturn(mockList);

        ResponseEntity<List<Map<String, Object>>> response = reportController.getRevenueReport(from, to);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockList, response.getBody());
    }

    @Test
    @DisplayName("GET /api/reports/bikes: Returns 200 OK with bike rows")
    void testGetBikeReport() {
        List<Map<String, Object>> mockList = Collections.singletonList(Collections.singletonMap("bikeId", 1L));
        when(reportService.getBikeReport(eq(from), eq(to))).thenReturn(mockList);

        ResponseEntity<List<Map<String, Object>>> response = reportController.getBikeReport(from, to);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockList, response.getBody());
    }

    @Test
    @DisplayName("GET /api/reports/payments: Returns 200 OK with payment rows")
    void testGetPaymentReport() {
        List<Map<String, Object>> mockList = Collections.singletonList(Collections.singletonMap("paymentId", 301L));
        when(reportService.getPaymentReport(eq(from), eq(to))).thenReturn(mockList);

        ResponseEntity<List<Map<String, Object>>> response = reportController.getPaymentReport(from, to);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockList, response.getBody());
    }

    @Test
    @DisplayName("Date Validation: Rejects invalid date ranges in ReportController")
    void testDateRangeValidation() {
        LocalDate invalidFrom = LocalDate.of(2026, 8, 25);
        LocalDate invalidTo = LocalDate.of(2026, 8, 20);

        assertThrows(IllegalArgumentException.class, () -> reportController.getBookingReport(invalidFrom, invalidTo));
        assertThrows(IllegalArgumentException.class, () -> reportController.getRevenueReport(null, invalidTo));
        assertThrows(IllegalArgumentException.class, () -> reportController.getBikeReport(invalidFrom, null));
        assertThrows(IllegalArgumentException.class, () -> reportController.getPaymentReport(invalidFrom, invalidTo));
    }
}
