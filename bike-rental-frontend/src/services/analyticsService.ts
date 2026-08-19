import api from "@/api/axios";

import type {
  AnalyticsDateRange,
  BookingAnalytics,
  BikeAnalytics,
  DashboardAnalytics,
  RevenueAnalytics,
  RideAnalytics,
  UserAnalytics,
} from "../types/analytics";

const analyticsService = {
  async getDashboard(): Promise<DashboardAnalytics> {
    const response = await api.get("/analytics/dashboard");

    return response.data?.data ?? response.data;
  },

  async getRevenue(
    dateRange: AnalyticsDateRange = {}
  ): Promise<RevenueAnalytics> {
    const response = await api.get("/analytics/revenue", {
      params: dateRange,
    });

    return response.data?.data ?? response.data;
  },

  async getBookings(
    dateRange: AnalyticsDateRange = {}
  ): Promise<BookingAnalytics> {
    const response = await api.get("/analytics/bookings", {
      params: dateRange,
    });

    return response.data?.data ?? response.data;
  },

  async getUsers(
    dateRange: AnalyticsDateRange = {}
  ): Promise<UserAnalytics> {
    const response = await api.get("/analytics/users", {
      params: dateRange,
    });

    return response.data?.data ?? response.data;
  },

  async getBikes(
    dateRange: AnalyticsDateRange = {}
  ): Promise<BikeAnalytics> {
    const response = await api.get("/analytics/bikes", {
      params: dateRange,
    });

    return response.data?.data ?? response.data;
  },

  async getRides(
    dateRange: AnalyticsDateRange = {}
  ): Promise<RideAnalytics> {
    const response = await api.get("/analytics/rides", {
      params: dateRange,
    });

    return response.data?.data ?? response.data;
  },
};

export default analyticsService;