package com.sssit.bikerental.modules.gps.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sssit.bikerental.modules.gps.entity.RideHistory;

public interface RideHistoryRepository extends JpaRepository<RideHistory, Long> {

    Optional<RideHistory> findByRideId(Long rideId);

    List<RideHistory> findByCustomerIdOrderByCompletedAtDesc(Long customerId);
}