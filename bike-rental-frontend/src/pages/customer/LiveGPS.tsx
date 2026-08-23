import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";



import { useRideTracking } from "@/hooks/useRideTracking";
import useAuth from "@/hooks/useAuth";

import { BookingService } from "@/services/bookingService";
import { gpsService } from "@/services/gpsService";
import type { Booking } from "@/types/booking";
import type { Ride } from "@/types/ride";
import RideStatusCard from "@/components/map/RideStatusCard";
import LiveTracker from "@/components/map/LiveTracker";
import RideSummaryCard from "@/components/map/RideSummaryCard";

export default function LiveGPS() {
  const { user } = useAuth();
  const customerId = user?.id;

  const {
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
    loadRide,
    loadLocations,
    restoreActiveRide,
  } = useRideTracking();

  const [activeBooking, setActiveBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] =
    useState<string | null>(null);

  const loadActiveBookingAndRide = async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setBookingError(null);

      // 1. Load active booking
      let foundActiveBooking: Booking | null = null;
      try {
        const bookings = await BookingService.fetchBookingHistory(customerId);
        const active = bookings.find(
          (booking: Booking) => booking.bookingStatus === "ACTIVE"
        );
        foundActiveBooking = active ?? null;
        setActiveBooking(foundActiveBooking);
      } catch (bErr) {
        console.warn("Could not fetch booking history:", bErr);
      }

      // 2. Recover active ride using GET /api/rides/customer?customerId=...
      try {
        const ridesRes = await gpsService.getCustomerRides(customerId);
        const customerRides: Ride[] = ridesRes.data ?? [];
        
        // Find ride with status ACTIVE
        const activeRide = customerRides.find(
          (r: Ride) => r.status === "ACTIVE"
        );

        if (activeRide) {
          await restoreActiveRide(activeRide);
        } else if (foundActiveBooking) {
          // Check if there's a ride by booking id
          try {
            const bookingRideRes = await gpsService.getRideByBookingId(foundActiveBooking.bookingId);
            if (bookingRideRes.data) {
              await restoreActiveRide(bookingRideRes.data);
            }
          } catch {
            // No ride created yet for this active booking
          }
        }
      } catch (rErr) {
        console.warn("Could not fetch customer rides for recovery:", rErr);
      }
    } catch (err: any) {
      console.error(
        "Failed to load active session:",
        err
      );

      setBookingError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load active booking."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveBookingAndRide();
  }, [customerId]);

  const handleStartTracking = async () => {
    if (!activeBooking || !customerId) {
      return;
    }

    await startRide(
      activeBooking.bookingId,
      activeBooking.bikeId,
      customerId
    );
  };

  const handleEndRide = async () => {
    await endRide();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          minHeight="300px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography
          variant="h4"
          fontWeight={700}
        >
          Live GPS
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          View your current location and live ride route.
        </Typography>
      </Box>

      {bookingError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {bookingError}
        </Alert>
      )}

      {!activeBooking && !ride ? (
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
          >
            No active ride
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Your live GPS tracking will be available
            after your booking becomes active.
          </Typography>

          <Button
            variant="contained"
            onClick={loadActiveBookingAndRide}
          >
            Refresh
          </Button>
        </Paper>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <RideStatusCard
            ride={ride}
            isTracking={isTracking}
            isStarting={isStarting}
            isEnding={isEnding}
            error={error}
            gpsError={gpsError}
            permissionDenied={permissionDenied}
            onStartTracking={handleStartTracking}
            onEndRide={handleEndRide}
          />

          <Paper
            sx={{
              overflow: "hidden",
              borderRadius: 3,
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="h6"
                fontWeight={600}
              >
                Live Map
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {isTracking
                  ? "GPS tracking is currently active."
                  : "GPS tracking is currently stopped."}
              </Typography>
            </Box>

            <LiveTracker
              currentLocation={currentLocation}
              locations={locations}
            />
          </Paper>

          {ride?.status === "COMPLETED" && (
            <RideSummaryCard ride={ride} />
          )}
        </Box>
      )}
    </Container>
  );
}