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

  async deleteBike(bikeId: number): Promise<void> {
    if (!Number.isFinite(bikeId)) {
      throw new Error("Valid Bike ID is required.");
    }
    await api.delete(`/admin/bikes/${bikeId}`);
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
    const response = await api.get("/admin/payments");

    const data = unwrapData<any[]>(response.data);

    if (!Array.isArray(data)) return [];

    return data
      .map((p: any): PaymentAdmin => {
        const amountVal =
          p.finalAmount != null
            ? p.finalAmount
            : p.amount != null
            ? p.amount
            : p.eligibleTransactionAmount != null
            ? p.eligibleTransactionAmount
            : p.baseRentalAmount != null
            ? p.baseRentalAmount
            : 0;

        const rawStatus = p.paymentStatus ?? p.status ?? "PENDING";
        const normalizedStatus = String(rawStatus).toUpperCase();

        const rawDate = p.paidAt ?? p.paymentDate ?? p.createdAt ?? "";

        return {
          paymentId: Number(p.paymentId ?? p.id ?? 0),
          bookingId: Number(p.bookingId ?? 0),
          customerId: p.customerId ? Number(p.customerId) : undefined,
          amount: Number(amountVal),
          finalAmount: p.finalAmount != null ? Number(p.finalAmount) : undefined,
          baseRentalAmount:
            p.baseRentalAmount != null ? Number(p.baseRentalAmount) : undefined,
          lateCharge: p.lateCharge != null ? Number(p.lateCharge) : undefined,
          taxAmount: p.taxAmount != null ? Number(p.taxAmount) : undefined,
          platformFeeAmount:
            p.platformFeeAmount != null ? Number(p.platformFeeAmount) : undefined,
          platformFeePercent:
            p.platformFeePercent != null ? Number(p.platformFeePercent) : undefined,
          status: normalizedStatus,
          paymentStatus: normalizedStatus,
          paymentDate: String(rawDate),
          paidAt: p.paidAt ? String(p.paidAt) : undefined,
          createdAt: p.createdAt ? String(p.createdAt) : undefined,
          transactionId: p.transactionId ?? p.razorpayPaymentId,
          paymentMethod: p.paymentMethod ?? "ONLINE",
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId,
          invoiceNumber: p.invoiceNumber,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.paidAt || a.paymentDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.paidAt || b.paymentDate || b.createdAt || 0).getTime();
        if (dateA && dateB && dateA !== dateB) {
          return dateB - dateA;
        }
        return Number(b.paymentId || 0) - Number(a.paymentId || 0);
      });
  },

  async getActivity(): Promise<AdminActivity[]> {
    const response =
      await api.get("/admin/activity");

    const data = unwrapData<AdminActivity[]>(
      response.data
    );

    return Array.isArray(data) ? data : [];
  },

  async getBankAccount(): Promise<import("@/types/owner").BankAccountDTO> {
    const response = await api.get("/admin/bank-account");
    return unwrapData<import("@/types/owner").BankAccountDTO>(response.data);
  },

  async updateBankAccount(data: Partial<import("@/types/owner").BankAccountDTO>): Promise<import("@/types/owner").BankAccountDTO> {
    const response = await api.put("/admin/bank-account", data);
    return unwrapData<import("@/types/owner").BankAccountDTO>(response.data);
  },
};

export default adminService;