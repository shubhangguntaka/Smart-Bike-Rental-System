package com.sssit.bikerental.modules.gps.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sssit.bikerental.modules.gps.entity.GPSLocation;

public interface GPSRepository extends JpaRepository<GPSLocation, Long> {

    List<GPSLocation> findByRideIdOrderByTimestampAsc(Long rideId);

    Optional<GPSLocation> findTopByRideIdOrderByTimestampDesc(Long rideId);
}