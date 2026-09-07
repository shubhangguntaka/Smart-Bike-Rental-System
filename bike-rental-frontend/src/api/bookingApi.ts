import axios from "./axios";
import type { BookingRequest } from "../types/booking";

const BASE_URL = "/bookings";

export const createBooking = (customerId: number, booking: BookingRequest) =>
  axios.post(`${BASE_URL}?customerId=${customerId}`, booking);

export const updateBooking = (bookingId: number, booking: BookingRequest) =>
  axios.put(`${BASE_URL}/${bookingId}`, booking);

export const getBookingById = (bookingId: number) =>
  axios.get(`${BASE_URL}/${bookingId}`);

export const getAllBookings = () =>
  axios.get(BASE_URL);

export const getCustomerBookings = (customerId: number) =>
  axios.get(`${BASE_URL}/customer/${customerId}`);

export const getBookingsByStatus = (status: string) =>
  axios.get(`${BASE_URL}/status/${status}`);

export const cancelBooking = (bookingId: number, reason?: string) =>
  axios.put(`${BASE_URL}/${bookingId}/cancel`, reason ? { reason } : undefined);

export const updateBookingStatus = (
  bookingId: number,
  bookingStatus: string
) =>
  axios.put(`${BASE_URL}/${bookingId}/status?status=${bookingStatus}`);

export const checkVerificationStatus = (customerId: number) =>
  axios.get(`${BASE_URL}/check-verification?customerId=${customerId}`);

export const confirmBooking = (bookingId: number) =>
  axios.post(`${BASE_URL}/${bookingId}/confirm`);

export const scanQRCode = (qrCode: string) =>
  axios.post(`${BASE_URL}/scan?qrCode=${encodeURIComponent(qrCode)}`);

export const getRideTracking = (bookingId: number) =>
  axios.get(`${BASE_URL}/${bookingId}/tracking`);

export const checkAvailability = (bikeId: number, startTime: string, returnTime: string) =>
  axios.get(`${BASE_URL}/check-availability?bikeId=${bikeId}&startTime=${encodeURIComponent(startTime)}&returnTime=${encodeURIComponent(returnTime)}`);

export const handoverBooking = (bookingId: number) =>
  axios.post(`${BASE_URL}/${bookingId}/handover`);

export const returnBooking = (bookingId: number) =>
  axios.post(`${BASE_URL}/${bookingId}/return`);
