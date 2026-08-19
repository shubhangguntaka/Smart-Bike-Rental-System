package com.sssit.bikerental.modules.report.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReportService {

    List<Map<String, Object>> getBookingReport(
            LocalDate from,
            LocalDate to
    );

    List<Map<String, Object>> getRevenueReport(
            LocalDate from,
            LocalDate to
    );

    List<Map<String, Object>> getBikeReport(
            LocalDate from,
            LocalDate to
    );

    List<Map<String, Object>> getPaymentReport(
            LocalDate from,
            LocalDate to
    );
}