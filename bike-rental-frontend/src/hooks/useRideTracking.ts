import { useCallback, useEffect, useRef, useState } from "react";
import { gpsService } from "@/services/gpsService";
import { useGPS } from "@/hooks/useGPS";
import type { GPSLocation } from "@/types/gps";
import type { Ride } from "@/types/ride";

interface UseRideTrackingResult {
  ride: Ride | null;
  locations: GPSLocation[];
  currentLocation: GPSLocation | null;

  isStarting: boolean;
  isEnding: boolean;
  isTracking: boolean;

  error: string | null;
  gpsError: string | null;
  permissionDenied: boolean;

  startRide: (
    bookingId: number,
    bikeId: number,
    customerId: number
  ) => Promise<Ride | null>;

  endRide: () => Promise<Ride | null>;
  pauseRide: () => Promise<Ride | null>;
  resumeRide: () => Promise<Ride | null>;

  startTracking: () => void;
  stopTracking: () => void;

  loadRide: (rideId: number) => Promise<void>;
  loadLocations: (rideId: number) => Promise<void>;
  restoreActiveRide: (existingRide: Ride) => Promise<void>;

  clearError: () => void;
}

export function useRideTracking(): UseRideTrackingResult {
  const {
    location: currentLocation,
    isTracking,
    error: gpsError,
    permissionDenied,
    startTracking,
    stopTracking,
  } = useGPS();

  const [ride, setRide] = useState<Ride | null>(null);
  const [locations, setLocations] = useState<GPSLocation[]>([]);

  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const isSendingRef = useRef(false);
  const lastSentTimestampRef = useRef<string | null>(null);

  /*
   * Start a ride session.
   */
  const startRide = useCallback(
    async (
      bookingId: number,
      bikeId: number,
      customerId: number
    ): Promise<Ride | null> => {
      setIsStarting(true);
      setError(null);

      try {
        const response = await gpsService.startRide(
          bookingId,
          bikeId,
          customerId
        );

        const startedRide = response.data;

        setRide(startedRide);
        setLocations([]);

        /*
         * Start browser GPS only after the backend
         * successfully creates the ride.
         */
        startTracking();

        return startedRide;
      } catch (err: any) {
        console.error("Failed to start ride:", err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to start ride.";

        setError(message);

        return null;
      } finally {
        setIsStarting(false);
      }
    },
    [startTracking]
  );

  /*
   * Send the latest GPS location to the backend.
   */
  useEffect(() => {
    if (!ride?.rideId || !currentLocation || ride.status === "COMPLETED") {
      return;
    }

    if (
      lastSentTimestampRef.current === currentLocation.timestamp ||
      isSendingRef.current
    ) {
      return;
    }

    const rideId = ride.rideId;

    const sendLocation = async () => {
      isSendingRef.current = true;
      try {
        const response = await gpsService.saveLocation(
          rideId,
          {
            ...currentLocation,
            rideId,
          }
        );

        lastSentTimestampRef.current = currentLocation.timestamp;

        /*
         * Keep the location returned by the backend
         * in the local ride history.
         */
        setLocations((previous) => [
          ...previous,
          response.data,
        ]);

        setError(null);
      } catch (err: any) {
        console.error("Failed to send GPS location:", err);

        const message =
          err?.response?.data?.message ||
          "Unable to send current location to server. Retrying...";

        setError(message);
      } finally {
        isSendingRef.current = false;
      }
    };

    sendLocation();
  }, [currentLocation, ride?.rideId, ride?.status]);

  /*
   * End the active ride.
   */
  const endRide = useCallback(async (): Promise<Ride | null> => {
    if (!ride?.rideId) {
      setError("No active ride found.");
      return null;
    }

    setIsEnding(true);
    setError(null);

    try {
      /*
       * Stop browser GPS immediately so no more
       * locations are generated after ride completion.
       */
      stopTracking();

      const response = await gpsService.endRide(
        ride.rideId
      );

      const completedRide = response.data;

      setRide(completedRide);

      return completedRide;
    } catch (err: any) {
      console.error("Failed to end ride:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to complete ride.";

      setError(message);

      /*
       * If the backend failed to end the ride,
       * restart tracking because the ride may
       * still be active on the server.
       */
      startTracking();

      return null;
    } finally {
      setIsEnding(false);
    }
  }, [ride?.rideId, stopTracking, startTracking]);

  /*
   * Pause the active ride (notifies owner and halts GPS tracking).
   */
  const pauseRide = useCallback(async (): Promise<Ride | null> => {
    if (!ride?.rideId) {
      setError("No active ride found.");
      return null;
    }

    try {
      stopTracking();
      const response = await gpsService.pauseRide(ride.rideId);
      const pausedRide = response.data;
      setRide(pausedRide);
      return pausedRide;
    } catch (err: any) {
      console.error("Failed to pause ride:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to pause ride.";
      setError(message);
      return null;
    }
  }, [ride?.rideId, stopTracking]);

  /*
   * Resume the paused ride (notifies owner and restarts GPS tracking).
   */
  const resumeRide = useCallback(async (): Promise<Ride | null> => {
    if (!ride?.rideId) {
      setError("No paused ride found.");
      return null;
    }

    try {
      const response = await gpsService.resumeRide(ride.rideId);
      const resumedRide = response.data;
      setRide(resumedRide);
      startTracking();
      return resumedRide;
    } catch (err: any) {
      console.error("Failed to resume ride:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to resume ride.";
      setError(message);
      return null;
    }
  }, [ride?.rideId, startTracking]);

  /*
   * Load one ride.
   */
  const loadRide = useCallback(async (rideId: number) => {
    setError(null);

    try {
      const response = await gpsService.getRide(rideId);

      setRide(response.data);
    } catch (err: any) {
      console.error("Failed to load ride:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load ride.";

      setError(message);
    }
  }, []);

  /*
   * Load GPS history for a ride.
   */
  const loadLocations = useCallback(async (rideId: number) => {
    setError(null);

    try {
      const response =
        await gpsService.getLocations(rideId);

      setLocations(response.data);
    } catch (err: any) {
      console.error(
        "Failed to load GPS history:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load GPS history.";

      setError(message);
    }
  }, []);

  /*
   * Restore an existing ride on page refresh/recovery.
   */
  const restoreActiveRide = useCallback(
    async (existingRide: Ride) => {
      setError(null);
      setRide(existingRide);

      if (existingRide.rideId) {
        try {
          const locsRes = await gpsService.getLocations(existingRide.rideId);
          const locs: GPSLocation[] = Array.isArray(locsRes.data)
            ? locsRes.data
            : (locsRes.data as any)?.content || [];

          // Sort chronologically
          locs.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeA - timeB;
          });

          setLocations(locs);
        } catch (err) {
          console.warn("Could not fetch GPS history for restored ride:", err);
        }
      }

      // If ride is active, start live browser GPS tracking
      if (existingRide.status === "ACTIVE") {
        startTracking();
      } else {
        stopTracking();
      }
    },
    [startTracking, stopTracking]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /*
   * Safety cleanup:
   * If the component using this hook disappears,
   * stop GPS tracking.
   */
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    ride,
    locations,
    currentLocation,

    isStarting,
    isEnding,
    isTracking,

    error,
    gpsError,
    permissionDenied,

    startRide,
    endRide,
    pauseRide,
    resumeRide,

    startTracking,
    stopTracking,

    loadRide,
    loadLocations,
    restoreActiveRide,

    clearError,
  };
}