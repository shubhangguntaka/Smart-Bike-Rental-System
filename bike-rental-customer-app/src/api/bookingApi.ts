import api from "./axios";
import { Booking, BookingRequest } from "../types/booking";

const BASE_URL = "/bookings";

export const bookingApi = {
  createBooking: (customerId: number, booking: BookingRequest) =>
    api.post<Booking>(`${BASE_URL}?customerId=${customerId}`, booking),

  updateBooking: (bookingId: number, booking: BookingRequest) =>
    api.put<Booking>(`${BASE_URL}/${bookingId}`, booking),

  getBookingById: (bookingId: number) =>
    api.get<Booking>(`${BASE_URL}/${bookingId}`),

  getAllBookings: () =>
    api.get<Booking[]>(BASE_URL),

  getCustomerBookings: (customerId: number) =>
    api.get<Booking[]>(`${BASE_URL}/customer/${customerId}`),

  getBookingsByStatus: (status: string) =>
    api.get<Booking[]>(`${BASE_URL}/status/${status}`),

  cancelBooking: (bookingId: number, reason?: string) =>
    api.put<Booking>(`${BASE_URL}/${bookingId}/cancel`, reason ? { reason } : undefined),

  updateBookingStatus: (bookingId: number, bookingStatus: string) =>
    api.put<Booking>(`${BASE_URL}/${bookingId}/status?status=${bookingStatus}`),

  checkVerificationStatus: (customerId: number) =>
    api.get<boolean>(`${BASE_URL}/check-verification?customerId=${customerId}`),

  confirmBooking: (bookingId: number) =>
    api.post<Booking>(`${BASE_URL}/${bookingId}/confirm`),

  scanQRCode: (qrCode: string) =>
    api.post<Booking>(`${BASE_URL}/scan?qrCode=${encodeURIComponent(qrCode)}`),

  getRideTracking: (bookingId: number) =>
    api.get<any>(`${BASE_URL}/${bookingId}/tracking`),

  checkAvailability: (bikeId: number, startTime: string, returnTime: string) =>
    api.get<boolean>(
      `${BASE_URL}/check-availability?bikeId=${bikeId}&startTime=${encodeURIComponent(
        startTime
      )}&returnTime=${encodeURIComponent(returnTime)}`
    ),

  handoverBooking: (bookingId: number) =>
    api.post<Booking>(`${BASE_URL}/${bookingId}/handover`),

  returnBooking: (bookingId: number) =>
    api.post<Booking>(`${BASE_URL}/${bookingId}/return`),
};

export default bookingApi;
