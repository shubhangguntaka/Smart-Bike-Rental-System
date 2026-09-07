import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isOwner?: boolean;
  loading?: boolean;
  bookingTitle?: string;
}

const CUSTOMER_REASONS = [
  "Change of plans",
  "Found another bike",
  "Booking mistake",
  "Personal reason",
  "Other",
];

const OWNER_REASONS = [
  "Bike unavailable",
  "Bike maintenance",
  "Bike issue/damage",
  "Emergency",
  "Owner unavailable",
  "Other",
];

const CancelBookingDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  isOwner = false,
  loading = false,
  bookingTitle,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  useEffect(() => {
    if (open) {
      setSelectedReason("");
      setCustomReason("");
    }
  }, [open]);

  const reasons = isOwner ? OWNER_REASONS : CUSTOMER_REASONS;

  const getFinalReason = (): string => {
    if (selectedReason === "Other") {
      return customReason.trim();
    }
    return selectedReason.trim();
  };

  const isConfirmDisabled =
    loading ||
    !selectedReason ||
    (selectedReason === "Other" && !customReason.trim());

  const handleConfirm = () => {
    const finalReason = getFinalReason();
    if (finalReason) {
      onConfirm(finalReason);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Cancel Booking {bookingTitle ? `(${bookingTitle})` : ""}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, my: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {isOwner
              ? "Please select a reason for cancelling this booking. The customer will be notified."
              : "Please select a reason for cancelling your booking."}
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel id="cancellation-reason-label">Select Reason *</InputLabel>
            <Select
              labelId="cancellation-reason-label"
              value={selectedReason}
              label="Select Reason *"
              onChange={(e) => setSelectedReason(e.target.value)}
              disabled={loading}
            >
              {reasons.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedReason === "Other" && (
            <TextField
              label="Specify custom reason *"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Enter specific cancellation reason..."
              multiline
              rows={3}
              fullWidth
              size="small"
              disabled={loading}
              autoFocus
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Keep Booking
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={isConfirmDisabled}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? "Cancelling..." : "Cancel Booking"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelBookingDialog;