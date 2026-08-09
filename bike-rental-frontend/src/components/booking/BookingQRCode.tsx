import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import QRCode from "react-qr-code";

interface Props {
  value: string;
  bookingId: number | string;
  bookingStatus: string;
}

const BookingQRCode = React.memo(({ value, bookingId, bookingStatus }: Props) => {
  const isDataUri = value?.startsWith("data:");

  return (
    <Card sx={{ maxWidth: 350, mx: "auto", textAlign: "center", mt: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          Booking QR Code
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Booking ID: #{bookingId}
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: "bold" }}>
          Status: {bookingStatus}
        </Typography>
        <Box display="flex" justifyContent="center" mb={2}>
          {isDataUri ? (
            <img src={value} alt="Booking QR Code" style={{ width: 180, height: 180 }} />
          ) : (
            <QRCode value={value || ""} size={180} />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Show this QR code to the bike owner during pickup.
        </Typography>
      </CardContent>
    </Card>
  );
});

BookingQRCode.displayName = "BookingQRCode";

export default BookingQRCode;