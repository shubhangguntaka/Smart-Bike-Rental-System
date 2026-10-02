import bikeApi from "../api/bikeApi";
import { Bike, BikeSearchParams } from "../types/bike";

export const bikeService = {
  getAllBikes: async (): Promise<Bike[]> => {
    try {
      const res = await bikeApi.getAllBikes();
      const data = (res.data as any)?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error fetching bikes in customer app:", err);
      return [];
    }
  },

  getBikeById: async (id: number): Promise<Bike | null> => {
    try {
      const res = await bikeApi.getBikeById(id);
      return (res.data as any)?.data ?? res.data;
    } catch (err) {
      console.error(`Error fetching bike ${id}:`, err);
      return null;
    }
  },

  searchBikes: async (params: BikeSearchParams): Promise<Bike[]> => {
    try {
      const res = await bikeApi.searchBikes(params);
      const data = (res.data as any)?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error searching bikes:", err);
      return [];
    }
  },
};

export default bikeService;
