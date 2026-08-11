package com.sssit.bikerental.modules.map.utils;

public class DistanceCalculator {

    // Radius of Earth in kilometers
    private static final double EARTH_RADIUS = 6371.0;

    /**
     * Calculates the distance between two coordinates using the Haversine Formula.
     *
     * @param lat1 Customer latitude
     * @param lon1 Customer longitude
     * @param lat2 Bike latitude
     * @param lon2 Bike longitude
     * @return Distance in kilometers
     */
    public static double calculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2
    ) {

        double latitudeDistance = Math.toRadians(lat2 - lat1);
        double longitudeDistance = Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(latitudeDistance / 2) * Math.sin(latitudeDistance / 2)
                        + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))
                        * Math.sin(longitudeDistance / 2)
                        * Math.sin(longitudeDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    /**
     * Estimates travel time based on an average city speed.
     *
     * @param distance Distance in KM
     * @return Estimated travel time
     */
    public static String estimateTravelTime(double distance) {

        double averageSpeed = 30.0; // km/h

        double totalHours = distance / averageSpeed;

        int hours = (int) totalHours;

        int minutes = (int) ((totalHours - hours) * 60);

        if (hours == 0) {
            return minutes + " mins";
        }

        return hours + " hr " + minutes + " mins";
    }

    private DistanceCalculator() {
        // Prevent instantiation
    }
}