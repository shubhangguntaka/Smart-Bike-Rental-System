package com.sssit.bikerental.modules.booking.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
public class BookingUtil {

    /**
     * Generate Booking Reference
     */
    public String generateBookingReference() {

        return "BK-"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-"
                + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }

    /**
     * Generate QR Code Data
     */
    public String generateQRCode(Long bookingId) {

        return "BOOKING-" + bookingId + "-"
                + LocalDateTime.now().toString();
    }

}