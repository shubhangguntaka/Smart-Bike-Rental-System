package com.sssit.bikerental.modules.booking.validation;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.sssit.bikerental.modules.booking.dto.BookingRequest;
import com.sssit.bikerental.modules.booking.exception.InvalidBookingException;

@Component
public class BookingValidator {

    public void validateBookingRequest(BookingRequest request) {

        if (request == null) {
            throw new InvalidBookingException("Booking request cannot be null.");
        }

        if (request.getBikeId() == null) {
            throw new InvalidBookingException("Bike Id is required.");
        }

        if (request.getStartTime() == null) {
            throw new InvalidBookingException("Start time is required.");
        }

        if (request.getReturnTime() == null) {
            throw new InvalidBookingException("Return time is required.");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new InvalidBookingException("Start time cannot be in the past.");
        }

        if (request.getReturnTime().isBefore(request.getStartTime())) {
            throw new InvalidBookingException("Return time must be after start time.");
        }

        if (request.getStartTime().isEqual(request.getReturnTime())) {
            throw new InvalidBookingException("Start time and return time cannot be equal.");
        }
    }

}