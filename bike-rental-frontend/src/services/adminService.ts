import api from "@/api/axios";

import type {
  AdminDashboard,
  BikeAdmin,
  BookingAdmin,
  OwnerAdmin,
  UserAdmin,
} from "../types/admin";

export const adminService = {
  /**
   * Admin dashboard.
   */
  async getDashboard(): Promise<AdminDashboard> {
    const response = await api.get<AdminDashboard>(
      "/admin/dashboard"
    );

    return response.data;
  },

  /**
   * Get all users available to the administrator.
   */
  async getUsers(): Promise<UserAdmin[]> {
    const response = await api.get<UserAdmin[]>(
      "/admin/users"
    );

    return response.data;
  },

  /**
   * Enable or disable a user account.
   */
  async updateUserStatus(
    userId: number,
    enabled: boolean
  ): Promise<UserAdmin> {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const response = await api.put<UserAdmin>(
      `/admin/users/${userId}/status`,
      null,
      {
        params: {
          enabled,
        },
      }
    );

    return response.data;
  },

  /**
   * Get all bike owners.
   */
  async getOwners(): Promise<OwnerAdmin[]> {
    const response = await api.get<OwnerAdmin[]>(
      "/admin/owners"
    );

    return response.data;
  },

  /**
   * Reserved for Day 3.
   */
  async getBikes(): Promise<BikeAdmin[]> {
    const response = await api.get<BikeAdmin[]>(
      "/admin/bikes"
    );

    return response.data;
  },

  /**
   * Reserved for Day 3.
   */
  async updateBikeStatus(
    bikeId: number,
    status: string
  ): Promise<BikeAdmin> {
    if (!bikeId) {
      throw new Error("Bike ID is required.");
    }

    if (!status?.trim()) {
      throw new Error("Bike status is required.");
    }

    const response = await api.put<BikeAdmin>(
      `/admin/bikes/${bikeId}/status`,
      null,
      {
        params: {
          status,
        },
      }
    );

    return response.data;
  },

  /**
   * Reserved for Day 3.
   */
  async getBookings(): Promise<BookingAdmin[]> {
    const response = await api.get<BookingAdmin[]>(
      "/admin/bookings"
    );

    return response.data;
  },

  /**
   * Reserved for Day 3.
   */
  async getPayments(): Promise<unknown[]> {
    const response = await api.get<unknown[]>(
      "/admin/payments"
    );

    return response.data;
  },

  /**
   * Reserved for later activity-log implementation.
   */
  async getActivity(): Promise<unknown[]> {
    const response = await api.get<unknown[]>(
      "/admin/activity"
    );

    return response.data;
  },
};

export default adminService;