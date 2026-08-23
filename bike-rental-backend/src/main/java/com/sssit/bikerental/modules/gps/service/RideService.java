package com.sssit.bikerental.modules.gps.service;

import java.util.List;

import com.sssit.bikerental.modules.gps.dto.RideDTO;

public interface RideService {

    RideDTO startRide(Long bookingId, Long bikeId, Long customerId);

    RideDTO getRide(Long rideId);

    RideDTO getRideByBookingId(Long bookingId);

    RideDTO endRide(Long rideId);

    RideDTO pauseRide(Long rideId);

    RideDTO resumeRide(Long rideId);

    List<RideDTO> getCustomerRides(Long customerId);

    RideDTO getRideHistory(Long rideId);
}