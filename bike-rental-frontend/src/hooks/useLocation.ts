import { useCallback, useEffect } from "react";

import { useLocationContext } from "@/context/LocationContext";
import { mapService } from "@/services/mapService";
import bikeService from "@/services/bikeService";
import { normalizeBike } from "@/utils/bikeUtils";

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

            const [response, allApiBikes] = await Promise.all([
                mapService.getNearbyBikes(loc.latitude, loc.longitude).catch(() => ({ data: [] })),
                bikeService.getAllBikes().catch(() => []),
            ]);

            const serverMapBikes = Array.isArray(response?.data) ? response.data : [];
            const serverAllBikes = Array.isArray(allApiBikes) ? allApiBikes : [];

            // Read local owner bikes & custom owner bikes to ensure instant sync across all pages
            let localOwnerBikes: any[] = [];
            let customOwnerBikes: any[] = [];
            let deletedKeys: string[] = [];
            try {
              localOwnerBikes = JSON.parse(localStorage.getItem("local_owner_bikes") || "[]");
              customOwnerBikes = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
              deletedKeys = JSON.parse(localStorage.getItem("deleted_bike_keys") || "[]");
            } catch (e) {}

            const activeRegs = new Set<string>();
            serverMapBikes.forEach((b: any) => {
              if (b.registrationNumber && b.registrationNumber.trim()) activeRegs.add(b.registrationNumber.trim().toUpperCase());
            });
            serverAllBikes.forEach((b: any) => {
              if (b.registrationNumber && b.registrationNumber.trim()) activeRegs.add(b.registrationNumber.trim().toUpperCase());
            });
            [...localOwnerBikes, ...customOwnerBikes].forEach((b: any) => {
              if (b.registrationNumber && b.registrationNumber.trim()) activeRegs.add(b.registrationNumber.trim().toUpperCase());
            });

            const isDeleted = (b: any): boolean => {
              const reg = (b.registrationNumber || "").trim().toUpperCase();
              if (!reg) return false;
              if (activeRegs.has(reg)) return false;

              return deletedKeys.some((dk) => {
                const keyUpper = String(dk).trim().toUpperCase();
                return keyUpper === reg || keyUpper === `REG_${reg}`;
              });
            };

            const combinedMap = new Map<string, any>();

            // 1. Owner local & custom added/edited bikes FIRST
            [...customOwnerBikes, ...localOwnerBikes].forEach((lb, idx) => {
              if (!isDeleted(lb)) {
                const key = (lb.registrationNumber || lb.bikeId || lb.id || lb.bikeName || (lb as any).name || `LOCAL_${idx}`).toString().toUpperCase();
                combinedMap.set(key, lb);
              }
            });

            // 2. Server allBikes SECOND
            serverAllBikes.forEach((b: any, idx: number) => {
              if (!isDeleted(b)) {
                const key = (b.registrationNumber || b.bikeId || b.id || `SERVER_ALL_${idx}`).toString().toUpperCase();
                if (!combinedMap.has(key)) {
                  combinedMap.set(key, b);
                } else {
                  const existing = combinedMap.get(key);
                  combinedMap.set(key, { ...existing, ...b });
                }
              }
            });

            // 3. Server mapBikes THIRD
            serverMapBikes.forEach((b: any, idx: number) => {
              if (!isDeleted(b)) {
                const key = (b.registrationNumber || b.bikeId || b.id || `SERVER_MAP_${idx}`).toString().toUpperCase();
                if (!combinedMap.has(key)) {
                  combinedMap.set(key, b);
                } else {
                  const existing = combinedMap.get(key);
                  combinedMap.set(key, { ...existing, ...b });
                }
              }
            });

            const merged = Array.from(combinedMap.values()).map((bikeItem, idx) => {
              const nb = normalizeBike(bikeItem, idx);
              // compute distance if latitude/longitude exist
              if (loc.latitude && loc.longitude && nb.latitude && nb.longitude) {
                const d = Math.sqrt(
                  Math.pow(loc.latitude - nb.latitude, 2) + Math.pow(loc.longitude - nb.longitude, 2)
                ) * 111.12; // approx km
                nb.distance = Number(d.toFixed(1));
              } else if (nb.distance === undefined) {
                nb.distance = 1.2;
              }
              return nb;
            });

            setNearbyBikes(merged);
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

    // Re-sync instantly on custom_bikes_updated, storage, or focus events
    useEffect(() => {
      getNearbyBikes();
      const handleUpdate = () => getNearbyBikes();
      window.addEventListener("custom_bikes_updated", handleUpdate);
      window.addEventListener("storage", handleUpdate);
      window.addEventListener("focus", handleUpdate);
      return () => {
        window.removeEventListener("custom_bikes_updated", handleUpdate);
        window.removeEventListener("storage", handleUpdate);
        window.removeEventListener("focus", handleUpdate);
      };
    }, [getNearbyBikes]);

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