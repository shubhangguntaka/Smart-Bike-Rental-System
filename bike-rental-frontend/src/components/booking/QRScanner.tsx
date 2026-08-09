import React, { useState } from "react";
import { Box, TextField, Button, Card, CardContent, Typography, Alert, CircularProgress, Divider, Grid } from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { BookingService } from "../../services/bookingService";
import type { Booking } from "../../types/booking";

interface Props {
  onHandoverConfirmed?: (booking: Booking) => void;
}

const QRScanner = ({ onHandoverConfirmed }: Props) => {
  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!qrInput.trim()) {
      setError("Please enter or paste scanned QR code text.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setScannedBooking(null);

    try {
      const bookingData = await BookingService.scanQRCode(qrInput);
      setScannedBooking(bookingData);
      setSuccess("QR Code parsed successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to resolve scanned QR code.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (!scannedBooking) return;
    setConfirming(true);
    setError(null);
    setSuccess(null);

    try {
      // Update booking status to ACTIVE (Handover Confirmed)
      const updated = await BookingService.updateBookingStatus(scannedBooking.bookingId, "ACTIVE");
      setScannedBooking(updated);
      setSuccess("Bike Handover Confirmed! Status is now ACTIVE.");
      if (onHandoverConfirmed) {
        onHandoverConfirmed(updated);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to confirm handover.");
    } finally {
      setConfirming(false);
    }
  };

  // Pre-fill simulator helper
  const simulateScan = (ref: string) => {
    setQrInput(ref);
    setTimeout(() => {
      // Trigger scan automatically
      setLoading(true);
      setError(null);
      setSuccess(null);
      setScannedBooking(null);
      BookingService.scanQRCode(ref)
        .then((data) => {
          setScannedBooking(data);
          setSuccess("Simulated QR Scan completed!");
        })
        .catch((err) => {
          setError(err.response?.data?.message || err.message || "Simulated scan failed.");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 100);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
      <Card sx={{ boxShadow: 3, mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <QrCodeScannerIcon color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              QR Code Scanner Emulator
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Scan a customer's booking QR Code or enter the raw QR code text below.
          </Typography>

          {/* Visual Scan laser line mockup */}
          <Box sx={{
            width: "100%",
            height: 150,
            bgcolor: "#000",
            borderRadius: 2,
            mb: 3,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <QrCodeScannerIcon sx={{ color: "grey.700", fontSize: 64 }} />
            <Box sx={{
              width: "100%",
              height: "4px",
              bgcolor: "#4caf50",
              position: "absolute",
              left: 0,
              boxShadow: "0 0 10px #4caf50",
              animation: "scanner-laser 2s linear infinite"
            }} />
          </Box>

          <form onSubmit={handleScan}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Scanned QR Code Text"
              placeholder="e.g. BOOKING-REF: BK-12 | Bike: 5 | Renter: 4 | Amount: 500.00"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading || !qrInput.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <QrCodeScannerIcon />}
            >
              Scan & Retrieve Details
            </Button>
          </form>

          {/* Quick simulator buttons for testing */}
          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 2, border: "1px dashed #ccc" }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1} fontWeight="bold">
              SIMULATION CONTROLS (QUICK TEST)
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button size="small" variant="outlined" onClick={() => simulateScan("BOOKING-REF: BK-1")}>
                Simulate BK-1
              </Button>
              <Button size="small" variant="outlined" onClick={() => simulateScan("BOOKING-REF: BK-2")}>
                Simulate BK-2
              </Button>
              <Button size="small" variant="outlined" onClick={() => simulateScan("BOOKING-REF: BK-3")}>
                Simulate BK-3
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {scannedBooking && (
        <Card sx={{ border: "2px solid", borderColor: "primary.main", boxShadow: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
              Retrieved Booking Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">BOOKING REFERENCE</Typography>
                <Typography variant="body1" fontWeight="bold">BK-{scannedBooking.bookingId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">CUSTOMER ID</Typography>
                <Typography variant="body1" fontWeight="bold">User #{scannedBooking.customerId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">BIKE ID</Typography>
                <Typography variant="body1" fontWeight="bold">Bike #{scannedBooking.bikeId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">BOOKING STATUS</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary.main">{scannedBooking.bookingStatus}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">START TIME</Typography>
                <Typography variant="body2">{new Date(scannedBooking.startTime).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">RETURN TIME</Typography>
                <Typography variant="body2">{new Date(scannedBooking.returnTime).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">TOTAL RENTAL AMOUNT</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">₹{scannedBooking.rentalAmount || scannedBooking.totalAmount}</Typography>
              </Grid>
            </Grid>

            {scannedBooking.bookingStatus === "CONFIRMED" ? (
              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={handleConfirmPickup}
                  disabled={confirming}
                  startIcon={confirming ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  Confirm Handover & Start Ride
                </Button>
              </Box>
            ) : scannedBooking.bookingStatus === "ACTIVE" ? (
              <Alert severity="info" sx={{ mt: 3, fontWeight: "medium" }}>
                This ride is currently active and in progress.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mt: 3 }}>
                Handover cannot be confirmed for status: {scannedBooking.bookingStatus}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Global CSS for laser scanner animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanner-laser {
          0% { top: 0%; }
          50% { top: 95%; }
          100% { top: 0%; }
        }
      `}} />
    </Box>
  );
};

export default QRScanner;
