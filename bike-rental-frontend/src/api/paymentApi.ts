import axios from "./axios";

const BASE_URL = "/api/payments";

export interface PaymentRequest {
  bookingId: number;
  amount: number;
  status: "SUCCESS" | "FAILED";
}

export const processPayment = (paymentReq: PaymentRequest) =>
  axios.post(`${BASE_URL}/process`, paymentReq);
