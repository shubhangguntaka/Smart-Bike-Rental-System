import React, { useState, useEffect } from "react";
import { Container, Card, CardContent, Typography, Box, CircularProgress, Alert, Button, Grid, Paper, Divider } from "@mui/material";
import NavigationIcon from "@mui/icons-material/Navigation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MapIcon from "@mui/icons-material/Map";
import { BookingService } from "../../services/bookingService";
import useAuth from "../../hooks/useAuth";
import type { Booking } from "../../types/booking";

const RideTracking = () => {
  const { user } = useAuth();
  const customerId = user?.id || 11;

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live simulation states (as placeholders with TODO comments)
  const [rideDuration, setRideDuration] = useState("00:00:00");
  const [currentLocation, setCurrentLocation] = useState("Koramangala 4th Block, Bangalore");
  const [eta, setEta] = useState("15 mins");

  const loadActiveRide = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch bookings and find the active one
      const list = await BookingService.fetchBookingHistory(customerId);
      const active = list.find((b: any) => b.bookingStatus === "ACTIVE");
      setActiveBooking(active || null);
    } catch (err: any) {
      setError(err.message || "Failed to load active ride details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveRide();
  }, [customerId]);

  const [trackingData, setTrackingData] = useState<any>(null);

  // Poll live tracking details from the backend tracking API
  useEffect(() => {
    if (!activeBooking) return;

    const fetchTracking = async () => {
      try {
        const data = await BookingService.getRideTracking(activeBooking.bookingId);
        setTrackingData(data);
        setCurrentLocation(data.currentLocation);
        setRideDuration(data.rideDuration);
        setEta(data.eta);
      } catch (err) {
        console.error("Failed to fetch ride tracking data:", err);
      }
    };

    fetchTracking(); // initial fetch
    const interval = setInterval(fetchTracking, 3000); // poll every 3 seconds

    return () => clearInterval(interval);
  }, [activeBooking]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={4}>
        <NavigationIcon color="primary" sx={{ fontSize: 36, transform: "rotate(45deg)" }} />
        <Typography variant="h4" fontWeight="black" color="primary">
          Live Ride Tracking
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : !activeBooking ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No active ride found.
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Once the bike owner confirms the pickup, your ride status transitions to ACTIVE and tracking starts.
          </Typography>
          <Button variant="contained" color="primary" onClick={loadActiveRide}>
            Refresh Tracking Status
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Tracking Stats */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                  Ride Metrics
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <AccessTimeIcon color="action" fontSize="large" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">ELAPSED DURATION</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {rideDuration}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: "error.main",
                    display: "inline-block",
                    animation: "pulse 1.5s infinite"
                  }} />
                  <LocationOnIcon color="error" fontSize="large" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">CURRENT POSITION</Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {currentLocation}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <MapIcon color="action" fontSize="large" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">ESTIMATED ARRIVAL TIME (ETA)</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                      {eta}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Location details */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                  Trip Info
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box mb={2.5}>
                  <Typography variant="caption" color="text.secondary" display="block">PICKUP POINT</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {trackingData?.pickupLocation || "Owner's registered location"}
                  </Typography>
                </Box>

                <Box mb={2.5}>
                  <Typography variant="caption" color="text.secondary" display="block">DROP POINT</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {trackingData?.dropLocation || "Return location (same as pickup)"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">BOOKING REFERENCE</Typography>
                  <Typography variant="body2" fontWeight="bold">BK-{activeBooking.bookingId}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Visual Map Simulator */}
          <Grid item xs={12}>
            <Paper sx={{ height: 400, width: "100%", overflow: "hidden", borderRadius: 3, border: "1px solid #e0e0e0" }}>
              {trackingData && (
                <iframe
                  title="Live GPS Tracking Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${trackingData.longitude - 0.005}%2C${trackingData.latitude - 0.005}%2C${trackingData.longitude + 0.005}%2C${trackingData.latitude + 0.005}&layer=mapnik&marker=${trackingData.latitude}%2C${trackingData.longitude}`}
                  style={{ border: 0 }}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Global CSS for simulation pulse animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
      `}} />
    </Container>
  );
};

export default RideTracking;
