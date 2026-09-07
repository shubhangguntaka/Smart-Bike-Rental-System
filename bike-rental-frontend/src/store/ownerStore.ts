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
  cancelBooking: (bookingId: number, reason?: string) => Promise<boolean>;
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
      const data = res.data?.data;

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
        ownerId: data?.ownerId,
        ownerName: data?.ownerName,
        todayEarnings: data?.todayEarnings,
        weeklyEarnings: data?.weeklyEarnings,
        monthlyEarnings: data?.monthlyEarnings,
        pendingPayments: data?.pendingPayments,
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
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      set({
        error: errorObj.response?.data?.message || (err instanceof Error ? err.message : "Failed to fetch dashboard statistics"),
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
      const data = res.data?.data;
      set({ earnings: data || null, loading: false });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      set({
        error: errorObj.response?.data?.message || (err instanceof Error ? err.message : "Failed to fetch earnings details"),
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
      const rawData = res.data?.data;
      const data: BookingRequest[] = Array.isArray(rawData) ? rawData : [];

      set({ bookingRequests: data, loading: false });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      set({
        error: errorObj.response?.data?.message || (err instanceof Error ? err.message : "Failed to fetch booking requests"),
        loading: false,
      });
    }
  },

  approveBooking: async (bookingId: number) => {
    try {
      await ownerService.approveBooking(bookingId);
      await Promise.all([
        get().fetchBookingRequests(true),
        get().fetchDashboard(true),
      ]);
      return true;
    } catch (err) {
      console.error("Failed to approve booking", err);
      throw err;
    }
  },

  rejectBooking: async (bookingId: number) => {
    try {
      await ownerService.rejectBooking(bookingId);
      await Promise.all([
        get().fetchBookingRequests(true),
        get().fetchDashboard(true),
      ]);
      return true;
    } catch (err) {
      console.error("Failed to reject booking", err);
      throw err;
    }
  },

  cancelBooking: async (bookingId: number, reason?: string) => {
    try {
      await ownerService.cancelBooking(bookingId, reason);
      await Promise.all([
        get().fetchBookingRequests(true),
        get().fetchDashboard(true),
      ]);
      return true;
    } catch (err) {
      console.error("Failed to cancel booking", err);
      throw err;
    }
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
