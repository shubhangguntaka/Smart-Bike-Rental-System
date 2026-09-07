import * as BookingApi from "../api/bookingApi";
import type { Booking, BookingRequest } from "../types/booking";
import axios from "../api/axios";

export const BookingService = {
  createBooking: async (customerId: number, booking: BookingRequest): Promise<Booking> => {
    const response = await BookingApi.createBooking(customerId, booking);
    return response.data?.data ?? response.data;
  },

  updateBooking: async (bookingId: number, booking: BookingRequest): Promise<Booking> => {
    const response = await BookingApi.updateBooking(bookingId, booking);
    return response.data?.data ?? response.data;
  },

  getBookingById: async (bookingId: number): Promise<Booking> => {
    const response = await BookingApi.getBookingById(bookingId);
    return response.data?.data ?? response.data;
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const response = await BookingApi.getAllBookings();
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  getCustomerBookings: async (customerId: number): Promise<Booking[]> => {
    const response = await BookingApi.getCustomerBookings(customerId);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  getBookingsByStatus: async (status: string): Promise<Booking[]> => {
    const response = await BookingApi.getBookingsByStatus(status);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  cancelBooking: async (bookingId: number, reason?: string): Promise<Booking> => {
    const response = await BookingApi.cancelBooking(bookingId, reason);
    return response.data?.data ?? response.data;
  },

  updateBookingStatus: async (bookingId: number, bookingStatus: string): Promise<Booking> => {
    const response = await BookingApi.updateBookingStatus(bookingId, bookingStatus);
    return response.data?.data ?? response.data;
  },

  confirmBooking: async (bookingId: number): Promise<Booking> => {
    const response = await BookingApi.confirmBooking(bookingId);
    return response.data?.data ?? response.data;
  },

  fetchBookingHistory: async (customerId: number): Promise<Booking[]> => {
    const response = await BookingApi.getCustomerBookings(customerId);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  checkVerificationStatus: async (customerId: number): Promise<boolean> => {
    const response = await BookingApi.checkVerificationStatus(customerId);
    const data = response.data?.data ?? response.data;
    return Boolean(data);
  },

  getVerificationDetails: async (customerId: number) => {
    try {
      const [aadhaarRes, dlRes] = await Promise.all([
        axios.get(`/aadhaar/status?customerId=${customerId}`).catch(() => null),
        axios.get(`/driving-license/status?customerId=${customerId}`).catch(() => null),
      ]);
      return {
        aadhaarVerified: !!aadhaarRes?.data,
        dlVerified: !!dlRes?.data,
        aadhaarData: aadhaarRes?.data || null,
        dlData: dlRes?.data || null,
      };
    } catch {
      return {
        aadhaarVerified: false,
        dlVerified: false,
        aadhaarData: null,
        dlData: null,
      };
    }
  },

  getBookingQRCode: async (bookingId: number): Promise<string> => {
    const response = await BookingApi.getBookingById(bookingId);
    const data = response.data?.data ?? response.data;
    return data?.qrCode || "";
  },

  scanQRCode: async (qrCode: string): Promise<Booking> => {
    const response = await BookingApi.scanQRCode(qrCode);
    return response.data?.data ?? response.data;
  },

  getRideTracking: async (bookingId: number) => {
    const response = await BookingApi.getRideTracking(bookingId);
    return response.data?.data ?? response.data;
  },
  
  checkAvailability: async (bikeId: number, startTime: string, returnTime: string): Promise<boolean> => {
    const response = await BookingApi.checkAvailability(bikeId, startTime, returnTime);
    const data = response.data?.data ?? response.data;
    return Boolean(data);
  },

  handoverBooking: async (bookingId: number): Promise<Booking> => {
    const response = await BookingApi.handoverBooking(bookingId);
    return response.data?.data ?? response.data;
  },

  returnBooking: async (bookingId: number): Promise<Booking> => {
    const response = await BookingApi.returnBooking(bookingId);
    return response.data?.data ?? response.data;
  },
};
