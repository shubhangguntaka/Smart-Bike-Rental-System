import api from "@/api/axios";
import type { GPSLocation } from "@/types/gps";
import type { Ride } from "@/types/ride";

export const gpsService = {
  startRide(
    bookingId: number,
    bikeId: number,
    customerId: number
  ) {
    return api.post<Ride>("/rides/start", {
      bookingId,
      bikeId,
      customerId,
    });
  },

  saveLocation(
    rideId: number,
    location: GPSLocation
  ) {
    return api.post<GPSLocation>(
      `/rides/${rideId}/location`,
      location
    );
  },

  getLocations(rideId: number) {
    return api.get<GPSLocation[]>(
      `/rides/${rideId}/location`
    );
  },

  getRide(rideId: number) {
    return api.get<Ride>(
      `/rides/${rideId}`
    );
  },

  getRideByBookingId(bookingId: number) {
    return api.get<Ride>(
      `/rides/booking/${bookingId}`
    );
  },

  getRideHistory(rideId: number) {
    return api.get<Ride>(
      `/rides/${rideId}/history`
    );
  },

  endRide(rideId: number) {
    return api.post<Ride>(
      `/rides/${rideId}/end`
    );
  },

  pauseRide(rideId: number) {
    return api.post<Ride>(
      `/rides/${rideId}/pause`
    );
  },

  resumeRide(rideId: number) {
    return api.post<Ride>(
      `/rides/${rideId}/resume`
    );
  },

  getCustomerRides(customerId: number) {
    return api.get<Ride[]>(
      "/rides/customer",
      {
        params: { customerId },
      }
    );
  },

  calculateDistance(rideId: number) {
    return api.get<number>(
      `/rides/${rideId}/distance`
    );
  },
};