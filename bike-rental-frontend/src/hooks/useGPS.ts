import { useCallback, useEffect, useRef, useState } from "react";
import type { GPSLocation } from "@/types/gps";

interface UseGPSResult {
  location: GPSLocation | null;
  isTracking: boolean;
  error: string | null;
  permissionDenied: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

export function useGPS(): UseGPSResult {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    setError(null);
    setPermissionDenied(false);
    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const gpsLocation: GPSLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date(position.timestamp).toISOString(),
          accuracy: position.coords.accuracy,
        };

        setLocation(gpsLocation);
        setError(null);
        setPermissionDenied(false);
      },
      (positionError) => {
        switch (positionError.code) {
          case positionError.PERMISSION_DENIED:
            setPermissionDenied(true);
            setError(
              "Location permission was denied. Please allow location access."
            );
            break;

          case positionError.POSITION_UNAVAILABLE:
            setError(
              "Current location is unavailable. Please check your GPS settings."
            );
            break;

          case positionError.TIMEOUT:
            setError(
              "Unable to get your location in time. Please try again."
            );
            break;

          default:
            setError("Unable to access your current location.");
        }

        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (
      watchIdRef.current !== null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (
        watchIdRef.current !== null &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    location,
    isTracking,
    error,
    permissionDenied,
    startTracking,
    stopTracking,
  };
}