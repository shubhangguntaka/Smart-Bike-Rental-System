package com.sssit.bikerental.modules.report.serviceimpl;

import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;
import com.sssit.bikerental.modules.report.service.ReportService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final BookingRepository bookingRepository;
    private final BikeRepository bikeRepository;
    private final PaymentRepository paymentRepository;

    public ReportServiceImpl(
            BookingRepository bookingRepository,
            BikeRepository bikeRepository,
            PaymentRepository paymentRepository) {

        this.bookingRepository = bookingRepository;
        this.bikeRepository = bikeRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public List<Map<String, Object>> getBookingReport(
            LocalDate from,
            LocalDate to) {

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<Map<String, Object>> report = new ArrayList<>();

        for (Booking booking : bookingRepository.findAll()) {

            if (!isBetween(booking.getCreatedAt(), start, end)) {
                continue;
            }

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("bookingId", booking.getId());
            row.put("bikeId", booking.getBikeId());
            row.put("customerId", booking.getCustomerId());
            row.put(
                    "bookingStatus",
                    booking.getBookingStatus() != null
                            ? booking.getBookingStatus().name()
                            : null
            );
            row.put(
                    "paymentStatus",
                    booking.getPaymentStatus() != null
                            ? booking.getPaymentStatus().name()
                            : null
            );
            row.put("rentalAmount", booking.getRentalAmount());
            row.put("startTime", booking.getStartTime());
            row.put("returnTime", booking.getReturnTime());
            row.put("actualPickupTime", booking.getActualPickupTime());
            row.put("actualReturnTime", booking.getActualReturnTime());
            row.put("createdAt", booking.getCreatedAt());

            report.add(row);
        }

        return report;
    }

    @Override
    public List<Map<String, Object>> getRevenueReport(
            LocalDate from,
            LocalDate to) {

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<Map<String, Object>> report = new ArrayList<>();

        for (Payment payment : paymentRepository.findAll()) {

        	if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
        	    continue;
        	}

        	if (!isBetween(
        	        payment.getPaidAt(),
        	        start,
        	        end)) {

        	    continue;
        	}

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("paymentId", payment.getPaymentId());
            row.put("bookingId", payment.getBookingId());
            row.put("amount", payment.getFinalAmount());
            row.put("paymentDate", payment.getPaidAt());
            row.put("status", payment.getPaymentStatus().name());

            report.add(row);
        }

        return report;
    }

    @Override
    public List<Map<String, Object>> getBikeReport(
            LocalDate from,
            LocalDate to) {

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<Map<String, Object>> report = new ArrayList<>();

        for (Bike bike : bikeRepository.findAll()) {

            if (!isBetween(bike.getCreatedAt(), start, end)) {
                continue;
            }

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("bikeId", bike.getBikeId());
            row.put("ownerId", bike.getOwnerId());
            row.put("bikeName", bike.getBikeName());
            row.put("brand", bike.getBrand());
            row.put("model", bike.getModel());
            row.put("registrationNumber", bike.getRegistrationNumber());
            row.put("rentalPrice", bike.getRentalPrice());
            row.put("location", bike.getLocation());

            row.put(
                    "bikeStatus",
                    bike.getBikeStatus() != null
                            ? bike.getBikeStatus().name()
                            : null
            );

            row.put("rentalType", bike.getRentalType());
            row.put("hourlyRate", bike.getHourlyRate());
            row.put("availableDate", bike.getAvailableDate());
            row.put("createdAt", bike.getCreatedAt());

            report.add(row);
        }

        return report;
    }

    @Override
    public List<Map<String, Object>> getPaymentReport(
            LocalDate from,
            LocalDate to) {

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<Map<String, Object>> report = new ArrayList<>();

        for (Payment payment : paymentRepository.findAll()) {

            if (!isBetween(payment.getPaidAt(), start, end)) {
                continue;
            }

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("paymentId", payment.getPaymentId());
            row.put("bookingId", payment.getBookingId());
            row.put("amount", payment.getFinalAmount());
            row.put("status", payment.getPaymentStatus().name());
            row.put("paymentDate", payment.getPaidAt());
            row.put("createdAt", payment.getCreatedAt());

            report.add(row);
        }

        return report;
    }

    private boolean isBetween(
            LocalDateTime value,
            LocalDateTime start,
            LocalDateTime end) {

        return value != null
                && !value.isBefore(start)
                && value.isBefore(end);
    }
}