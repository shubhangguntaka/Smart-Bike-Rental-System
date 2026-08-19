import api from "@/api/axios";

import type {
  BikeReportRow,
  BookingReportRow,
  PaymentReportRow,
  RevenueReportRow,
  ReportDateRange,
} from "../types/report";

const reportService = {
  async getBookings(
    dateRange: ReportDateRange = {}
  ): Promise<BookingReportRow[]> {
    const response = await api.get("/reports/bookings", {
      params: dateRange,
    });

    const data = response.data?.data ?? response.data;

    return Array.isArray(data) ? data : [];
  },

  async getRevenue(
    dateRange: ReportDateRange = {}
  ): Promise<RevenueReportRow[]> {
    const response = await api.get("/reports/revenue", {
      params: dateRange,
    });

    const data = response.data?.data ?? response.data;

    return Array.isArray(data) ? data : [];
  },

  async getBikes(
    dateRange: ReportDateRange = {}
  ): Promise<BikeReportRow[]> {
    const response = await api.get("/reports/bikes", {
      params: dateRange,
    });

    const data = response.data?.data ?? response.data;

    return Array.isArray(data) ? data : [];
  },

  async getPayments(
    dateRange: ReportDateRange = {}
  ): Promise<PaymentReportRow[]> {
    const response = await api.get("/reports/payments", {
      params: dateRange,
    });

    const data = response.data?.data ?? response.data;

    return Array.isArray(data) ? data : [];
  },
};

export default reportService;