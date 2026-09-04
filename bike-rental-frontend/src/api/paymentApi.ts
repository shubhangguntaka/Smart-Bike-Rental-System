import axios from "./axios";
import type {
  InvoiceDTO,
  PaymentRequest,
  PaymentResponse,
} from "@/types/payment";

const BASE_URL = "/payments";

export const preparePayment = async (
  bookingId: number
): Promise<PaymentResponse> => {
  const response = await axios.post(
    `${BASE_URL}/prepare/${bookingId}`
  );

  return response.data;
};

export const processPayment = async (
  request: PaymentRequest
): Promise<PaymentResponse> => {
  const response = await axios.post(
    `${BASE_URL}/process`,
    request
  );

  return response.data;
};

export const getPaymentById = async (
  paymentId: number
): Promise<PaymentResponse> => {
  const response = await axios.get(
    `${BASE_URL}/${paymentId}`
  );

  return response.data;
};

export const getPaymentByBookingId = async (
  bookingId: number
): Promise<PaymentResponse> => {
  const response = await axios.get(
    `${BASE_URL}/booking/${bookingId}`
  );

  return response.data;
};

export const getPaymentHistory = async (): Promise<
  PaymentResponse[]
> => {
  const response = await axios.get(
    `${BASE_URL}/history`
  );

  return response.data;
};

export const retryPayment = async (
  paymentId: number
): Promise<PaymentResponse> => {
  const response = await axios.post(
    `${BASE_URL}/${paymentId}/retry`
  );

  return response.data;
};

export const getInvoice = async (
  paymentId: number
): Promise<InvoiceDTO> => {
  const response = await axios.get(
    `${BASE_URL}/${paymentId}/invoice`
  );

  return response.data;
};