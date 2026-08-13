import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Grid, Card, CardContent, CardMedia, Typography, TextField, Button, Box, Alert, MenuItem, Paper, Skeleton, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DateRangeIcon from "@mui/icons-material/DateRange";
import bikeService from "../../services/bikeService";
import { BookingService } from "../../services/bookingService";
import useAuth from "../../hooks/useAuth";
import type { Bike } from "../../types/bike";
import { getShiftState } from "../../utils/timeUtils";

const BookBike = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const customerId = user?.id || 11;

  // Bikes state
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [filteredBikes, setFilteredBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState<string[]>([]);

  const getTodayDateTimeString = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  const timeSlots: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const padHour = String(displayHour).padStart(2, "0");
      const padMin = String(m).padStart(2, "0");
      const val = `${String(h).padStart(2, "0")}:${padMin}`;
      const label = `${padHour}:${padMin} ${period}`;
      timeSlots.push({ value: val, label });
    }
  }

  const [pickupDateOnly, setPickupDateOnly] = useState(getTodayDateTimeString().split("T")[0]);
  const [pickupTimeOnly, setPickupTimeOnly] = useState("09:00");
  const [returnDateOnly, setReturnDateOnly] = useState(getTodayDateTimeString().split("T")[0]);
  const [returnTimeOnly, setReturnTimeOnly] = useState("18:00");

  const pickupDate = `${pickupDateOnly}T${pickupTimeOnly}:00`;
  const returnDate = `${returnDateOnly}T${returnTimeOnly}:00`;
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isUnavailableDialogOpen, setIsUnavailableDialogOpen] = useState(false);

  // Fetch bikes on load
  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        const data = await bikeService.getAllBikes();
        // Include verified bikes whose shift is active (not closed)
        const availableBikes = data.filter((b) => {
          const shiftState = getShiftState(b.availableStartTime, b.availableEndTime, b.bikeStatus);
          return b.rcVerified && shiftState !== "SHIFT_CLOSED" && b.bikeStatus !== "UNDER_MAINTENANCE" && b.bikeStatus !== "NOT_AVAILABLE";
        });
        setBikes(availableBikes);
        setFilteredBikes(availableBikes);

        // Get unique locations
        const uniqueLocations = Array.from(new Set(availableBikes.map((b) => b.location).filter(Boolean)));
        setLocations(uniqueLocations);
      } catch (err: any) {
        setError(err.message || "Failed to load available bikes.");
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, []);

  // Filter bikes when search or location changes
  useEffect(() => {
    let result = bikes;
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.bikeName.toLowerCase().includes(term) ||
          b.brand.toLowerCase().includes(term) ||
          b.model.toLowerCase().includes(term)
      );
    }
    if (selectedLocation !== "") {
      result = result.filter((b) => b.location === selectedLocation);
    }
    setFilteredBikes(result);
  }, [searchTerm, selectedLocation, bikes]);

  const calculateHours = () => {
    if (!pickupDate || !returnDate) return 0;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) return 0;
    return diffTime / (1000 * 60 * 60);
  };

  const handleBookNow = async (bike: Bike) => {
    setBookingError(null);

    // Form Validations
    if (!pickupDate) {
      setBookingError("Please select a start time.");
      return;
    }
    if (!returnDate) {
      setBookingError("Please select a return time.");
      return;
    }

    const now = new Date();
    now.setMinutes(now.getMinutes() - 5);
    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (start < now) {
      setBookingError("Start time cannot be in the past.");
      return;
    }
    if (end <= start) {
      setBookingError("Return time must be strictly after start time.");
      return;
    }

    setBookingLoading(true);
    try {
      // 0. Check bike availability
      const isAvailable = await BookingService.checkAvailability(
        bike.bikeId || bike.id || 0,
        pickupDate,
        returnDate
      );

      if (bike.bikeStatus === "BOOKED" || !isAvailable) {
        setBookingError("This slot is booked at that time. Bike is already reserved by another customer.");
        setIsUnavailableDialogOpen(true);
        setBookingLoading(false);
        return;
      }

      // 1. Check Verification Status
      const isVerified = await BookingService.checkVerificationStatus(customerId);
      if (!isVerified) {
        setBookingError("Aadhaar or Driving License verification is required before booking.");
        localStorage.setItem(
          "pending_booking",
          JSON.stringify({
            bikeId: bike.bikeId || bike.id || 0,
            returnRoute: window.location.pathname,
          })
        );
        setTimeout(() => {
          navigate("/verification");
        }, 2000);
        return;
      }

      // 2. Create Booking
      const bookingRequest = {
        bikeId: bike.bikeId || bike.id || 0,
        startTime: pickupDate,
        returnTime: returnDate,
      };

      const booking = await BookingService.createBooking(customerId, bookingRequest);
      navigate(`/customer/payment/${booking.bookingId}`);
    } catch (err: any) {
      setBookingError(err.response?.data?.message || err.message || "Failed to complete booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const getFilteredTimeSlots = (selectedDateStr: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (selectedDateStr !== todayStr) {
      return timeSlots;
    }
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return timeSlots.filter((slot) => {
      const [h, m] = slot.value.split(":").map(Number);
      const slotMinutes = h * 60 + m;
      return slotMinutes >= currentMinutes;
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="black" mb={1} color="primary">
        Rent a Bike
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Choose from our fleet of fully verified, premium rental bikes.
      </Typography>

      {bookingError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setBookingError(null)}>
          {bookingError}
        </Alert>
      )}

      {/* Booking date selector (global for calculation preview) */}
      <Paper sx={{ p: 3, mb: 4, boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={2} color="primary">
          Step 1: Choose Rental Times
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <TextField
              aria-label="Pickup Date"
              fullWidth
              label="Pickup Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={pickupDateOnly}
              onChange={(e) => setPickupDateOnly(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              aria-label="Pickup Time"
              fullWidth
              select
              label="Pickup Time"
              value={pickupTimeOnly}
              onChange={(e) => setPickupTimeOnly(e.target.value)}
            >
              {timeSlots.map((slot) => (
                <MenuItem key={slot.value} value={slot.value}>
                  {slot.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              aria-label="Return Date"
              fullWidth
              label="Return Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={returnDateOnly}
              onChange={(e) => setReturnDateOnly(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              aria-label="Return Time"
              fullWidth
              select
              label="Return Time"
              value={returnTimeOnly}
              onChange={(e) => setReturnTimeOnly(e.target.value)}
            >
              {timeSlots.map((slot) => (
                <MenuItem key={slot.value} value={slot.value}>
                  {slot.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Catalog search and filters */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={8}>
          <TextField
            aria-label="Search bikes"
            fullWidth
            placeholder="Search by brand, model or bike name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            aria-label="Filter by Location"
            fullWidth
            select
            label="Location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            InputProps={{
              startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
            }}
          >
            <MenuItem value="">All Locations</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Catalog list */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ borderRadius: 2 }}>
                <Skeleton variant="rectangular" height={200} animation="wave" />
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={36} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
        </Alert>
      ) : filteredBikes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No available bikes found matching your criteria.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBikes.map((bike) => {
            const hours = calculateHours();
            const hourlyPrice = bike.hourlyRate || Math.round(bike.rentalPrice / 24);
            const estAmount = Math.round(hours * hourlyPrice);
            return (
              <Grid item xs={12} sm={6} md={4} key={bike.bikeId || bike.id}>
                <Card sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: 2,
                  borderRadius: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={bike.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"}
                    alt={bike.bikeName}
                  />
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {bike.bikeName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Brand: {bike.brand} | Model: {bike.model}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {bike.location}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                      <Box>
                        <Typography variant="h6" fontWeight="black" color="primary">
                          ₹{hourlyPrice}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          per hour
                        </Typography>
                      </Box>
                      {hours > 0 && (
                        <Box textAlign="right">
                          <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                            ₹{estAmount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            for {hours.toFixed(1)} hours
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box mt={2}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => handleBookNow(bike)}
                        disabled={bookingLoading}
                      >
                        {bookingLoading ? "Booking..." : "Book Now"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      <Dialog
        open={isUnavailableDialogOpen}
        onClose={() => setIsUnavailableDialogOpen(false)}
        aria-labelledby="unavailable-dialog-title"
        aria-describedby="unavailable-dialog-description"
      >
        <DialogTitle id="unavailable-dialog-title">
          {bookingError && bookingError.toLowerCase().includes("pending")
            ? "Acceptance Pending by Owner"
            : "Slot Already Booked"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="unavailable-dialog-description">
            {bookingError || "This slot is booked at that time. Bike is already accepted and reserved by the owner for another customer."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUnavailableDialogOpen(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookBike;
