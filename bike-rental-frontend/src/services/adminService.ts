import api from "@/api/axios";

import type {
  AdminDashboard,
  BikeAdmin,
  BookingAdmin,
  CustomerAdmin,
  OwnerAdmin,
  PaymentAdmin,
  UserAdmin,
} from "../types/admin";

export const adminService = {

  async getDashboard(): Promise<AdminDashboard> {

    const response =
      await api.get<AdminDashboard>(
        "/admin/dashboard"
      );

    return response.data;
  },

  async getUsers(): Promise<UserAdmin[]> {

    const response =
      await api.get<UserAdmin[]>(
        "/admin/users"
      );

    return response.data;
  },

  async updateUserStatus(
    userId: number,
    enabled: boolean
  ): Promise<UserAdmin> {

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    const response =
      await api.put<UserAdmin>(
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

  async getCustomers(): Promise<CustomerAdmin[]> {
    const response = await api.get("/admin/customers");

    const data = response.data?.data ?? response.data;

    return Array.isArray(data) ? data : [];
  },

  async getOwners(): Promise<OwnerAdmin[]> {

    const response =
      await api.get<OwnerAdmin[]>(
        "/admin/owners"
      );

    return response.data;
  },

  async getBikes(): Promise<BikeAdmin[]> {

    const response =
      await api.get<BikeAdmin[]>(
        "/admin/bikes"
      );

    return response.data;
  },

  async updateBikeStatus(
    bikeId: number,
    status: string
  ): Promise<BikeAdmin> {
    if (!Number.isFinite(bikeId)) {
      throw new Error("Valid Bike ID is required.");
    }

    const normalizedStatus =
      status.trim().toUpperCase();

    const allowedStatuses = [
      "AVAILABLE",
      "BOOKED",
      "UNDER_MAINTENANCE",
      "NOT_AVAILABLE",
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      throw new Error(
        `Invalid bike status: ${normalizedStatus}`
      );
    }

    console.log("[Admin Bike Status] Request:", {
      bikeId,
      status: normalizedStatus,
    });

    const response =
      await api.put<BikeAdmin>(
        `/admin/bikes/${bikeId}/status`,
        null,
        {
          params: {
            status: normalizedStatus,
          },
        }
      );

    console.log(
      "[Admin Bike Status] Response:",
      response.data
    );

    return response.data;
  },

  async getBookings(): Promise<BookingAdmin[]> {

    const response =
      await api.get<BookingAdmin[]>(
        "/admin/bookings"
      );

    return response.data;
  },

  async getPayments(): Promise<PaymentAdmin[]> {

    const response =
      await api.get<PaymentAdmin[]>(
        "/admin/payments"
      );

    return response.data;
  },

  async getActivity(): Promise<unknown[]> {

    const response =
      await api.get<unknown[]>(
        "/admin/activity"
      );

    return response.data;
  },
};

export default adminService;