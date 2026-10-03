export interface InvoiceDTO {
  invoiceId?: number;
  invoiceNumber?: string;
  paymentId?: number;
  bookingId?: number;
  customerName?: string;
  customerEmail?: string;
  bikeName?: string;
  registrationNumber?: string;
  rentalStart?: string;
  scheduledReturn?: string;
  actualReturn?: string;
  baseAmount?: number;
  lateFee?: number;
  platformFee?: number;
  tax?: number;
  totalAmount?: number;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface PaymentResponse {
  paymentId?: number;
  id?: number;
  bookingId: number;
  customerId?: number;
  baseAmount?: number;
  lateFee?: number;
  platformFee?: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  createdAt?: string;
}
