import React from "react";
import { Card, CardContent, Typography, Box, Divider, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import BookingQRCode from "./BookingQRCode";

interface Props {
  bookingId: number;
  customerName: string;
  bikeName: string;
  pickupDate: string;
  returnDate: string;
  rentalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  qrCodeValue: string;
}

const BookingReceipt = ({
  bookingId,
  customerName,
  bikeName,
  pickupDate,
  returnDate,
  rentalAmount,
  paymentStatus,
  bookingStatus,
  qrCodeValue
}: Props) => {
  const gstRate = 0.18;
  const gstAmount = rentalAmount * gstRate;
  const totalAmount = rentalAmount + gstAmount;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card sx={{
      maxWidth: 600,
      mx: "auto",
      mt: 3,
      p: 3,
      border: "1px solid #e0e0e0",
      boxShadow: 4,
      borderRadius: 3,
      "@media print": {
        boxShadow: "none",
        border: "none",
        margin: 0,
        padding: 0
      }
    }}>
      <CardContent>
        {/* Receipt Header with Logo Mockup */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="900" color="primary" letterSpacing={1}>
              BIKE RENTALS
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              INVOICE & RECEIPT
            </Typography>
          </Box>
          <Box sx={{ p: 1, border: "2px solid", borderColor: "primary.main", borderRadius: 1.5, display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle2" color="primary" fontWeight="bold">
              OFFICIAL
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Invoice Meta Table */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">INVOICE ID</Typography>
            <Typography variant="body2" fontWeight="bold">#INV-BK-{bookingId}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">DATE GENERATED</Typography>
            <Typography variant="body2">{new Date().toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">BILLED TO</Typography>
            <Typography variant="body2" fontWeight="bold">{customerName}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">BOOKING REFERENCE</Typography>
            <Typography variant="body2" fontWeight="bold">BK-{bookingId}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Detailed Charges Table */}
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          LINE ITEMS
        </Typography>
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Bike Rental Fee ({bikeName})</TableCell>
                <TableCell align="right">₹{rentalAmount.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>GST (18%)</TableCell>
                <TableCell align="right">₹{gstAmount.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell><strong>Grand Total (INR)</strong></TableCell>
                <TableCell align="right"><strong>₹{totalAmount.toFixed(2)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">START TIME</Typography>
            <Typography variant="body2" fontWeight="medium">{formatDate(pickupDate)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">RETURN EXPECTED</Typography>
            <Typography variant="body2" fontWeight="medium">{formatDate(returnDate)}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3, borderStyle: "dashed" }} />

        {/* QR Code Container */}
        {qrCodeValue && (
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <BookingQRCode value={qrCodeValue} bookingId={bookingId} bookingStatus={bookingStatus} />
          </Box>
        )}

        {/* Receipt Actions */}
        <Box display="flex" justifyContent="center" mt={3} className="no-print" sx={{ "@media print": { display: "none" } }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            size="large"
            sx={{ px: 4, borderRadius: 2, fontWeight: "bold" }}
          >
            Print Receipt
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookingReceipt;
