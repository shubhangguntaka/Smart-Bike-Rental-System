import React from "react";
import { Card, CardContent, Typography, Grid, Divider, Box } from "@mui/material";

interface Props {
  bikeName: string;
  pickupDate: string;
  returnDate: string;
  rentalAmount: number;
  paymentStatus: string;
}

const RideSummary = React.memo(({
  bikeName,
  pickupDate,
  returnDate,
  rentalAmount,
  paymentStatus
}: Props) => {
  const gstRate = 0.18;
  const gstAmount = rentalAmount * gstRate;
  const discountAmount = 0.00; // Placeholders for discount if applicable (Step 7)
  const totalAmount = rentalAmount + gstAmount - discountAmount;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          Ride & Payment Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Bike Model
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {bikeName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Payment Status
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold" color={paymentStatus === "SUCCESS" ? "success.main" : "warning.main"}>
              {paymentStatus}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Pickup Date
            </Typography>
            <Typography variant="subtitle2">
              {formatDate(pickupDate)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Return Date
            </Typography>
            <Typography variant="subtitle2">
              {formatDate(returnDate)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        <Box sx={{ mt: 1 }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">Rental Amount</Typography>
            <Typography variant="body2" fontWeight="medium">₹{rentalAmount.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">GST (18%)</Typography>
            <Typography variant="body2" fontWeight="medium">₹{gstAmount.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">Discount Applied</Typography>
            <Typography variant="body2" fontWeight="medium" color="success.main">-₹{discountAmount.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight="bold">Total Amount</Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">₹{totalAmount.toFixed(2)}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

RideSummary.displayName = "RideSummary";

export default RideSummary;
