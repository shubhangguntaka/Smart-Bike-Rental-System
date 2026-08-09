import React from "react";
import BookingStatusChip from "./BookingStatusChip";

interface Props {
  status: string;
}

const BookingStatus = React.memo(({ status }: Props) => {
  return <BookingStatusChip status={status} />;
});

BookingStatus.displayName = "BookingStatus";

export default BookingStatus;
