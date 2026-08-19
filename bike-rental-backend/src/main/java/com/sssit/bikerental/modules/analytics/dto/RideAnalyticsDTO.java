package com.sssit.bikerental.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideAnalyticsDTO {

    private long totalRides;

    private long activeRides;

    private long completedRides;

    /**
     * Total distance across rides.
     * Unit: kilometers.
     */
    private double totalDistance;

    /**
     * Average distance per ride.
     * Unit: kilometers.
     */
    private double averageDistance;

    /**
     * Total ride duration.
     * Unit: seconds.
     */
    private long totalDuration;

    /**
     * Average ride duration.
     * Unit: seconds.
     */
    private long averageDuration;

    /**
     * Key:
     * Date in ISO format, for example 2026-08-19
     *
     * Value:
     * Number of rides on that date.
     */
    private Map<String, Long> ridesByDate;
}