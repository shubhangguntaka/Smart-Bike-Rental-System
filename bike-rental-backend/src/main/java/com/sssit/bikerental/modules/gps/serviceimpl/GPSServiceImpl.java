package com.sssit.bikerental.modules.gps.serviceimpl;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.sssit.bikerental.common.security.AuthorizationService;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.gps.dto.GPSLocationDTO;
import com.sssit.bikerental.modules.gps.entity.GPSLocation;
import com.sssit.bikerental.modules.gps.entity.Ride;
import com.sssit.bikerental.modules.gps.entity.RideStatus;
import com.sssit.bikerental.modules.gps.repository.GPSRepository;
import com.sssit.bikerental.modules.gps.repository.RideRepository;
import com.sssit.bikerental.modules.gps.service.GPSService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GPSServiceImpl implements GPSService {

    private final GPSRepository gpsRepository;
    private final RideRepository rideRepository;
    private final AuthorizationService authorizationService;
    private final BikeRepository bikeRepository;

    /**
     * Validate access to GPS data for a ride.
     *
     * Allowed users:
     * 1. Customer who owns the ride
     * 2. Owner of the bike used in the ride
     * 3. Admin
     */
    private void validateGPSAccess(Ride ride) {

        // Admin can access any GPS data
        if (authorizationService.isAdmin()) {
            return;
        }

        // Customer who owns the ride
        if (authorizationService.isCurrentUser(ride.getCustomerId())) {
            return;
        }

        // Find the bike associated with the ride
        Bike bike = bikeRepository.findById(ride.getBikeId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Bike not found: " + ride.getBikeId()
                        )
                );

        // Bike owner can access GPS data
        if (authorizationService.isCurrentUser(bike.getOwnerId())) {
            return;
        }

        // Any other user is denied
        throw new AccessDeniedException(
                "You are not authorized to access GPS data for this ride."
        );
    }

    @Override
    public GPSLocationDTO saveLocation(
            Long rideId,
            GPSLocationDTO locationDTO) {

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Ride not found: " + rideId
                        )
                );

        // Customer, bike owner, or admin can access GPS
        validateGPSAccess(ride);

        // GPS tracking is allowed only while ride is ACTIVE
        if (ride.getStatus() != RideStatus.ACTIVE) {
            throw new RuntimeException(
                    "GPS tracking is not active for ride: " + rideId
            );
        }

        GPSLocation location = new GPSLocation();

        location.setRideId(rideId);
        location.setLatitude(locationDTO.getLatitude());
        location.setLongitude(locationDTO.getLongitude());
        location.setTimestamp(
                locationDTO.getTimestamp() != null
                        ? locationDTO.getTimestamp()
                        : java.time.LocalDateTime.now()
        );
        location.setAccuracy(locationDTO.getAccuracy());

        GPSLocation savedLocation = gpsRepository.save(location);

        // Set the first GPS point as the ride's starting location
        List<GPSLocation> locations =
                gpsRepository.findByRideIdOrderByTimestampAsc(rideId);

        if (locations.size() == 1) {

            ride.setStartLatitude(
                    savedLocation.getLatitude()
            );

            ride.setStartLongitude(
                    savedLocation.getLongitude()
            );

            rideRepository.save(ride);
        }

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

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Ride not found: " + rideId
                        )
                );

        // Customer, bike owner, or admin can view GPS history
        validateGPSAccess(ride);

        List<GPSLocation> locations =
                gpsRepository.findByRideIdOrderByTimestampAsc(rideId);

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

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Ride not found: " + rideId
                        )
                );

        // Customer, bike owner, or admin can calculate distance
        validateGPSAccess(ride);

        List<GPSLocation> locations =
                gpsRepository.findByRideIdOrderByTimestampAsc(rideId);

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

    /**
     * Calculate distance between two GPS coordinates
     * using the Haversine formula.
     *
     * @return distance in kilometers
     */
    private double calculateHaversineDistance(
            double latitude1,
            double longitude1,
            double latitude2,
            double longitude2) {

        final double EARTH_RADIUS_KM = 6371.0;

        double latitudeDifference =
                Math.toRadians(latitude2 - latitude1);

        double longitudeDifference =
                Math.toRadians(longitude2 - longitude1);

        double a =
                Math.sin(latitudeDifference / 2)
                * Math.sin(latitudeDifference / 2)
                + Math.cos(Math.toRadians(latitude1))
                * Math.cos(Math.toRadians(latitude2))
                * Math.sin(longitudeDifference / 2)
                * Math.sin(longitudeDifference / 2);

        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return EARTH_RADIUS_KM * c;
    }
}