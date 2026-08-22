import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";

import type {
  Coordinates,
  NearbyBike,
  RouteDetails,
} from "@/types/location";
import { mapService } from "@/services/mapService";
import { normalizeBike } from "@/utils/bikeUtils";
import { subscribeBikeUpdates } from "@/utils/syncUtils";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

const DEFAULT_LOCATION: Coordinates = {
  latitude: 17.3850,
  longitude: 78.4867,
};

interface LocationContextType {
  currentLocation: Coordinates | null;
  setCurrentLocation: (location: Coordinates | null) => void;
  nearbyBikes: NearbyBike[];
  setNearbyBikes: (bikes: NearbyBike[]) => void;
  selectedBike: NearbyBike | null;
  setSelectedBike: (bike: NearbyBike | null) => void;
  route: RouteDetails | null;
  setRoute: (route: RouteDetails | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  selectedBikeId: number | null;
  setSelectedBikeId: (id: number | null) => void;
  getCurrentLocation: () => void;
  getNearbyBikes: (overrideLocation?: Coordinates) => Promise<void>;
  getRoute: (bikeId: number) => Promise<void>;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [currentLocation, setCurrentLocationState] = useState<Coordinates | null>(null);
  const [nearbyBikes, setNearbyBikes] = useState<NearbyBike[]>([]);
  const [selectedBike, setSelectedBike] = useState<NearbyBike | null>(null);
  const [route, setRoute] = useState<RouteDetails | null>(null);
  const [selectedBikeId, setSelectedBikeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const setCurrentLocation = useCallback((newLoc: Coordinates | null) => {
    setCurrentLocationState((prev) => {
      if (!prev && !newLoc) return prev;
      if (prev && newLoc && prev.latitude === newLoc.latitude && prev.longitude === newLoc.longitude) {
        return prev;
      }
      return newLoc;
    });
  }, []);

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

  const getNearbyBikes = useCallback(
    async (overrideLocation?: Coordinates) => {
      if (!isAuthenticated) {
        return;
      }
      const targetLoc = overrideLocation || currentLocation || DEFAULT_LOCATION;
      if (typeof targetLoc.latitude !== "number" || typeof targetLoc.longitude !== "number") {
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
      } finally {
        setLoading(false);
      }
    },
    [currentLocation, isAuthenticated]
  );

  const getRoute = useCallback(
    async (bikeId: number) => {
      if (!isAuthenticated) return;
      const targetLoc = currentLocation || DEFAULT_LOCATION;
      if (typeof targetLoc.latitude !== "number" || typeof targetLoc.longitude !== "number") return;
      try {
        const response = await mapService.getRoute(
          targetLoc.latitude,
          targetLoc.longitude,
          bikeId
        );
        const routeData = response?.data?.data || response?.data;
        setRoute(routeData);
      } catch (error) {
        console.error("Failed to fetch route:", error);
        toast.error("Failed to calculate route.");
      }
    },
    [currentLocation, isAuthenticated]
  );

  const refreshLocation = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    getNearbyBikes();

    const handleSync = () => {
      getNearbyBikes();
    };

    const unsub = subscribeBikeUpdates(handleSync);
    return () => {
      unsub();
    };
  }, [getNearbyBikes]);

  const contextValue = useMemo(
    () => ({
      currentLocation,
      setCurrentLocation,
      nearbyBikes,
      setNearbyBikes,
      selectedBike,
      setSelectedBike,
      route,
      setRoute,
      loading,
      setLoading,
      selectedBikeId,
      setSelectedBikeId,
      getCurrentLocation,
      getNearbyBikes,
      getRoute,
      refreshLocation,
    }),
    [
      currentLocation,
      setCurrentLocation,
      nearbyBikes,
      selectedBike,
      route,
      loading,
      selectedBikeId,
      getCurrentLocation,
      getNearbyBikes,
      getRoute,
      refreshLocation,
    ]
  );

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error(
      "useLocationContext must be used inside LocationProvider"
    );
  }

  return context;
}