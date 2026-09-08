import { createStore } from "zustand/vanilla";
import { useSyncExternalStore } from "react";
import { ownerService } from "../services/ownerService";
import type { DashboardStatistics, Earnings, BookingRequest, OwnerPaymentDTO, OwnerEarningsSummaryDTO } from "../types/owner";

interface OwnerStoreState {
  dashboard: DashboardStatistics | null;
  earnings: Earnings | null;
  bookingRequests: BookingRequest[];
  ownerPayments: OwnerPaymentDTO[];
  earningsSummary: OwnerEarningsSummaryDTO | null;
  loading: boolean;
  error: string | null;
  
  fetchDashboard: (force?: boolean) => Promise<void>;
  fetchEarnings: (force?: boolean) => Promise<void>;
  fetchBookingRequests: (force?: boolean) => Promise<void>;
  fetchOwnerPayments: (status?: string, force?: boolean) => Promise<void>;
  fetchOwnerEarningsSummary: (force?: boolean) => Promise<void>;
  fetchAllOwnerFinancials: (force?: boolean) => Promise<void>;
  approveBooking: (bookingId: number) => Promise<boolean>;
  rejectBooking: (bookingId: number) => Promise<boolean>;
  cancelBooking: (bookingId: number, reason?: string) => Promise<boolean>;
}

export const ownerStore = createStore<OwnerStoreState>((set, get) => ({
  dashboard: null,
  earnings: null,
  bookingRequests: [],
  ownerPayments: [],
  earningsSummary: null,
  loading: false,
  error: null,

  fetchDashboard: async (force = false) => {
    if (!force && get().dashboard) return;
    try {
      const res = await ownerService.getDashboard();
      const data = res.data?.data;

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

      const earningsData: Earnings = {
        today: data?.todayEarnings ?? 0,
        weekly: data?.weeklyEarnings ?? 0,
        monthly: data?.monthlyEarnings ?? 0,
        total: data?.totalEarnings ?? 0,
        pendingPayments: data?.pendingPayments ?? 0,
      };

      set({ dashboard: stats, earnings: earningsData, error: null });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || (err instanceof Error ? err.message : "Failed to fetch dashboard statistics");
      set({ error: msg });
    }
  },

  fetchEarnings: async (force = false) => {
    if (!force && get().earnings) return;
    try {
      const res = await ownerService.getOwnerEarnings();
      const data = res.data?.data;
      if (data) {
        set({ earnings: data, error: null });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || (err instanceof Error ? err.message : "Failed to fetch earnings details");
      set({ error: msg });
    }
  },

  fetchBookingRequests: async (force = false) => {
    if (!force && get().bookingRequests.length > 0) return;
    try {
      const res = await ownerService.getBookingRequests();
      const rawData = res.data?.data;
      const data: BookingRequest[] = Array.isArray(rawData) ? rawData : [];
      set({ bookingRequests: data, error: null });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || (err instanceof Error ? err.message : "Failed to fetch booking requests");
      set({ error: msg });
    }
  },

  fetchOwnerPayments: async (status?: string, force = false) => {
    if (!force && get().ownerPayments.length > 0 && !status) return;
    try {
      const res = await ownerService.getOwnerPayments(status);
      const rawData = res.data?.data;
      const data: OwnerPaymentDTO[] = Array.isArray(rawData) ? rawData : [];
      set({ ownerPayments: data, error: null });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || (err instanceof Error ? err.message : "Failed to fetch owner payments");
      set({ error: msg });
    }
  },

  fetchOwnerEarningsSummary: async (force = false) => {
    if (!force && get().earningsSummary) return;
    try {
      const res = await ownerService.getOwnerEarningsSummary();
      const data = res.data?.data;
      if (data) {
        set({ earningsSummary: data, error: null });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || (err instanceof Error ? err.message : "Failed to fetch earnings summary");
      set({ error: msg });
    }
  },

  fetchAllOwnerFinancials: async (force = true) => {
    set({ loading: true });
    try {
      await Promise.allSettled([
        get().fetchOwnerPayments(undefined, force),
        get().fetchOwnerEarningsSummary(force),
        get().fetchEarnings(force),
        get().fetchBookingRequests(force),
        get().fetchDashboard(force),
      ]);
      // If we have either payments, bookings, dashboard, or earnings loaded, clear error
      if (get().ownerPayments.length > 0 || get().bookingRequests.length > 0 || get().dashboard || get().earnings) {
        set({ error: null });
      }
    } finally {
      set({ loading: false });
    }
  },

  approveBooking: async (bookingId: number) => {
    try {
      await ownerService.approveBooking(bookingId);
      await Promise.all([
        get().fetchBookingRequests(true),
        get().fetchDashboard(true),
        get().fetchOwnerPayments(undefined, true),
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
        get().fetchOwnerPayments(undefined, true),
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
        get().fetchOwnerPayments(undefined, true),
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
