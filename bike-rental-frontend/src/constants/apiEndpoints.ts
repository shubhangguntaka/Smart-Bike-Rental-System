const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    VERIFY_OTP: "/auth/verify-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  GPS: {
    START_RIDE: "/rides/start",

    GET_RIDE: (rideId: number) =>
      `/rides/${rideId}`,

    GET_RIDE_BY_BOOKING: (bookingId: number) =>
      `/rides/booking/${bookingId}`,

    SAVE_LOCATION: (rideId: number) =>
      `/rides/${rideId}/location`,

    GET_LOCATIONS: (rideId: number) =>
      `/rides/${rideId}/location`,

    GET_HISTORY: (rideId: number) =>
      `/rides/${rideId}/history`,

    END_RIDE: (rideId: number) =>
      `/rides/${rideId}/end`,

    GET_DISTANCE: (rideId: number) =>
      `/rides/${rideId}/distance`,

    CUSTOMER_RIDES: "/rides/customer",
  },
};

export default API_ENDPOINTS;