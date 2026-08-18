package com.sssit.bikerental.modules.gps.serviceimpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sssit.bikerental.modules.gps.dto.GPSLocationDTO;
import com.sssit.bikerental.modules.gps.entity.GPSLocation;
import com.sssit.bikerental.modules.gps.repository.GPSRepository;
import com.sssit.bikerental.modules.gps.service.GPSService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GPSServiceImpl implements GPSService {

    private final GPSRepository gpsRepository;

    @Override
    public GPSLocationDTO saveLocation(
            Long rideId,
            GPSLocationDTO locationDTO) {

        GPSLocation location = new GPSLocation();

        location.setRideId(rideId);
        location.setLatitude(locationDTO.getLatitude());
        location.setLongitude(locationDTO.getLongitude());
        location.setTimestamp(locationDTO.getTimestamp());
        location.setAccuracy(locationDTO.getAccuracy());

        GPSLocation savedLocation = gpsRepository.save(location);

        return new GPSLocationDTO(
                savedLocation.getRideId(),
                savedLocation.getLatitude(),
                savedLocation.getLongitude(),
                savedLocation.getTimestamp(),
                savedLocation.getAccuracy()
        );
    }

    @Override
    public List<GPSLocationDTO> getLocations(Long rideId) {

        List<GPSLocation> locations
                = gpsRepository.findByRideIdOrderByTimestampAsc(rideId);

        return locations.stream()
                .map(location -> new GPSLocationDTO(
                location.getRideId(),
                location.getLatitude(),
                location.getLongitude(),
                location.getTimestamp(),
                location.getAccuracy()
        ))
                .toList();
    }

    @Override
    public double calculateDistance(Long rideId) {

        List<GPSLocation> locations
                = gpsRepository.findByRideIdOrderByTimestampAsc(rideId);

        if (locations.size() < 2) {
            return 0.0;
        }

        double totalDistance = 0.0;

        for (int i = 1; i < locations.size(); i++) {

            GPSLocation previous = locations.get(i - 1);
            GPSLocation current = locations.get(i);

            totalDistance += calculateHaversineDistance(
                    previous.getLatitude(),
                    previous.getLongitude(),
                    current.getLatitude(),
                    current.getLongitude()
            );
        }

        return totalDistance;
    }

    private double calculateHaversineDistance(
            double latitude1,
            double longitude1,
            double latitude2,
            double longitude2) {

        final double EARTH_RADIUS_KM = 6371.0;

        double latitudeDifference
                = Math.toRadians(latitude2 - latitude1);

        double longitudeDifference
                = Math.toRadians(longitude2 - longitude1);

        double a
                = Math.sin(latitudeDifference / 2)
                * Math.sin(latitudeDifference / 2)
                + Math.cos(Math.toRadians(latitude1))
                * Math.cos(Math.toRadians(latitude2))
                * Math.sin(longitudeDifference / 2)
                * Math.sin(longitudeDifference / 2);

        double c
                = 2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return EARTH_RADIUS_KM * c;
    }

}
