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

export default function RideTracking() {
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
    restoreActiveRide,
  } = useRideTracking();

  const [activeBooking, setActiveBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] =
    useState<string | null>(null);

  /*
   * Load the customer's active booking and recover any active ride.
   */
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

        const activeRide = customerRides.find(
          (r: Ride) => r.status === "ACTIVE"
        );

        if (activeRide) {
          await restoreActiveRide(activeRide);
        } else if (foundActiveBooking) {
          try {
            const bookingRideRes = await gpsService.getRideByBookingId(foundActiveBooking.bookingId);
            if (bookingRideRes.data) {
              await restoreActiveRide(bookingRideRes.data);
            }
          } catch {
            // No ride created yet
          }
        }
      } catch (rErr) {
        console.warn("Could not fetch customer rides for recovery:", rErr);
      }
    } catch (err: any) {
      console.error(
        "Failed to load active booking:",
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

  /*
   * Start GPS ride tracking.
   */
  const handleStartTracking = async () => {
    if (!activeBooking) {
      return;
    }

    if (!customerId) {
      setBookingError(
        "Customer information is not available."
      );
      return;
    }

    await startRide(
      activeBooking.bookingId,
      activeBooking.bikeId,
      customerId
    );
  };

  /*
   * Complete the ride.
   */
  const handleEndRide = async () => {
    await endRide();
  };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
        >
          Live Ride Tracking
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
        >
          Track your bike location and ride progress in
          real time.
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
            color="text.secondary"
            gutterBottom
          >
            No active ride found
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Once your booking becomes active, you can
            start GPS ride tracking here.
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
          {/* Ride status and controls */}
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

          {/* Live map */}
          {(ride || currentLocation) && (
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
                  Live Location
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Your current GPS position and travelled
                  route.
                </Typography>
              </Box>

              <LiveTracker
                currentLocation={currentLocation}
                locations={locations}
              />
            </Paper>
          )}

          {/* Completed ride summary */}
          {ride?.status === "COMPLETED" && (
            <RideSummaryCard ride={ride} />
          )}
        </Box>
      )}
    </Container>
  );
}