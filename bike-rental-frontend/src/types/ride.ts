export type RideStatus =
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export interface Ride {
  rideId?: number;
  bookingId: number;
  bikeId: number;
  customerId: number;

  status?: RideStatus;

  startedAt?: string;
  endedAt?: string;

  startLatitude?: number;
  startLongitude?: number;

  endLatitude?: number;
  endLongitude?: number;

  totalDistance?: number;
  totalDuration?: number;
}