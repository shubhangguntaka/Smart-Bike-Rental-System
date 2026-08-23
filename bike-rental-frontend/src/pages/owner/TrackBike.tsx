import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import {
  ArrowLeft,
  Bike,
  Calendar,
  Clock,
  Compass,
  MapPin,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import { gpsService } from "@/services/gpsService";
import type { GPSLocation } from "@/types/gps";
import type { Ride } from "@/types/ride";
import LiveTracker from "@/components/map/LiveTracker";
import RideSummaryCard from "@/components/map/RideSummaryCard";

function formatDuration(seconds?: number | null): string {
  if (seconds == null || seconds < 0) {
    return "—";
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatDistance(distance?: number | null): string {
  if (distance == null || distance < 0) {
    return "0.00 km";
  }
  return `${distance.toFixed(2)} km`;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function TrackBike() {
  const { rideId: rideIdParam } = useParams<{ rideId: string }>();
  const navigate = useNavigate();

  const rideId = rideIdParam ? Number(rideIdParam) : null;

  const [ride, setRide] = useState<Ride | null>(null);
  const [locations, setLocations] = useState<GPSLocation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [elapsedDuration, setElapsedDuration] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch ride and GPS tracking details
  const fetchTrackingData = useCallback(
    async (isManualRefresh = false) => {
      if (!rideId || Number.isNaN(rideId)) {
        setError("Invalid ride ID provided.");
        setLoading(false);
        return;
      }

      if (isManualRefresh) {
        setRefreshing(true);
      }

      try {
        // 1. Fetch Ride details
        const rideRes = await gpsService.getRide(rideId);
        const fetchedRide = rideRes.data;
        setRide(fetchedRide);

        // 2. Fetch GPS Locations
        const locsRes = await gpsService.getLocations(rideId);
        const rawLocs = locsRes.data;
        const locs: GPSLocation[] = Array.isArray(rawLocs) ? rawLocs : [];

        // Sort chronologically by timestamp
        const sortedLocs = [...locs].sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timeA - timeB;
        });

        setLocations(sortedLocs);

        if (sortedLocs.length > 0) {
          // The newest GPS location
          const latest = sortedLocs[sortedLocs.length - 1];
          setCurrentLocation(latest);
        } else if (
          fetchedRide?.startLatitude != null &&
          fetchedRide?.startLongitude != null &&
          Number.isFinite(Number(fetchedRide.startLatitude)) &&
          Number.isFinite(Number(fetchedRide.startLongitude))
        ) {
          // Fallback to ride start coordinates if no GPS history points yet
          setCurrentLocation({
            rideId: fetchedRide.rideId,
            latitude: Number(fetchedRide.startLatitude),
            longitude: Number(fetchedRide.startLongitude),
            timestamp: fetchedRide.startedAt || new Date().toISOString(),
          });
        } else {
          setCurrentLocation(null);
        }

        // 3. Fetch Distance
        try {
          const distRes = await gpsService.calculateDistance(rideId);
          setCalculatedDistance(distRes.data);
        } catch {
          // Use ride's total distance if distance endpoint fails
          setCalculatedDistance(fetchedRide?.totalDistance ?? 0);
        }

        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch ride tracking data:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load live tracking data for this ride.";
        setError(msg);
      } finally {
        setLoading(false);
        if (isManualRefresh) {
          setRefreshing(false);
        }
      }
    },
    [rideId]
  );

  // Initial load
  useEffect(() => {
    fetchTrackingData();
  }, [fetchTrackingData]);

  // Polling effect (every 4 seconds) for ACTIVE ride
  useEffect(() => {
    if (!rideId || ride?.status === "COMPLETED" || ride?.status === "CANCELLED") {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    pollTimerRef.current = setInterval(() => {
      fetchTrackingData(false);
    }, 4000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [rideId, ride?.status, fetchTrackingData]);

  // Live duration timer for active ride
  useEffect(() => {
    if (!ride?.startedAt) return;

    const updateTimer = () => {
      if (ride.status === "COMPLETED" && ride.totalDuration != null) {
        setElapsedDuration(ride.totalDuration);
      } else {
        const start = new Date(ride.startedAt!).getTime();
        const now = Date.now();
        const diffSecs = Math.max(0, Math.floor((now - start) / 1000));
        setElapsedDuration(diffSecs);
      }
    };

    updateTimer();

    if (ride.status === "ACTIVE") {
      durationTimerRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [ride?.startedAt, ride?.status, ride?.totalDuration]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          gap={2}
        >
          <CircularProgress color="primary" />
          <Typography color="text.secondary" variant="body2">
            Loading live bike tracking...
          </Typography>
        </Box>
      </Container>
    );
  }

  const isActive = ride?.status === "ACTIVE";
  const isPaused = ride?.status === "PAUSED";
  const isCompleted = ride?.status === "COMPLETED";

  return (
    <div className="space-y-6 text-foreground min-h-screen pb-10">
      {/* Header & Back Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/owner/bookings")}
            className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Back to Bookings"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Track My Bike</h2>
              {ride?.rideId && (
                <span className="text-xs font-bold text-muted-foreground font-mono">
                  #Ride-{ride.rideId}
                </span>
              )}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                  isActive
                    ? "bg-green-500/10 text-green-500 animate-pulse border border-green-500/20"
                    : isPaused
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : isCompleted
                        ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                        : "bg-zinc-500/10 text-zinc-500"
                }`}
              >
                {ride?.status ?? "ACTIVE"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time GPS telemetry and location monitoring for your rented vehicle.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchTrackingData(true)}
            disabled={refreshing}
            className="px-4 py-2.5 bg-muted/60 hover:bg-muted text-foreground text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-border"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Booking & Bike Info */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Bike className="h-4 w-4 text-primary" />
            <span>Vehicle / Booking</span>
          </div>
          <p className="text-base font-bold text-foreground">Bike #{ride?.bikeId}</p>
          <p className="text-xs text-muted-foreground font-mono">Booking #{ride?.bookingId}</p>
        </div>

        {/* Customer */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <User className="h-4 w-4 text-primary" />
            <span>Renter / Customer</span>
          </div>
          <p className="text-base font-bold text-foreground">Customer #{ride?.customerId}</p>
          <p className="text-xs text-muted-foreground">Authorized Renter</p>
        </div>

        {/* Distance */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Compass className="h-4 w-4 text-primary" />
            <span>Distance Covered</span>
          </div>
          <p className="text-base font-bold text-foreground">
            {formatDistance(calculatedDistance ?? ride?.totalDistance)}
          </p>
          <p className="text-xs text-muted-foreground">{locations.length} GPS checkpoints</p>
        </div>

        {/* Duration */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Clock className="h-4 w-4 text-primary" />
            <span>Ride Duration</span>
          </div>
          <p className="text-base font-bold text-foreground">
            {formatDuration(isCompleted ? ride?.totalDuration : elapsedDuration)}
          </p>
          <p className="text-xs text-muted-foreground">
            {isActive ? "● Live In Progress" : isPaused ? "⏸ Ride Paused" : "Completed Session"}
          </p>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              isActive ? "bg-green-500 animate-ping" : isPaused ? "bg-amber-500" : "bg-blue-500"
            }`}
          />
          <div>
            <p className="text-xs font-bold text-foreground">
              {isActive 
                ? "Live GPS Telemetry Active" 
                : isPaused 
                  ? "Customer Paused GPS Tracking" 
                  : "Ride Completed — Tracking Ended"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isPaused
                ? "The customer has temporarily paused location broadcasting. Telemetry will resume once active."
                : currentLocation
                  ? `Last coordinate: ${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}`
                  : "Awaiting GPS telemetry data from device..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {currentLocation?.accuracy != null && (
            <div>
              <span className="font-semibold text-foreground">Accuracy:</span>{" "}
              ±{Math.round(currentLocation.accuracy)}m
            </div>
          )}
          {currentLocation?.timestamp && (
            <div>
              <span className="font-semibold text-foreground">Updated:</span>{" "}
              {new Date(currentLocation.timestamp).toLocaleTimeString()}
            </div>
          )}
          <div>
            <span className="font-semibold text-foreground">Started:</span>{" "}
            {formatDateTime(ride?.startedAt)}
          </div>
        </div>
      </div>

      {/* Waiting for GPS banner if active but no GPS locations yet */}
      {isActive && !currentLocation && (
        <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/10 p-6 text-center space-y-2">
          <p className="font-bold text-sm text-foreground">Waiting for customer GPS location...</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            The customer has not started broadcasting live GPS coordinates yet. Live telemetry and route will automatically appear once device coordinates are received.
          </p>
        </div>
      )}

      {/* Live Map */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Live Route & Telemetry Map</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Auto-polling every 4 seconds • OpenStreetMap
          </span>
        </div>

        <LiveTracker currentLocation={currentLocation} locations={locations} />
      </div>

      {/* Completed Summary Card if completed */}
      {isCompleted && (
        <RideSummaryCard ride={ride} />
      )}
    </div>
  );
}
