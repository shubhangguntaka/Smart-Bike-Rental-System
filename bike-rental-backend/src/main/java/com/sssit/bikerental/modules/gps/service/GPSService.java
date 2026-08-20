package com.sssit.bikerental.modules.gps.service;

import java.util.List;

import com.sssit.bikerental.modules.gps.dto.GPSLocationDTO;


public interface GPSService {

    GPSLocationDTO saveLocation(Long rideId, GPSLocationDTO locationDTO);

    List<GPSLocationDTO> getLocations(Long rideId);

    double calculateDistance(Long rideId);
}