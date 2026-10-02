export interface GPSLocation {
  id?: number;
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: string;
  heading?: number;
}

export interface Ride {
  id?: number;
  rideId?: number;
  bookingId: number;
  bikeId: number;
  customerId: number;
  status: "STARTED" | "PAUSED" | "RESUMED" | "ENDED";
  startTime?: string;
  endTime?: string;
  totalDistance?: number;
  locations?: GPSLocation[];
}
