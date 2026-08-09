import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, CardContent, Typography, Box, CircularProgress, Alert, Button, Divider, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BookingQRCode from "../../components/booking/BookingQRCode";
import { BookingService } from "../../services/bookingService";
import type { Booking } from "../../types/booking";

const BookingQRCodePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooking = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await BookingService.getBookingById(Number(id));
      setBooking(data);
    } catch (err: any) {
      setError(err.message || "Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/customer/bookings")}>
          Back
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={loadBooking}>Retry</Button>
        }>
          {error}
        </Alert>
      ) : !booking ? (
        <Alert severity="warning">Booking not found.</Alert>
      ) : (
        <Box>
          <Typography variant="h5" fontWeight="black" mb={2} textAlign="center">
            Your Booking QR Code
          </Typography>

          <BookingQRCode
            value={booking.qrCode || `BOOKING-REF: BK-${booking.bookingId}`}
            bookingId={booking.bookingId}
            bookingStatus={booking.bookingStatus}
          />

          <Card sx={{ mt: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                Summary of Booking
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">BIKE ID</Typography>
                  <Typography variant="body2" fontWeight="bold">#{booking.bikeId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">RENTAL AMOUNT</Typography>
                  <Typography variant="body2" fontWeight="bold">₹{booking.rentalAmount || booking.totalAmount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">START TIME</Typography>
                  <Typography variant="body2">{new Date(booking.startTime).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">RETURN TIME</Typography>
                  <Typography variant="body2">{new Date(booking.returnTime).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default BookingQRCodePage;
