import api from "@/api/axios";

import type {
  AdminDashboard,
  BikeAdmin,
  BookingAdmin,
  OwnerAdmin,
  UserAdmin,
} from "../types/admin";

export const adminService = {
  getDashboard: async (): Promise<AdminDashboard> => {
    const response = await api.get<AdminDashboard>(
      "/admin/dashboard"
    );

    return response.data;
  },

  getUsers: async (): Promise<UserAdmin[]> => {
    const response = await api.get<UserAdmin[]>(
      "/admin/users"
    );

    return response.data;
  },

  updateUserStatus: async (
    userId: number,
    enabled: boolean
  ): Promise<UserAdmin> => {
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

  getOwners: async (): Promise<OwnerAdmin[]> => {
    const response = await api.get<OwnerAdmin[]>(
      "/admin/owners"
    );

    return response.data;
  },

  getBikes: async (): Promise<BikeAdmin[]> => {
    const response = await api.get<BikeAdmin[]>(
      "/admin/bikes"
    );

    return response.data;
  },

  updateBikeStatus: async (
    bikeId: number,
    status: string
  ): Promise<BikeAdmin> => {
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

  getBookings: async (): Promise<BookingAdmin[]> => {
    const response = await api.get<BookingAdmin[]>(
      "/admin/bookings"
    );

    return response.data;
  },

  getPayments: async (): Promise<unknown[]> => {
    const response = await api.get<unknown[]>(
      "/admin/payments"
    );

    return response.data;
  },

  getActivity: async (): Promise<unknown[]> => {
    const response = await api.get<unknown[]>(
      "/admin/activity"
    );

    return response.data;
  },
};

export default adminService;