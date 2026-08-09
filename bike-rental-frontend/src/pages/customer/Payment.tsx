import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, CardContent, CardMedia, Typography, TextField, Button, Box, Alert, Grid, Divider, CircularProgress, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import { BookingService } from "../../services/bookingService";
import bikeService from "../../services/bikeService";
import { paymentService } from "../../services/paymentService";
import type { Booking } from "../../types/booking";
import type { Bike } from "../../types/bike";

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Card details mock state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const loadData = async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch booking
      const bookingData = await BookingService.getBookingById(Number(bookingId));
      setBooking(bookingData);

      // Fetch corresponding bike
      if (bookingData?.bikeId) {
        const bikeData = await bikeService.getBikeById(bookingData.bikeId);
        setBike(bikeData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load booking and invoice data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  const handlePayment = async (status: "SUCCESS" | "FAILED") => {
    if (!booking) return;

    // Basic Card Validation if selected
    if (paymentMethod === "card" && status === "SUCCESS") {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        setPaymentError("Please fill in all card details.");
        return;
      }
    }

    setProcessing(true);
    setPaymentError(null);

    const rentalAmount = booking.rentalAmount || booking.totalAmount || 0;
    const gstRate = 0.18;
    const totalAmount = rentalAmount + (rentalAmount * gstRate);

    try {
      await paymentService.processPayment({
        bookingId: booking.bookingId,
        amount: totalAmount,
        status: status
      });

      if (status === "SUCCESS") {
        setPaymentSuccess(true);
        setTimeout(() => {
          navigate(`/customer/bookings/${booking.bookingId}`);
        }, 1500);
      } else {
        setPaymentError("Simulated payment transaction failed. You can retry below.");
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || err.message || "Payment processor error.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadData}>Retry</Button>}>
          {error || "Booking details could not be found."}
        </Alert>
      </Container>
    );
  }

  const rentalAmount = booking.rentalAmount || booking.totalAmount || 0;
  const gstRate = 0.18;
  const gstAmount = rentalAmount * gstRate;
  const totalAmount = rentalAmount + gstAmount;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={4}>
        <PaymentIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" fontWeight="black" color="primary">
          Payment Checkout
        </Typography>
      </Box>

      {paymentError && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setPaymentError(null)}>{paymentError}</Alert>}
      {paymentSuccess && <Alert severity="success" sx={{ mb: 3 }}>Payment successful! Confirming booking and generating receipt...</Alert>}

      <Grid container spacing={4}>
        {/* Invoice details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            {bike && (
              <CardMedia
                component="img"
                height="180"
                image={bike.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"}
                alt={bike.bikeName}
              />
            )}
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {bike?.bikeName || "Bike Rental"}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Booking ID: #{booking.bookingId}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Rental Charges</Typography>
                <Typography variant="body2" fontWeight="bold">₹{rentalAmount.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">GST (18%)</Typography>
                <Typography variant="body2" fontWeight="bold">₹{gstAmount.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight="black">Total Amount</Typography>
                <Typography variant="subtitle1" fontWeight="black" color="primary">₹{totalAmount.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment options */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}>
                  Select Payment Method
                </FormLabel>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} sx={{ mb: 3 }}>
                  <FormControlLabel
                    value="card"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <CreditCardIcon color="action" />
                        <Typography>Credit / Debit Card</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="upi"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccountBalanceIcon color="action" />
                        <Typography>UPI Pay</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>

                {paymentMethod === "card" ? (
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      placeholder="1234 5678 9101 1121"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Expiry Date"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="CVV"
                          placeholder="123"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box mb={3}>
                    <TextField fullWidth label="UPI Virtual Address" placeholder="username@upi" sx={{ mb: 2 }} />
                  </Box>
                )}

                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={processing || paymentSuccess}
                    onClick={() => handlePayment("SUCCESS")}
                    startIcon={processing ? <CircularProgress size={20} /> : <PaymentIcon />}
                  >
                    {processing ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)}`}
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={processing || paymentSuccess}
                    onClick={() => handlePayment("FAILED")}
                  >
                    Simulate Payment Failure (Test Only)
                  </Button>
                </Box>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Payment;
