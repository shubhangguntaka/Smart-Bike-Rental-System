import React from "react";
import { Container, Typography, Box, Paper } from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import QRScanner from "../../components/booking/QRScanner";

const QRScannerPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <QrCodeScannerIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" fontWeight="black" color="primary">
          Scan Booking QR Code
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <QRScanner />
      </Paper>
    </Container>
  );
};

export default QRScannerPage;
