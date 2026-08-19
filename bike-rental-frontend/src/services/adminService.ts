import api from "@/api/axios";

import type {
  AdminActivity,
  AdminDashboard,
  BikeAdmin,
  BookingAdmin,
  CustomerAdmin,
  OwnerAdmin,
  PaymentAdmin,
  UserAdmin,
} from "@/types/admin";

const unwrapData = <T>(responseData: unknown): T => {
  const payload = responseData as {
    data?: T;
  };

  return payload?.data ?? (responseData as T);
};

export const adminService = {
  async getDashboard(): Promise<AdminDashboard> {
    const response = await api.get("/admin/dashboard");

    return unwrapData<AdminDashboard>(
      response.data
    );
  },

  async getUsers(): Promise<UserAdmin[]> {
    const response = await api.get("/admin/users");

    const data = unwrapData<UserAdmin[]>(
      response.data
    );

    return Array.isArray(data) ? data : [];
  },

  async updateUserStatus(
    userId: number,
    enabled: boolean
  ): Promise<UserAdmin> {
    if (!Number.isFinite(userId)) {
      throw new Error("Valid User ID is required.");
    }

    const response = await api.put(
      `/admin/users/${userId}/status`,
      null,
      {
        params: {
          enabled,
        },
      }
    );

    return unwrapData<UserAdmin>(
      response.data
    );
  },

  async getCustomers(): Promise<CustomerAdmin[]> {
    const response = await api.get(
      "/admin/customers"
    );

    const data = unwrapData<CustomerAdmin[]>(
      response.data
    );

    return Array.isArray(data) ? data : [];
  },

  async getOwners(): Promise<OwnerAdmin[]> {
    const response = await api.get("/admin/owners");

    const data = unwrapData<OwnerAdmin[]>(
      response.data
    );

    return Array.isArray(data) ? data : [];
  },

  async getBikes(): Promise<BikeAdmin[]> {
    const response = await api.get("/admin/bikes");

    const data = unwrapData<BikeAdmin[]>(
      response.data
    );

    return Array.isArray(data) ? data : [];
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

    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {
      throw new Error(
        `Invalid bike status: ${normalizedStatus}`
      );
    }

    const response = await api.put(
      `/admin/bikes/${bikeId}/status`,
      null,
      {
        params: {
          status: normalizedStatus,
        },
      }
    );

    return unwrapData<BikeAdmin>(
      response.data
    );
  },

  async getBookings(): Promise<BookingAdmin[]> {
    const response =
      await api.get("/admin/bookings");

    const data = unwrapData<BookingAdmin[]>(
      response.data
    );

    return Array.isArray(data) ? data : [];
  },

  async getPayments(): Promise<PaymentAdmin[]> {
    const response =
      await api.get("/admin/payments");

    const data = unwrapData<PaymentAdmin[]>(
      response.data
    );

    return Array.isArray(data) ? data : [];
  },

  async getActivity(): Promise<AdminActivity[]> {
    const response =
      await api.get("/admin/activity");

    const data = unwrapData<AdminActivity[]>(
      response.data
    );

    return Array.isArray(data) ? data : [];
  },
};

export default adminService;