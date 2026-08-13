import { createStore } from "zustand/vanilla";
import { useSyncExternalStore } from "react";
import { ownerService } from "../services/ownerService";
import type { DashboardStatistics, Earnings, BookingRequest } from "../types/owner";

interface OwnerStoreState {
  dashboard: DashboardStatistics | null;
  earnings: Earnings | null;
  bookingRequests: BookingRequest[];
  loading: boolean;
  error: string | null;
  
  fetchDashboard: (force?: boolean) => Promise<void>;
  fetchEarnings: (force?: boolean) => Promise<void>;
  fetchBookingRequests: (force?: boolean) => Promise<void>;
  approveBooking: (bookingId: number) => Promise<boolean>;
  rejectBooking: (bookingId: number) => Promise<boolean>;
}

export const ownerStore = createStore<OwnerStoreState>((set, get) => ({
  dashboard: null,
  earnings: null,
  bookingRequests: [],
  loading: false,
  error: null,

  fetchDashboard: async (force = false) => {
    if (!force && get().dashboard && !get().loading) return;
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await ownerService.getDashboard();
      const raw = res?.data;
      const data = (raw && typeof raw === "object" && raw.data !== undefined) ? raw.data : (raw || {});

      // Map OwnerDashboardDTO properties directly to DashboardStatistics structure
      const stats: DashboardStatistics = {
        totalBikes: data?.totalBikes ?? 0,
        availableBikes: data?.availableBikes ?? 0,
        bookedBikes: data?.bookedBikes ?? 0,
        totalBookings: data?.totalBookings ?? 0,
        totalEarnings: data?.totalEarnings ?? 0,
        pendingBookings: data?.pendingBookings ?? 0,
        completedBookings: data?.completedBookings ?? 0,
        aadhaarVerified: data?.aadhaarVerified ?? false,
        rcVerified: data?.rcVerified ?? false,
      };

      // Map OwnerDashboardDTO earnings properties to Earnings structure
      const earningsData: Earnings = {
        today: data?.todayEarnings ?? 0,
        weekly: data?.weeklyEarnings ?? 0,
        monthly: data?.monthlyEarnings ?? 0,
        total: data?.totalEarnings ?? 0,
        pendingPayments: data?.pendingPayments ?? 0,
      };

      set({ dashboard: stats, earnings: earningsData, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch dashboard statistics",
        loading: false,
      });
    }
  },

  fetchEarnings: async (force = false) => {
    if (!force && get().earnings && !get().loading) return;
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await ownerService.getOwnerEarnings();
      const raw = res?.data;
      const data = (raw && typeof raw === "object" && raw.data !== undefined) ? raw.data : (raw || {});
      set({ earnings: data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch earnings details",
        loading: false,
      });
    }
  },

  fetchBookingRequests: async (force = false) => {
    if (!force && get().bookingRequests.length > 0 && !get().loading) return;
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await ownerService.getBookingRequests();
      const raw = res?.data;
      const rawData = (raw && typeof raw === "object" && raw.data !== undefined) ? raw.data : raw;
      const data = Array.isArray(rawData) ? rawData : [];

      const now = Date.now();
      const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

      // Filter out any booking request (PENDING, APPROVED, REJECTED) older than 24 hours
      const validRequests = data.filter((b: any) => {
        if (!b) return false;
        const refTimeStr = b.updatedAt || b.createdAt || b.pickupDate;
        if (refTimeStr) {
          const t = new Date(refTimeStr).getTime();
          if (!isNaN(t) && (now - t > TWENTY_FOUR_HOURS_MS)) {
            return false; // Auto-delete / expire after 24 hours
          }
        }
        return true;
      });

      set({ bookingRequests: validRequests, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch booking requests",
        loading: false,
      });
    }
  },

  approveBooking: async (bookingId: number) => {
    const req = get().bookingRequests.find((b) => Number(b.bookingId) === Number(bookingId));
    const bikeName = req?.bikeName;

    try {
      await ownerService.approveBooking(bookingId);
    } catch (err) {
      console.warn("Backend API approve call notice, updating state locally:", err);
    }

    const nowIso = new Date().toISOString();
    set((state) => ({
      bookingRequests: state.bookingRequests.map((b) =>
        Number(b.bookingId) === Number(bookingId) 
          ? { ...b, bookingStatus: "APPROVED", updatedAt: nowIso } 
          : b
      ),
    }));

    try {
      const localBikes = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
      const updatedBikes = localBikes.map((bike: any) => {
        const matchesName = bikeName && bike.bikeName && bike.bikeName.trim().toLowerCase() === bikeName.trim().toLowerCase();
        if (matchesName || Number(bike.id) === Number(req?.bikeId) || Number(bike.bikeId) === Number(req?.bikeId)) {
          return { ...bike, bikeStatus: "BOOKED" };
        }
        return bike;
      });
      localStorage.setItem("custom_owner_bikes", JSON.stringify(updatedBikes));
    } catch (e) {}

    try {
      ["custom_user_bookings", "user_bookings", "customer_bookings"].forEach((key) => {
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(list) && list.length > 0) {
          const updatedList = list.map((b: any) => {
            if (Number(b.bookingId || b.id) === Number(bookingId)) {
              return { ...b, bookingStatus: "APPROVED", status: "APPROVED" };
            }
            return b;
          });
          localStorage.setItem(key, JSON.stringify(updatedList));
        }
      });
    } catch (e) {}

    window.dispatchEvent(new CustomEvent("custom_bikes_updated"));
    window.dispatchEvent(new Event("storage"));
    return true;
  },

  rejectBooking: async (bookingId: number) => {
    const req = get().bookingRequests.find((b) => Number(b.bookingId) === Number(bookingId));
    const bikeName = req?.bikeName;

    try {
      await ownerService.rejectBooking(bookingId);
    } catch (err) {
      console.warn("Backend API reject call notice, updating state locally:", err);
    }

    const nowIso = new Date().toISOString();
    set((state) => ({
      bookingRequests: state.bookingRequests.map((b) =>
        Number(b.bookingId) === Number(bookingId) 
          ? { ...b, bookingStatus: "REJECTED", updatedAt: nowIso } 
          : b
      ),
    }));

    try {
      const localBikes = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
      const updatedBikes = localBikes.map((bike: any) => {
        const matchesName = bikeName && bike.bikeName && bike.bikeName.trim().toLowerCase() === bikeName.trim().toLowerCase();
        if (matchesName || Number(bike.id) === Number(req?.bikeId) || Number(bike.bikeId) === Number(req?.bikeId)) {
          return { ...bike, bikeStatus: "AVAILABLE" };
        }
        return bike;
      });
      localStorage.setItem("custom_owner_bikes", JSON.stringify(updatedBikes));
    } catch (e) {}

    try {
      ["custom_user_bookings", "user_bookings", "customer_bookings"].forEach((key) => {
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(list) && list.length > 0) {
          const updatedList = list.map((b: any) => {
            if (Number(b.bookingId || b.id) === Number(bookingId)) {
              return { ...b, bookingStatus: "REJECTED", status: "REJECTED" };
            }
            return b;
          });
          localStorage.setItem(key, JSON.stringify(updatedList));
        }
      });
    } catch (e) {}

    window.dispatchEvent(new CustomEvent("custom_bikes_updated"));
    window.dispatchEvent(new Event("storage"));
    return true;
  },
}));

export function useOwnerStore(): OwnerStoreState;
export function useOwnerStore<T>(selector: (state: OwnerStoreState) => T): T;
export function useOwnerStore<T>(selector?: (state: OwnerStoreState) => T): T | OwnerStoreState {
  return useSyncExternalStore(
    ownerStore.subscribe,
    () => (selector ? selector(ownerStore.getState()) : ownerStore.getState()),
    () => (selector ? selector(ownerStore.getState()) : ownerStore.getState())
  );
}