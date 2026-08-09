import React from "react";
import { Card, CardContent, CardMedia, Typography, Divider, Button, Box } from "@mui/material";
import DateRangeIcon from "@mui/icons-material/DateRange";
import PaymentIcon from "@mui/icons-material/Payment";
import BookingStatusChip from "./BookingStatusChip";
import type { Booking } from "../../types/booking";

interface Props {
  booking: Booking;
  onView?: (id: number) => void;
}

const BookingCard = React.memo(({ booking, onView }: Props) => {
  const formatDateTime = (dtStr: string) => {
    try {
      if (!dtStr) return "N/A";
      return new Date(dtStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return dtStr;
    }
  };

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: 2,
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: 5
      }
    }}>
      <CardMedia
        component="img"
        height="140"
        image={booking.bikeImage || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"}
        alt={booking.bikeName || "Bike"}
      />
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            {booking.bookingReference || `BK-${booking.bookingId}`}
          </Typography>
          <BookingStatusChip status={booking.bookingStatus} />
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {booking.bikeName || `Bike #${booking.bikeId}`}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Box display="flex" flexDirection="column" gap={1.2} mb={2.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <DateRangeIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Start: <span style={{ fontWeight: 500, color: "#333" }}>{formatDateTime(booking.startTime)}</span>
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <DateRangeIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Return: <span style={{ fontWeight: 500, color: "#333" }}>{formatDateTime(booking.returnTime)}</span>
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <PaymentIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Amount: <strong style={{ color: "#2e7d32" }}>₹{booking.rentalAmount || booking.totalAmount}</strong>
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => onView?.(booking.bookingId)}
          sx={{ borderRadius: 2, fontWeight: "bold" }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
});

BookingCard.displayName = "BookingCard";

export default BookingCard;
