import React from "react";
import { Stepper, Step, StepLabel, Box, Paper, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface Props {
  status: string;
}

const steps = [
  "Booking Requested",
  "Verification Checked",
  "Payment Completed",
  "Booking Confirmed",
  "Bike Picked Up",
  "Ride Started",
  "Ride Completed"
];

const getActiveStep = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return 0;
    case "VERIFICATION_REQUIRED":
      return 1;
    case "CONFIRMED":
      return 3;
    case "ACTIVE":
      return 5;
    case "COMPLETED":
      return 6;
    case "CANCELLED":
      return -1;
    default:
      return 0;
  }
};

const BookingTimeline = React.memo(({ status }: Props) => {
  const activeStep = getActiveStep(status);

  if (status === "CANCELLED") {
    return (
      <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#ffebee", borderRadius: 2 }}>
        <Typography variant="subtitle1" color="error" fontWeight="bold">
          This booking has been cancelled.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => {
          const isErrorStep = status === "VERIFICATION_REQUIRED" && index === 1;
          const labelProps: { error?: boolean, icon?: React.ReactNode } = {};

          if (isErrorStep) {
            labelProps.error = true;
            labelProps.icon = <ErrorIcon color="error" />;
          } else if (index < activeStep) {
            labelProps.icon = <CheckIcon color="success" />;
          }

          return (
            <Step key={label}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
});

BookingTimeline.displayName = "BookingTimeline";

export default BookingTimeline;
