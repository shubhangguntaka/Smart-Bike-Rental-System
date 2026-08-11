import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import NavigationIcon from "@mui/icons-material/Navigation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MapIcon from "@mui/icons-material/Map";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { BookingService } from "../../services/bookingService";
import useAuth from "../../hooks/useAuth";
import type { Booking } from "../../types/booking";

const liveUserIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const bikeMarkerIcon = new L.Icon({
  iconUrl: "/icons/motorbike.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const RideTracking = () => {
  const { user } = useAuth();
  const customerId = user?.id || 11;

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rideDuration, setRideDuration] = useState("00:00:00");
  const [currentLocation, setCurrentLocation] = useState("Koramangala 4th Block, Bangalore");
  const [eta, setEta] = useState("15 mins");
  const [trackingData, setTrackingData] = useState<any>(null);

  const loadActiveRide = async () => {
    try {
      setLoading(true);
      setError(null);

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

  useEffect(() => {
    if (!activeBooking) return;

    const fetchTracking = async () => {
      try {
        const data = await BookingService.getRideTracking(activeBooking.bookingId);
        setTrackingData(data);
        if (data.currentLocation) setCurrentLocation(data.currentLocation);
        if (data.rideDuration) setRideDuration(data.rideDuration);
        if (data.eta) setEta(data.eta);
      } catch (err) {
        console.error("Failed to fetch ride tracking data:", err);
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 3000);

    return () => clearInterval(interval);
  }, [activeBooking]);

  const mapLat = trackingData?.latitude || 12.9352;
  const mapLng = trackingData?.longitude || 77.6245;

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

                <Box mb={2.5}>
                  <Typography variant="caption" color="text.secondary" display="block">BOOKING REFERENCE</Typography>
                  <Typography variant="body2" fontWeight="bold">BK-{activeBooking.bookingId}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Interactive Leaflet GPS Map */}
          <Grid item xs={12}>
            <Paper sx={{ height: 420, width: "100%", overflow: "hidden", borderRadius: 3, border: "1px solid #e0e0e0" }}>
              <MapContainer
                center={[mapLat, mapLng]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="© OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[mapLat, mapLng]} icon={bikeMarkerIcon}>
                  <Popup>
                    <strong>Live Ride Location</strong>
                    <br />
                    {currentLocation}
                  </Popup>
                </Marker>
              </MapContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

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
