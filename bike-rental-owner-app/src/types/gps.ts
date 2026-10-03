export interface GPSLocationDTO {
  id?: number;
  rideId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp?: string;
  recordedAt?: string;
}

export interface RideDTO {
  rideId?: number;
  id?: number;
  bookingId: number;
  bikeId: number;
  customerId: number;
  status: "STARTED" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ENDED" | string;
  startTime?: string;
  endTime?: string;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  currentLatitude?: number;
  currentLongitude?: number;
  totalDistance?: number;
  totalDurationMinutes?: number;
}
