import api from "../api/axios";

const BASE_URL = "/owner";

export const ownerService = {

  getDashboard: () =>
    api.get(`${BASE_URL}/dashboard`),

  getProfile: () =>
    api.get(`${BASE_URL}/profile`),

  updateProfile: (data: any) =>
    api.put(`${BASE_URL}/profile`, data),

  getBookingRequests: () =>
    api.get(`${BASE_URL}/bookings`),

  approveBooking: (bookingId: number) =>
    api.post(`${BASE_URL}/approve/${bookingId}`),

  rejectBooking: (bookingId: number) =>
    api.post(`${BASE_URL}/reject/${bookingId}`),

  getOwnerEarnings: () =>
    api.get(`${BASE_URL}/earnings`),

  getVerificationStatus: () =>
    api.get(`${BASE_URL}/verification-status`)

};