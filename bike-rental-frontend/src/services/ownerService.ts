import api from "../api/axios";
import type {
  DashboardStatistics,
  OwnerProfile,
  BookingRequest,
  Earnings,
} from "../types/owner";
import type { ApiResponse } from "../types/auth";

const BASE_URL = "/owner";

export const ownerService = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardStatistics>>(`${BASE_URL}/dashboard`),

  getProfile: () =>
    api.get<ApiResponse<OwnerProfile>>(`${BASE_URL}/profile`),

  updateProfile: (data: Partial<OwnerProfile>) =>
    api.put<ApiResponse<OwnerProfile>>(`${BASE_URL}/profile`, data),

  getBookingRequests: () =>
    api.get<ApiResponse<BookingRequest[]>>(`${BASE_URL}/bookings`),

  approveBooking: (bookingId: number) =>
    api.post<ApiResponse<void>>(`${BASE_URL}/approve/${bookingId}`),

  rejectBooking: (bookingId: number) =>
    api.post<ApiResponse<void>>(`${BASE_URL}/reject/${bookingId}`),

  cancelBooking: (bookingId: number, reason?: string) =>
    api.post<ApiResponse<any>>(`${BASE_URL}/cancel/${bookingId}`, reason ? { reason } : undefined),

  getOwnerEarnings: () =>
    api.get<ApiResponse<Earnings>>(`${BASE_URL}/earnings`),

  getOwnerPayments: (status?: string) =>
    api.get<ApiResponse<import("../types/owner").OwnerPaymentDTO[]>>(`${BASE_URL}/payments`, {
      params: status && status !== "ALL" ? { status } : undefined,
    }),

  getOwnerPaymentById: (paymentId: number) =>
    api.get<ApiResponse<import("../types/owner").OwnerPaymentDTO>>(`${BASE_URL}/payments/${paymentId}`),

  getOwnerEarningsSummary: () =>
    api.get<ApiResponse<import("../types/owner").OwnerEarningsSummaryDTO>>(`${BASE_URL}/payments/summary`),

  getVerificationStatus: () =>
    api.get<ApiResponse<boolean>>(`${BASE_URL}/verification-status`),

  getBankAccount: () =>
    api.get<ApiResponse<import("../types/owner").BankAccountDTO>>(`${BASE_URL}/bank-account`),

  updateBankAccount: (data: Partial<import("../types/owner").BankAccountDTO>) =>
    api.put<ApiResponse<import("../types/owner").BankAccountDTO>>(`${BASE_URL}/bank-account`, data),
};