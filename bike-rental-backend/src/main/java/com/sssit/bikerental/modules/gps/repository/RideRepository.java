package com.sssit.bikerental.modules.gps.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sssit.bikerental.modules.gps.entity.Ride;
import com.sssit.bikerental.modules.gps.entity.RideStatus;

public interface RideRepository extends JpaRepository<Ride, Long> {

    Optional<Ride> findByIdAndCustomerId(Long rideId, Long customerId);

    List<Ride> findByCustomerIdOrderByStartedAtDesc(Long customerId);

    Optional<Ride> findByBookingId(Long bookingId);

    boolean existsByBookingIdAndStatus(Long bookingId, RideStatus status);
}