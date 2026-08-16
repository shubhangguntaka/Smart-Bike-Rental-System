import { useCallback, useEffect } from "react";
import { useLocationContext } from "@/context/LocationContext";
import { mapService } from "@/services/mapService";
import bikeService from "@/services/bikeService";
import { normalizeBike } from "@/utils/bikeUtils";
import { subscribeBikeUpdates } from "@/utils/syncUtils";
import toast from "react-hot-toast";

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
        if (!currentLocation || typeof currentLocation.latitude !== "number" || typeof currentLocation.longitude !== "number") return;
        try {
            const response = await mapService.getRoute(
                currentLocation.latitude,
                currentLocation.longitude,
                bikeId
            );
            const routeData = response?.data?.data || response?.data;
            setRoute(routeData);
        } catch (error) {
            console.error("Failed to fetch route:", error);
            toast.error("Failed to calculate route.");
        }
    };

    /**
     * Get browser location
     */
    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            console.warn("Geolocation API is not supported by browser.");
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
                console.warn("Geolocation permission denied or failed:", error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
    }, [setCurrentLocation]);

    /**
     * Fetch nearby bikes from DB
     */
    const getNearbyBikes = useCallback(
        async (overrideLocation?: { latitude: number; longitude: number }) => {
            const targetLoc = overrideLocation || currentLocation;
            if (!targetLoc || typeof targetLoc.latitude !== "number" || typeof targetLoc.longitude !== "number") {
                setNearbyBikes([]);
                return;
            }

            try {
                setLoading(true);

                const response = await mapService.getNearbyBikes(targetLoc.latitude, targetLoc.longitude);

                let serverMapBikes: any[] = [];
                const rawMapData = response?.data;
                if (Array.isArray(rawMapData)) {
                    serverMapBikes = rawMapData;
                } else if (rawMapData && Array.isArray(rawMapData.data)) {
                    serverMapBikes = rawMapData.data;
                }

                const normalized = serverMapBikes.map((bikeItem: any, idx: number) => normalizeBike(bikeItem, idx));
                setNearbyBikes(normalized);
            } catch (error) {
                console.error("Failed to fetch nearby bikes:", error);
                setNearbyBikes([]);
            } finally {
                setLoading(false);
            }
        },
        [currentLocation, setNearbyBikes, setLoading]
    );

    useEffect(() => {
        // Initial fetch on location ready
        if (currentLocation) {
            getNearbyBikes(currentLocation);
        } else {
            getNearbyBikes();
        }

        const handleSync = () => {
            getNearbyBikes();
        };

        const unsub = subscribeBikeUpdates(handleSync);
        return () => {
            unsub();
        };
    }, [currentLocation, getNearbyBikes]);

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