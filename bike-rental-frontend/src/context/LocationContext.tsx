import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type {
  Coordinates,
  NearbyBike,
  RouteDetails,
} from "@/types/location";

interface LocationContextType {
  currentLocation: Coordinates | null;

  setCurrentLocation: (
    location: Coordinates | null
  ) => void;

  nearbyBikes: NearbyBike[];

  setNearbyBikes: (
    bikes: NearbyBike[]
  ) => void;

  selectedBike: NearbyBike | null;

  setSelectedBike: (
    bike: NearbyBike | null
  ) => void;

  route: RouteDetails | null;

  setRoute: (
    route: RouteDetails | null
  ) => void;

  loading: boolean;

  setLoading: (
    loading: boolean
  ) => void;

  selectedBikeId: number | null;

setSelectedBikeId: (
    id: number | null
) => void;
}

const LocationContext =
  createContext<LocationContextType | undefined>(
    undefined
  );

export function LocationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentLocation, setCurrentLocation] =
    useState<Coordinates | null>(null);

  const [nearbyBikes, setNearbyBikes] =
    useState<NearbyBike[]>([]);

  const [selectedBike, setSelectedBike] =
    useState<NearbyBike | null>(null);

  const [route, setRoute] =
    useState<RouteDetails | null>(null);

    const [selectedBikeId, setSelectedBikeId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  return (
    <LocationContext.Provider
      value={{
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
      }}
    >
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