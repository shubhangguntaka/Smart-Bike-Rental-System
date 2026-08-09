import React, { createContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { Booking, BookingRequest } from "../types/booking";
import type { Bike } from "../types/bike";
import { BookingService } from "../services/bookingService";

interface BookingContextType {
  currentBooking: Booking | null;
  bookingHistory: Booking[];
  selectedBike: Bike | null;
  loading: boolean;
  error: string | null;
  verificationStatus: boolean | null;
  qrCode: string | null;
  setCurrentBooking: (booking: Booking | null) => void;
  setSelectedBike: (bike: Bike | null) => void;
  createBooking: (customerId: number, bookingReq: BookingRequest) => Promise<Booking>;
  cancelBooking: (bookingId: number) => Promise<Booking>;
  updateBooking: (bookingId: number, bookingReq: BookingRequest) => Promise<Booking>;
  fetchBookingHistory: (customerId: number) => Promise<Booking[]>;
  checkVerificationStatus: (customerId: number) => Promise<boolean>;
  confirmBooking: (bookingId: number) => Promise<Booking>;
  getBooking: (bookingId: number) => Promise<Booking>;
  getQRCode: (bookingId: number) => Promise<string>;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const createBooking = useCallback(async (customerId: number, bookingReq: BookingRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.createBooking(customerId, bookingReq);
      setCurrentBooking(data);
      if (data?.qrCode) {
        setQrCode(data.qrCode);
      }
      return data;
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Failed to create booking";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.cancelBooking(bookingId);
      setBookingHistory((prev) =>
        prev.map((b) => (b.bookingId === bookingId ? { ...b, bookingStatus: "CANCELLED" } : b))
      );
      if (currentBooking && currentBooking.bookingId === bookingId) {
        setCurrentBooking((prev) => prev ? { ...prev, bookingStatus: "CANCELLED" } : null);
      }
      return data;
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Failed to cancel booking";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentBooking]);

  const updateBooking = useCallback(async (bookingId: number, bookingReq: BookingRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.updateBooking(bookingId, bookingReq);
      setCurrentBooking(data);
      return data;
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Failed to update booking";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookingHistory = useCallback(async (customerId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.fetchBookingHistory(customerId);
      setBookingHistory(data || []);
      return data || [];
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Failed to fetch booking history";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const checkVerificationStatus = useCallback(async (customerId: number) => {
    setLoading(true);
    setError(null);
    try {
      const isVerified = await BookingService.checkVerificationStatus(customerId);
      setVerificationStatus(isVerified);
      return isVerified;
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Failed to check verification status";
      setError(msg);
      setVerificationStatus(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmBooking = useCallback(async (bookingId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.confirmBooking(bookingId);
      setCurrentBooking(data);
      if (data?.qrCode) {
        setQrCode(data.qrCode);
      }
      return data;
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Failed to confirm booking";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBooking = useCallback(async (bookingId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.getBookingById(bookingId);
      setCurrentBooking(data);
      if (data?.qrCode) {
        setQrCode(data.qrCode);
      }
      return data;
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Failed to get booking details";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getQRCode = useCallback(async (bookingId: number) => {
    setLoading(true);
    setError(null);
    try {
      const code = await BookingService.getBookingQRCode(bookingId);
      setQrCode(code);
      return code;
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Failed to get QR code";
      setError(msg);
      return "";
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <BookingContext.Provider
      value={{
        currentBooking,
        bookingHistory,
        selectedBike,
        loading,
        error,
        verificationStatus,
        qrCode,
        setCurrentBooking,
        setSelectedBike,
        createBooking,
        cancelBooking,
        updateBooking,
        fetchBookingHistory,
        checkVerificationStatus,
        confirmBooking,
        getBooking,
        getQRCode,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
