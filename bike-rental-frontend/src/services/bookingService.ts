import * as BookingApi from "../api/bookingApi";
import type { BookingRequest } from "../types/booking";
import axios from "../api/axios";

export const BookingService = {
  createBooking: async (customerId: number, booking: BookingRequest) => {
    const response = await BookingApi.createBooking(customerId, booking);
    return response.data.data;
  },

  updateBooking: async (bookingId: number, booking: BookingRequest) => {
    const response = await BookingApi.updateBooking(bookingId, booking);
    return response.data.data;
  },

  getBookingById: async (bookingId: number) => {
    const response = await BookingApi.getBookingById(bookingId);
    return response.data.data;
  },

  getAllBookings: async () => {
    const response = await BookingApi.getAllBookings();
    return response.data.data;
  },

  getCustomerBookings: async (customerId: number) => {
    const response = await BookingApi.getCustomerBookings(customerId);
    return response.data.data;
  },

  getBookingsByStatus: async (status: string) => {
    const response = await BookingApi.getBookingsByStatus(status);
    return response.data.data;
  },

  cancelBooking: async (bookingId: number) => {
    const response = await BookingApi.cancelBooking(bookingId);
    return response.data.data;
  },

  updateBookingStatus: async (bookingId: number, bookingStatus: string) => {
    const response = await BookingApi.updateBookingStatus(bookingId, bookingStatus);
    return response.data.data;
  },

  confirmBooking: async (bookingId: number) => {
    const response = await BookingApi.confirmBooking(bookingId);
    return response.data.data;
  },

  fetchBookingHistory: async (customerId: number) => {
    const response = await BookingApi.getCustomerBookings(customerId);
    return response.data.data;
  },

  checkVerificationStatus: async (customerId: number) => {
    const response = await BookingApi.checkVerificationStatus(customerId);
    return response.data.data; // Returns boolean
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

  getBookingQRCode: async (bookingId: number) => {
    const response = await BookingApi.getBookingById(bookingId);
    return response.data.data?.qrCode || ""; // returns the QR string/dataUri stored in the booking
  },

  scanQRCode: async (qrCode: string) => {
    const response = await BookingApi.scanQRCode(qrCode);
    return response.data.data;
  },

  getRideTracking: async (bookingId: number) => {
    const response = await BookingApi.getRideTracking(bookingId);
    return response.data.data;
  },
  
  checkAvailability: async (bikeId: number, startTime: string, returnTime: string) => {
    const response = await BookingApi.checkAvailability(bikeId, startTime, returnTime);
    return response.data.data; // returns boolean
  },
};
