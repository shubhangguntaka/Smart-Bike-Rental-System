package com.sssit.bikerental.modules.gps.serviceimpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sssit.bikerental.modules.gps.dto.RideDTO;
import com.sssit.bikerental.modules.gps.entity.GPSLocation;
import com.sssit.bikerental.modules.gps.entity.Ride;
import com.sssit.bikerental.modules.gps.entity.RideHistory;
import com.sssit.bikerental.modules.gps.entity.RideStatus;
import com.sssit.bikerental.modules.gps.repository.GPSRepository;
import com.sssit.bikerental.modules.gps.repository.RideHistoryRepository;
import com.sssit.bikerental.modules.gps.repository.RideRepository;
import com.sssit.bikerental.modules.gps.service.RideService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RideServiceImpl implements RideService {

    private final RideRepository rideRepository;
    private final GPSRepository gpsRepository;
    private final RideHistoryRepository rideHistoryRepository;

    @Override
    public RideDTO startRide(
            Long bookingId,
            Long bikeId,
            Long customerId) {

        Ride ride = new Ride();

        ride.setBookingId(bookingId);
        ride.setBikeId(bikeId);
        ride.setCustomerId(customerId);

        ride.setStatus(RideStatus.ACTIVE);

        ride.setStartedAt(java.time.LocalDateTime.now());

        ride.setTotalDistance(0.0);
        ride.setTotalDuration(0L);

        Ride savedRide = rideRepository.save(ride);

        return convertToRideDTO(savedRide);
    }

    @Override
    public RideDTO getRide(Long rideId) {

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(()
                        -> new RuntimeException("Ride not found with id: " + rideId)
                );

        return convertToRideDTO(ride);
    }

    @Override
    public RideDTO endRide(Long rideId) {

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(()
                        -> new RuntimeException(
                        "Ride not found with id: " + rideId
                )
                );

        if (ride.getStatus() != RideStatus.ACTIVE) {
            throw new RuntimeException(
                    "Ride is not active: " + rideId
            );
        }

        GPSLocation lastLocation
                = gpsRepository.findTopByRideIdOrderByTimestampDesc(rideId)
                        .orElse(null);

        LocalDateTime endedAt = LocalDateTime.now();

        ride.setEndedAt(endedAt);
        ride.setStatus(RideStatus.COMPLETED);

        if (lastLocation != null) {
            ride.setEndLatitude(lastLocation.getLatitude());
            ride.setEndLongitude(lastLocation.getLongitude());
        }

        double totalDistance = calculateRideDistance(rideId);

        ride.setTotalDistance(totalDistance);

        if (ride.getStartedAt() != null) {
            long duration
                    = java.time.Duration.between(
                            ride.getStartedAt(),
                            endedAt
                    ).getSeconds();

            ride.setTotalDuration(duration);
        }

        Ride completedRide = rideRepository.save(ride);

        saveRideHistory(completedRide);

        return convertToRideDTO(completedRide);
    }

    private double calculateRideDistance(Long rideId) {

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
            +
            Math.cos(Math.toRadians(latitude1))
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

private void saveRideHistory(Ride ride) {

    RideHistory history = new RideHistory();

    history.setRideId(ride.getId());
    history.setBookingId(ride.getBookingId());
    history.setBikeId(ride.getBikeId());
    history.setCustomerId(ride.getCustomerId());

    history.setStartedAt(ride.getStartedAt());
    history.setEndedAt(ride.getEndedAt());

    history.setStartLatitude(ride.getStartLatitude());
    history.setStartLongitude(ride.getStartLongitude());

    history.setEndLatitude(ride.getEndLatitude());
    history.setEndLongitude(ride.getEndLongitude());

    history.setTotalDistance(ride.getTotalDistance());
    history.setTotalDuration(ride.getTotalDuration());

    history.setCompletedAt(ride.getEndedAt());

    rideHistoryRepository.save(history);
}

   @Override
public List<RideDTO> getCustomerRides(Long customerId) {

    List<Ride> rides =
            rideRepository.findByCustomerIdOrderByStartedAtDesc(customerId);

    return rides.stream()
            .map(this::convertToRideDTO)
            .toList();
}


    @Override
public RideDTO getRideHistory(Long rideId) {

    RideHistory history =
            rideHistoryRepository.findByRideId(rideId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Ride history not found for ride: " + rideId
                            )
                    );

    return new RideDTO(
            history.getRideId(),
            history.getBookingId(),
            history.getBikeId(),
            history.getCustomerId(),
            RideStatus.COMPLETED,
            history.getStartedAt(),
            history.getEndedAt(),
            history.getStartLatitude(),
            history.getStartLongitude(),
            history.getEndLatitude(),
            history.getEndLongitude(),
            history.getTotalDistance(),
            history.getTotalDuration()
    );
}

    private RideDTO convertToRideDTO(Ride ride) {

        return new RideDTO(
                ride.getId(),
                ride.getBookingId(),
                ride.getBikeId(),
                ride.getCustomerId(),
                ride.getStatus(),
                ride.getStartedAt(),
                ride.getEndedAt(),
                ride.getStartLatitude(),
                ride.getStartLongitude(),
                ride.getEndLatitude(),
                ride.getEndLongitude(),
                ride.getTotalDistance(),
                ride.getTotalDuration()
        );
    }
}
