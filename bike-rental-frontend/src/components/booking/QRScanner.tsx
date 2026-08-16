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

  const formatTimeAMPM = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    } catch {
      return dateStr;
    }
  };

  const calculateDuration = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return null;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime();
    if (isNaN(diffMs) || diffMs < 0) return null;
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins !== 1 ? "s" : ""}`;
    }
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  };

  const checkLateReturn = (scheduledReturnStr?: string, actualReturnStr?: string) => {
    if (!scheduledReturnStr || !actualReturnStr) return null;
    const scheduled = new Date(scheduledReturnStr);
    const actual = new Date(actualReturnStr);
    const diffMs = actual.getTime() - scheduled.getTime();
    if (diffMs > 60000) {
      const mins = Math.floor(diffMs / (1000 * 60));
      return `Returned late by ${mins} minute${mins > 1 ? "s" : ""}.`;
    }
    return null;
  };

  const handleConfirmPickup = async () => {
    if (!scannedBooking) return;
    setConfirming(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await BookingService.handoverBooking(scannedBooking.bookingId);
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

  const handleConfirmReturn = async () => {
    if (!scannedBooking) return;
    setConfirming(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await BookingService.returnBooking(scannedBooking.bookingId);
      setScannedBooking(updated);
      setSuccess("Bike Return Confirmed! Status is now COMPLETED.");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to confirm return.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleScan}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Scanned QR Code Text"
              placeholder="e.g. BOOKING-REF: BK-1 or BOOKING_TOKEN:BK-1"
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
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {scannedBooking && (
        <Card sx={{ border: "2px solid", borderColor: "primary.main", boxShadow: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
              {scannedBooking.bookingStatus === "CONFIRMED" && "BOOKING VERIFIED — READY FOR HANDOVER"}
              {scannedBooking.bookingStatus === "ACTIVE" && "RETURN VERIFICATION — READY FOR RETURN"}
              {scannedBooking.bookingStatus === "COMPLETED" && "RENTAL COMPLETED"}
              {scannedBooking.bookingStatus !== "CONFIRMED" && scannedBooking.bookingStatus !== "ACTIVE" && scannedBooking.bookingStatus !== "COMPLETED" && "Retrieved Booking Details"}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">CUSTOMER</Typography>
                <Typography variant="body1" fontWeight="bold">{scannedBooking.customerName || `User #${scannedBooking.customerId}`}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">BIKE</Typography>
                <Typography variant="body1" fontWeight="bold">{scannedBooking.bikeName || `Bike #${scannedBooking.bikeId}`}</Typography>
              </Grid>
              {scannedBooking.registrationNumber && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">REGISTRATION</Typography>
                  <Typography variant="body1" fontWeight="bold" color="secondary.main">{scannedBooking.registrationNumber}</Typography>
                </Grid>
              )}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">BOOKING REFERENCE</Typography>
                <Typography variant="body1" fontWeight="bold">BK-{scannedBooking.bookingId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">SCHEDULED PICKUP</Typography>
                <Typography variant="body2" fontWeight="bold">{formatTimeAMPM(scannedBooking.startTime)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">SCHEDULED RETURN</Typography>
                <Typography variant="body2" fontWeight="bold">{formatTimeAMPM(scannedBooking.returnTime)}</Typography>
              </Grid>
              {scannedBooking.actualPickupTime && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">ACTUAL PICKUP</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">{formatTimeAMPM(scannedBooking.actualPickupTime)}</Typography>
                </Grid>
              )}
              {scannedBooking.actualReturnTime && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">ACTUAL RETURN</Typography>
                  <Typography variant="body2" fontWeight="bold" color="info.main">{formatTimeAMPM(scannedBooking.actualReturnTime)}</Typography>
                </Grid>
              )}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">PAYMENT STATUS</Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">{scannedBooking.paymentStatus}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">BOOKING STATUS</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary.main">{scannedBooking.bookingStatus}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">TOTAL RENTAL AMOUNT</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">₹{scannedBooking.rentalAmount || scannedBooking.totalAmount}</Typography>
              </Grid>
            </Grid>

            {/* Duration / Late return alerts */}
            {scannedBooking.bookingStatus === "COMPLETED" && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "grey.100", borderRadius: 1 }}>
                {calculateDuration(scannedBooking.actualPickupTime, scannedBooking.actualReturnTime) && (
                  <Typography variant="body2" color="text.primary" fontWeight="bold">
                    Actual Rental Duration: {calculateDuration(scannedBooking.actualPickupTime, scannedBooking.actualReturnTime)}
                  </Typography>
                )}
                {checkLateReturn(scannedBooking.returnTime, scannedBooking.actualReturnTime) && (
                  <Typography variant="body2" color="warning.main" fontWeight="bold" sx={{ mt: 0.5 }}>
                    {checkLateReturn(scannedBooking.returnTime, scannedBooking.actualReturnTime)}
                  </Typography>
                )}
              </Box>
            )}

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
                  CONFIRM BIKE HANDOVER
                </Button>
              </Box>
            ) : scannedBooking.bookingStatus === "ACTIVE" ? (
              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleConfirmReturn}
                  disabled={confirming}
                  startIcon={confirming ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  CONFIRM BIKE RETURN
                </Button>
              </Box>
            ) : scannedBooking.bookingStatus === "COMPLETED" ? (
              <Alert severity="info" sx={{ mt: 3 }}>
                Rental already completed successfully. Bike is available again.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mt: 3 }}>
                Action unavailable for status: {scannedBooking.bookingStatus}
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
