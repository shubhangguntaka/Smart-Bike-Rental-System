import { useCallback } from "react";

import { useLocationContext } from "@/context/LocationContext";
import { mapService } from "@/services/mapService";

const API = import.meta.env.VITE_API_BASE_URL;

export function useLocation() {

    const {
    currentLocation,
    setCurrentLocation,

    nearbyBikes,
    setNearbyBikes,

    route,
    setRoute,

    loading,
    setLoading,

    selectedBikeId,
    setSelectedBikeId,
} = useLocationContext();


const getRoute = async (bikeId: number) => {

    if (!currentLocation) return;

    try {

        const response = await mapService.getRoute(
            currentLocation.latitude,
            currentLocation.longitude,
            bikeId
        );

        setRoute(response.data);

    } catch (error) {

        console.error("Failed to fetch route:", error);

    }

};


    /**
     * Get browser location
     */
    const getCurrentLocation = useCallback(() => {
        const fallbackLocation = {
            latitude: 17.3850,
            longitude: 78.4867,
        };

        if (!navigator.geolocation) {
            setCurrentLocation(fallbackLocation);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.warn("Geolocation error or denied, using default location:", error);
                setCurrentLocation(fallbackLocation);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
            }
        );
    }, [setCurrentLocation]);

    /**
     * Fetch nearby bikes
     */
    const getNearbyBikes = useCallback(async () => {
        const loc = currentLocation || { latitude: 17.3850, longitude: 78.4867 };

        try {
            setLoading(true);

            const response = await mapService.getNearbyBikes(
                loc.latitude,
                loc.longitude
            );

            const bikes = Array.isArray(response.data)
                ? response.data
                : [];
            setNearbyBikes(bikes);
        }
        catch (error) {
            console.error("Failed to fetch nearby bikes:", error);
            setNearbyBikes([]);
        }
        finally {
            setLoading(false);
        }
    }, [
        currentLocation,
        setNearbyBikes,
        setLoading,
    ]);

    /**
     * Refresh current location
     */
    const refreshLocation = () => {

        getCurrentLocation();

    };

   return {
    currentLocation,
    nearbyBikes,
    route,
    loading,

     selectedBikeId,
    setSelectedBikeId,

    getCurrentLocation,
    getNearbyBikes,
    getRoute,
    refreshLocation,

     setRoute,
};

}