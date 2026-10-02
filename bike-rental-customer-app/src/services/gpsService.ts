import gpsApi from "../api/gpsApi";
import { GPSLocation, Ride } from "../types/gps";

export const gpsService = {
  startRide: async (
    bookingId: number,
    bikeId: number,
    customerId: number
  ): Promise<Ride> => {
    const res = await gpsApi.startRide(bookingId, bikeId, customerId);
    return res.data;
  },

  saveLocation: async (
    rideId: number,
    location: GPSLocation
  ): Promise<GPSLocation> => {
    const res = await gpsApi.saveLocation(rideId, location);
    return res.data;
  },

  getLocations: async (rideId: number): Promise<GPSLocation[]> => {
    const res = await gpsApi.getLocations(rideId);
    return Array.isArray(res.data) ? res.data : [];
  },

  getRide: async (rideId: number): Promise<Ride> => {
    const res = await gpsApi.getRide(rideId);
    return res.data;
  },

  getRideByBookingId: async (bookingId: number): Promise<Ride> => {
    const res = await gpsApi.getRideByBookingId(bookingId);
    return res.data;
  },

  getRideHistory: async (rideId: number): Promise<Ride> => {
    const res = await gpsApi.getRideHistory(rideId);
    return res.data;
  },

  endRide: async (rideId: number): Promise<Ride> => {
    const res = await gpsApi.endRide(rideId);
    return res.data;
  },

  pauseRide: async (rideId: number): Promise<Ride> => {
    const res = await gpsApi.pauseRide(rideId);
    return res.data;
  },

  resumeRide: async (rideId: number): Promise<Ride> => {
    const res = await gpsApi.resumeRide(rideId);
    return res.data;
  },

  getCustomerRides: async (customerId: number): Promise<Ride[]> => {
    const res = await gpsApi.getCustomerRides(customerId);
    return Array.isArray(res.data) ? res.data : [];
  },

  calculateDistance: async (rideId: number): Promise<number> => {
    const res = await gpsApi.calculateDistance(rideId);
    return typeof res.data === "number" ? res.data : Number(res.data) || 0;
  },
};

export default gpsService;
