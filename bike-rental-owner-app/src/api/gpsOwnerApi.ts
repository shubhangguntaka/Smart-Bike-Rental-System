import api from "./axios";
import { GPSLocationDTO, RideDTO } from "../types/gps";

export const gpsOwnerApi = {
  getRide: (rideId: number) =>
    api.get<RideDTO>(`/rides/${rideId}`),

  getRideByBookingId: (bookingId: number) =>
    api.get<RideDTO>(`/rides/booking/${bookingId}`),

  getLocations: (rideId: number) =>
    api.get<GPSLocationDTO[]>(`/rides/${rideId}/location`),

  getRideHistory: (rideId: number) =>
    api.get<RideDTO>(`/rides/${rideId}/history`),

  getDistance: (rideId: number) =>
    api.get<number>(`/rides/${rideId}/distance`),
};

export default gpsOwnerApi;
