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

  getOwnerEarnings: () =>
    api.get<ApiResponse<Earnings>>(`${BASE_URL}/earnings`),

  getVerificationStatus: () =>
    api.get<ApiResponse<boolean>>(`${BASE_URL}/verification-status`),
};