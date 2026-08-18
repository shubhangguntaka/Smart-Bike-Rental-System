package com.sssit.bikerental.modules.gps.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class GPSConfig {

    /**
     * Minimum interval between GPS location updates.
     * Value is in milliseconds.
     */
    public static final long LOCATION_UPDATE_INTERVAL = 5000L;

    /**
     * Minimum distance between two GPS points.
     * Value is in meters.
     */
    public static final double MINIMUM_DISTANCE_UPDATE = 5.0;

}