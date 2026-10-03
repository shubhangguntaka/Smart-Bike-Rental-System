import gpsOwnerApi from "../api/gpsOwnerApi";
import { GPSLocationDTO, RideDTO } from "../types/gps";

export const gpsService = {
  async getRide(rideId: number): Promise<RideDTO> {
    const res = await gpsOwnerApi.getRide(rideId);
    return res.data;
  },

  async getRideByBookingId(bookingId: number): Promise<RideDTO> {
    const res = await gpsOwnerApi.getRideByBookingId(bookingId);
    return res.data;
  },

  async getLocations(rideId: number): Promise<GPSLocationDTO[]> {
    const res = await gpsOwnerApi.getLocations(rideId);
    return res.data || [];
  },

  async getRideHistory(rideId: number): Promise<RideDTO> {
    const res = await gpsOwnerApi.getRideHistory(rideId);
    return res.data;
  },

  async getDistance(rideId: number): Promise<number> {
    const res = await gpsOwnerApi.getDistance(rideId);
    return res.data || 0;
  },
};

export default gpsService;
