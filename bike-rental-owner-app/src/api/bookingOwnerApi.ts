import api from "./axios";
import { ApiResponse } from "../types/auth";
import { BookingResponse, RideTrackingDTO } from "../types/booking";

export const bookingOwnerApi = {
  getBookingById: (bookingId: number) =>
    api.get<ApiResponse<BookingResponse>>(`/bookings/${bookingId}`),

  confirmBooking: (bookingId: number) =>
    api.post<ApiResponse<BookingResponse>>(`/bookings/${bookingId}/confirm`),

  updateStatus: (bookingId: number, status: string) =>
    api.put<ApiResponse<BookingResponse>>(`/bookings/${bookingId}/status`, null, {
      params: { status },
    }),

  cancelBooking: (bookingId: number, reason: string) =>
    api.put<ApiResponse<BookingResponse>>(`/bookings/${bookingId}/cancel`, { reason }),

  scanQRCode: (qrCode: string) =>
    api.post<ApiResponse<BookingResponse>>("/bookings/scan", { qrCode }),

  handoverBooking: (bookingId: number) =>
    api.post<ApiResponse<BookingResponse>>(`/bookings/${bookingId}/handover`),

  returnBooking: (bookingId: number) =>
    api.post<ApiResponse<BookingResponse>>(`/bookings/${bookingId}/return`),

  getRideTracking: (bookingId: number) =>
    api.get<ApiResponse<RideTrackingDTO>>(`/bookings/${bookingId}/tracking`),
};

export default bookingOwnerApi;
