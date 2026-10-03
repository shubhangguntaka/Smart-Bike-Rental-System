import api from "./axios";
import { ApiResponse } from "../types/auth";
import {
  OwnerDashboardDTO,
  OwnerProfileDTO,
  BookingRequestDTO,
  EarningsDTO,
  OwnerPaymentDTO,
  OwnerEarningsSummaryDTO,
  BankAccountDTO,
} from "../types/owner";

export const ownerApi = {
  getDashboard: () =>
    api.get<ApiResponse<OwnerDashboardDTO>>("/owner/dashboard"),

  getProfile: () =>
    api.get<ApiResponse<OwnerProfileDTO>>("/owner/profile"),

  updateProfile: (data: Partial<OwnerProfileDTO>) =>
    api.put<ApiResponse<OwnerProfileDTO>>("/owner/profile", data),

  getEarnings: () =>
    api.get<ApiResponse<EarningsDTO>>("/owner/earnings"),

  getVerificationStatus: () =>
    api.get<ApiResponse<boolean>>("/owner/verification-status"),

  getBookingRequests: () =>
    api.get<ApiResponse<BookingRequestDTO[]>>("/owner/bookings"),

  approveBooking: (bookingId: number) =>
    api.post<ApiResponse<void>>(`/owner/approve/${bookingId}`),

  rejectBooking: (bookingId: number) =>
    api.post<ApiResponse<void>>(`/owner/reject/${bookingId}`),

  cancelBooking: (bookingId: number, reason?: string) =>
    api.post<ApiResponse<any>>(`/owner/cancel/${bookingId}`, { reason }),

  getPayments: (status?: string) =>
    api.get<ApiResponse<OwnerPaymentDTO[]>>("/owner/payments", {
      params: status && status !== "ALL" ? { status } : undefined,
    }),

  getPaymentById: (paymentId: number) =>
    api.get<ApiResponse<OwnerPaymentDTO>>(`/owner/payments/${paymentId}`),

  getEarningsSummary: () =>
    api.get<ApiResponse<OwnerEarningsSummaryDTO>>("/owner/payments/summary"),

  getBankAccount: () =>
    api.get<ApiResponse<BankAccountDTO>>("/owner/bank-account"),

  updateBankAccount: (data: Partial<BankAccountDTO>) =>
    api.put<ApiResponse<BankAccountDTO>>("/owner/bank-account", data),
};

export default ownerApi;
