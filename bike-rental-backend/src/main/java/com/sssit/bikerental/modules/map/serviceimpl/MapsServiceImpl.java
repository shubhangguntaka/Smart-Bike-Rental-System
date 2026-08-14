package com.sssit.bikerental.modules.map.serviceimpl;

import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.map.dto.BikeLocationDTO;
import com.sssit.bikerental.modules.map.dto.DistanceResponseDTO;
import com.sssit.bikerental.modules.map.dto.NearbyBikeDTO;
import com.sssit.bikerental.modules.map.dto.RouteResponseDTO;
import com.sssit.bikerental.modules.map.service.MapsService;
import com.sssit.bikerental.modules.map.utils.DistanceCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class MapsServiceImpl implements MapsService {

    private final BikeRepository bikeRepository;
    
    private final RestTemplate restTemplate;



    private boolean isNotExpiredFromPast(java.time.LocalDate availableDate) {
        if (availableDate == null) {
            return true;
        }
        java.time.LocalDate today = java.time.LocalDate.now();
        return !availableDate.isBefore(today);
    }

    @Override
    public List<NearbyBikeDTO> getNearbyBikes(
            double latitude,
            double longitude) {

        // Include all bikes from repository so owner-added listings are visible
        // to customers in the nearby bikes feed. We still filter out bikes
        // whose availableDate is in the past below.
        List<Bike> bikes = bikeRepository.findAll().stream()
                .filter(bike -> isNotExpiredFromPast(bike.getAvailableDate()))
                .collect(Collectors.toList());

        return bikes.stream()
                .map(bike -> {

                    double distance =
                            DistanceCalculator.calculateDistance(
                                    latitude,
                                    longitude,
                                    bike.getLatitude() != null ? bike.getLatitude() : 0.0,
                                    bike.getLongitude() != null ? bike.getLongitude() : 0.0
                            );

                    boolean isAvailable = bike.getBikeStatus() == BikeStatus.AVAILABLE && isWithinOperatingWindow(
                            bike.getAvailableStartTime(), bike.getAvailableEndTime(), bike.getAvailableDate());

                    return NearbyBikeDTO.builder()
                            .bikeId(bike.getBikeId())
                            .bikeName(bike.getBikeName())
                            .brand(bike.getBrand())
                            .model(bike.getModel())
                            .registrationNumber(bike.getRegistrationNumber() != null ? bike.getRegistrationNumber() : bike.getRcNumber())
                            .fuelType(bike.getFuelType())
                            .location(bike.getLocation())
                            .description(bike.getDescription())
                            .engineCapacity(bike.getEngineCapacity())
                            .mileage(bike.getMileage())
                            .transmission(bike.getTransmission())
                            .seatingCapacity(bike.getSeatingCapacity())
                            .hourlyRate(bike.getHourlyRate() != null ? bike.getHourlyRate().doubleValue() : (bike.getRentalPrice() != null ? bike.getRentalPrice().doubleValue() / 8.0 : 0.0))
                            .rentalPrice(bike.getRentalPrice() != null ? bike.getRentalPrice().doubleValue() : 0.0)
                            .latitude(bike.getLatitude())
                            .longitude(bike.getLongitude())
                            .distance(distance)
                            .imageUrl(bike.getImageUrl())
                            .available(isAvailable)
                            .availableStartTime(bike.getAvailableStartTime() != null ? bike.getAvailableStartTime().toString() : "09:00")
                            .availableEndTime(bike.getAvailableEndTime() != null ? bike.getAvailableEndTime().toString() : "21:00")
                            .availableDate(bike.getAvailableDate() != null ? bike.getAvailableDate().toString() : java.time.LocalDate.now().toString())
                            .ownerName("Shiva Sai Kalyan Kalyan")
                            .build();

                })
                .sorted(Comparator.comparingDouble(b -> b.getDistance() != null ? b.getDistance() : Double.MAX_VALUE))
                .collect(Collectors.toList());
    }

        private boolean isWithinOperatingWindow(java.time.LocalTime start, java.time.LocalTime end, java.time.LocalDate date) {
                try {
                        java.time.LocalDate today = java.time.LocalDate.now();
                        if (date != null && date.isBefore(today)) {
                                return false;
                        }
                        // If date is specified and it's after today, treat as not active yet
                        if (date != null && date.isAfter(today)) {
                                return false;
                        }

                        if (start == null || end == null) {
                                return true;
                        }

                        java.time.LocalTime now = java.time.LocalTime.now();

                        if (!start.isAfter(end)) {
                                // simple same-day window
                                return !now.isBefore(start) && !now.isAfter(end);
                        } else {
                                // overnight window (e.g., 21:00 -> 05:00)
                                return !now.isBefore(start) || !now.isAfter(end);
                        }
                } catch (Exception e) {
                        return true;
                }
        }

    @Override
    public BikeLocationDTO getBikeLocation(Long bikeId) {

        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() ->
                        new RuntimeException("Bike not found"));

        return BikeLocationDTO.builder()
                .bikeId(bike.getBikeId())
                .latitude(bike.getLatitude())
                .longitude(bike.getLongitude())
                .build();
    }

    @Override
    public DistanceResponseDTO calculateDistance(
            double customerLatitude,
            double customerLongitude,
            Long bikeId) {

        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() ->
                        new RuntimeException("Bike not found"));

        double distance =
                DistanceCalculator.calculateDistance(
                        customerLatitude,
                        customerLongitude,
                        bike.getLatitude(),
                        bike.getLongitude()
                );

        return DistanceResponseDTO.builder()
                .distanceInKm(distance)
                .estimatedTime(
                        DistanceCalculator.estimateTravelTime(distance)
                )
                .build();
    }

    @Override
    public RouteResponseDTO getRoute(
            double customerLatitude,
            double customerLongitude,
            Long bikeId) {

        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> new RuntimeException("Bike not found"));

        try {

            String url =
                    "https://router.project-osrm.org/route/v1/driving/"
                            + customerLongitude + ","
                            + customerLatitude + ";"
                            + bike.getLongitude() + ","
                            + bike.getLatitude()
                            + "?overview=full&geometries=geojson";

            String response = restTemplate.getForObject(url, String.class);

            ObjectMapper mapper = new ObjectMapper();

            JsonNode root = mapper.readTree(response);

            JsonNode route = root.path("routes").get(0);

            double distance =
                    route.path("distance").asDouble() / 1000;

            double duration =
                    route.path("duration").asDouble() / 60;

            List<List<Double>> coordinates = new java.util.ArrayList<>();

            JsonNode geometry =
                    route.path("geometry").path("coordinates");

            for (JsonNode point : geometry) {

                List<Double> coordinate =
                        new java.util.ArrayList<>();

                coordinate.add(point.get(1).asDouble());
                coordinate.add(point.get(0).asDouble());

                coordinates.add(coordinate);

            }

            return RouteResponseDTO.builder()
                    .startLatitude(customerLatitude)
                    .startLongitude(customerLongitude)
                    .endLatitude(bike.getLatitude())
                    .endLongitude(bike.getLongitude())
                    .distance(distance)
                    .duration(Math.round(duration) + " mins")
                    .coordinates(coordinates)
                    .build();

        }

        catch (Exception e) {

            throw new RuntimeException("Unable to fetch route", e);

        }

    }
}