package com.sssit.bikerental.modules.booking.mapper;

import com.sssit.bikerental.modules.booking.dto.BookingRequest;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.enums.PaymentStatus;

import java.time.Duration;

public final class BookingMapper {

    private BookingMapper() {
        // Utility class
    }

    public static BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        int totalDays = 0;
        if (booking.getStartTime() != null && booking.getReturnTime() != null) {
            long minutes = Duration.between(booking.getStartTime(), booking.getReturnTime()).toMinutes();
            if (minutes > 0) {
                totalDays = (int) Math.ceil((double) minutes / (24 * 60));
            }
        }

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .customerId(booking.getCustomerId())
                .bikeId(booking.getBikeId())
                .bookingReference("BK-" + booking.getId())
                .startTime(booking.getStartTime())
                .returnTime(booking.getReturnTime())
                .totalDays(totalDays)
                .totalAmount(booking.getRentalAmount())
                .rentalAmount(booking.getRentalAmount())
                .bookingStatus(booking.getBookingStatus())
                .paymentStatus(booking.getPaymentStatus())
                .qrCode(booking.getQrCode())
                .bookingDate(booking.getCreatedAt())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    public static Booking toEntity(BookingRequest request) {
        if (request == null) {
            return null;
        }

        return Booking.builder()
                .bikeId(request.getBikeId())
                .startTime(request.getStartTime())
                .returnTime(request.getReturnTime())
                .bookingStatus(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
    }
}
