import { create } from "zustand";

import bikeService from "../services/bikeService";
import type { Bike, BikeSearchParams } from "../types/bike";

interface BikeStore {
  bikes: Bike[];
  ownerBikes: Bike[];
  selectedBike: Bike | null;
  loading: boolean;
  error: string | null;

  fetchAllBikes: () => Promise<void>;
  fetchOwnerBikes: (ownerId: number) => Promise<void>;
  fetchBike: (id: number) => Promise<void>;
  addBike: (bike: Bike) => Promise<Bike | null>;
  updateBike: (id: number, bike: Bike) => Promise<Bike | null>;
  deleteBike: (id: number) => Promise<boolean>;
  searchBikes: (params: BikeSearchParams) => Promise<void>;
  clearError: () => void;
  setSelectedBike: (bike: Bike | null) => void;
}

export const useBikeStore = create<BikeStore>((set, get) => ({
  bikes: [],
  ownerBikes: [],
  selectedBike: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  setSelectedBike: (bike) => set({ selectedBike: bike }),

  fetchAllBikes: async () => {
    try {
      set({ loading: true, error: null });
      const bikes = await bikeService.getAllBikes();
      set({ bikes, loading: false });
    } catch {
      set({ error: "Unable to load bikes", loading: false });
    }
  },

  fetchOwnerBikes: async (ownerId) => {
    try {
      set({ loading: true, error: null });
      const ownerBikes = await bikeService.getOwnerBikes(ownerId);
      set({ ownerBikes, loading: false });
    } catch {
      set({ error: "Unable to load owner bikes", loading: false });
    }
  },

  fetchBike: async (id) => {
    try {
      set({ loading: true, error: null });
      const bike = await bikeService.getBikeById(id);
      set({ selectedBike: bike, loading: false });
    } catch {
      set({ error: "Bike not found", loading: false });
    }
  },

  addBike: async (bike) => {
    try {
      set({ loading: true, error: null });
      const saved = await bikeService.addBike(bike);
      const ownerBikes = await bikeService.getOwnerBikes(bike.ownerId || 17);
      set({ ownerBikes, loading: false });
      return saved;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Unable to add bike";
      set({ error: message, loading: false });
      return null;
    }
  },

  updateBike: async (id, bike) => {
    try {
      set({ loading: true, error: null });
      const saved = await bikeService.updateBike(id, bike);
      const ownerId = bike.ownerId || get().selectedBike?.ownerId;
      if (ownerId) {
        const ownerBikes = await bikeService.getOwnerBikes(ownerId);
        set({ ownerBikes, selectedBike: saved, loading: false });
      } else {
        set({ selectedBike: saved, loading: false });
      }
      return saved;
    } catch {
      set({ error: "Unable to update bike", loading: false });
      return null;
    }
  },

  deleteBike: async (id) => {
    try {
      set({ loading: true, error: null });
      await bikeService.deleteBike(id);
      set({
        ownerBikes: get().ownerBikes.filter((b) => b.bikeId !== id),
        bikes: get().bikes.filter((b) => b.bikeId !== id),
        loading: false,
      });
      return true;
    } catch {
      set({ error: "Unable to delete bike", loading: false });
      return false;
    }
  },

  searchBikes: async (params) => {
    try {
      set({ loading: true, error: null });
      const bikes = await bikeService.searchBike(params);
      set({ bikes, loading: false });
    } catch {
      set({ error: "Unable to search bikes", loading: false });
    }
  },
}));
