import React from "react";
import Chip from "@mui/material/Chip";

interface Props {
  status: string;
}

const BookingStatusChip = React.memo(({ status }: Props) => {
  const getColor = () => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "success";
      case "PENDING":
        return "warning";
      case "VERIFICATION_REQUIRED":
        return "secondary";
      case "ACTIVE":
        return "primary";
      case "CANCELLED":
        return "error";
      case "COMPLETED":
        return "info";
      default:
        return "default";
    }
  };

  const getLabel = () => {
    if (status === "VERIFICATION_REQUIRED") {
      return "Verification Required";
    }
    return status;
  };

  return (
    <Chip
      label={getLabel()}
      color={getColor() as any}
      size="small"
      sx={{ fontWeight: "medium" }}
    />
  );
});

BookingStatusChip.displayName = "BookingStatusChip";

export default BookingStatusChip;