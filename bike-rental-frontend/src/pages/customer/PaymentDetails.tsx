import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Receipt,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  ShieldCheck,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2,
  ExternalLink,
  DollarSign,
  Percent,
  Hash,
  Info,
} from "lucide-react";
import paymentService from "@/services/paymentService";
import type { PaymentResponse } from "@/types/payment";

const PaymentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentId = Number(id);

  const fetchPaymentDetails = async () => {
    if (!paymentId || isNaN(paymentId)) {
      setError("Invalid payment ID parameter.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getPaymentById(paymentId);
      setPayment(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Unable to fetch transaction details.";
      setError(typeof msg === "string" ? msg : "Unable to fetch transaction details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Payment Successful
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            <XCircle className="h-4 w-4" />
            Payment Failed
          </span>
        );
      case "PROCESSING":
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <RotateCw className="h-4 w-4 animate-spin" />
            Processing
          </span>
        );
      case "READY_FOR_PAYMENT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Clock className="h-4 w-4" />
            Ready for Payment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
            {status || "Unknown"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          Loading transaction details...
        </p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">
            Transaction Unavailable
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "We couldn't retrieve the details for this transaction."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/customer/payments")}
              className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
            >
              Back to Payments
            </button>
            <button
              type="button"
              onClick={fetchPaymentDetails}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = payment.paymentStatus === "SUCCESS";
  const isFailed = payment.paymentStatus === "FAILED";
  const isReady = payment.paymentStatus === "READY_FOR_PAYMENT";

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/customer/payments")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payment History
        </button>

        {isSuccess && (
          <button
            type="button"
            onClick={() => navigate(`/customer/payments/${payment.paymentId}/invoice`)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 transition cursor-pointer shadow-xs"
          >
            <FileText className="h-4 w-4" />
            View Invoice
          </button>
        )}
      </div>

      {/* Main Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                Transaction Details
              </h1>
              {getStatusBadge(payment.paymentStatus)}
            </div>
            <p className="text-sm text-muted-foreground">
              Payment ID: <span className="font-bold text-foreground">#PAY-{payment.paymentId}</span> • 
              Booking ID: <button
                type="button"
                onClick={() => navigate(`/customer/booking/${payment.bookingId}`)}
                className="font-bold text-primary hover:underline ml-1"
              >
                #BK-{payment.bookingId}
              </button>
            </p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Amount
            </div>
            <div className="text-3xl font-black text-foreground">
              ₹{Number(payment.finalAmount || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Authoritative Billing Breakdown (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Authoritative Billing Breakdown
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Itemized calculations calculated directly by the backend
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              {/* Base Rental Amount */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground">Base Rental Charge</span>
                  <p className="text-xs text-muted-foreground">Standard duration rental rate</p>
                </div>
                <span className="font-bold text-foreground">
                  ₹{Number(payment.baseRentalAmount || 0).toFixed(2)}
                </span>
              </div>

              {/* Late Charge */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground">Late Duration Fee</span>
                  <p className="text-xs text-muted-foreground">
                    {Number(payment.lateCharge) > 0
                      ? "Applied beyond scheduled return time"
                      : "Returned on schedule (No late fee)"}
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    Number(payment.lateCharge) > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                  }`}
                >
                  ₹{Number(payment.lateCharge || 0).toFixed(2)}
                </span>
              </div>

              {/* Eligible Transaction Amount */}
              <div className="flex items-center justify-between border-t border-dashed border-border pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Eligible Subtotal
                </span>
                <span className="font-bold text-foreground">
                  ₹{Number(payment.eligibleTransactionAmount || 0).toFixed(2)}
                </span>
              </div>

              {/* Platform Fee */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">Platform Convenience Fee</span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                      {Number(payment.platformFeePercent || 0)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Service, maintenance & support tier</p>
                </div>
                <span className="font-bold text-foreground">
                  ₹{Number(payment.platformFeeAmount || 0).toFixed(2)}
                </span>
              </div>

              {/* Tax if supported */}
              {payment.taxAmount !== undefined && payment.taxAmount !== null && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">Taxes & GST</span>
                    <p className="text-xs text-muted-foreground">Applicable government taxes</p>
                  </div>
                  <span className="font-bold text-foreground">
                    ₹{Number(payment.taxAmount || 0).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex items-center justify-between rounded-xl bg-primary/5 p-4 border border-primary/15">
                <div>
                  <span className="text-sm font-black text-foreground">Final Payable Amount</span>
                  <p className="text-xs text-muted-foreground">Total verified charge</p>
                </div>
                <div className="text-xl font-black text-primary">
                  ₹{Number(payment.finalAmount || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Security & Verification Box */}
          <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
              <span className="font-bold text-foreground">Backend-Verified Transaction</span>
              <p>
                All billing calculations, platform fee thresholds, and payment gateway signatures
                are authoritatively computed and enforced by the server.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction & Gateway Metadata (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="border-b border-border pb-3 text-base font-bold text-foreground">
              Payment & Gateway Metadata
            </h2>

            <div className="mt-4 space-y-4">
              {/* Payment Status */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Status</span>
                <div className="mt-1">{getStatusBadge(payment.paymentStatus)}</div>
              </div>

              {/* Payment Method */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Payment Method</span>
                <div className="mt-1 flex items-center gap-2 font-bold text-foreground uppercase">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  {payment.paymentMethod || "Razorpay Online"}
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Gateway Transaction ID</span>
                <div className="mt-1 font-mono text-xs font-bold text-foreground break-all">
                  {payment.transactionId || payment.razorpayPaymentId || "—"}
                </div>
              </div>

              {/* Razorpay Order ID */}
              {payment.razorpayOrderId && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Razorpay Order ID</span>
                  <div className="mt-1 font-mono text-xs text-muted-foreground break-all">
                    {payment.razorpayOrderId}
                  </div>
                </div>
              )}

              {/* Paid Timestamp */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Paid Date & Time</span>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(payment.paidAt || payment.createdAt)}
                </div>
              </div>

              {/* Invoice Number */}
              {payment.invoiceNumber && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Invoice Reference</span>
                  <div className="mt-1 font-mono text-xs font-bold text-primary">
                    {payment.invoiceNumber}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Available Actions
            </h3>

            {isSuccess && (
              <button
                type="button"
                onClick={() => navigate(`/customer/payments/${payment.paymentId}/invoice`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 transition cursor-pointer shadow-xs"
              >
                <FileText className="h-4 w-4" />
                View & Print Official Invoice
              </button>
            )}

            {isFailed && (
              <button
                type="button"
                onClick={() => navigate(`/customer/payment/${payment.bookingId}`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 transition cursor-pointer"
              >
                <RotateCw className="h-4 w-4" />
                Retry Payment Checkout
              </button>
            )}

            {isReady && (
              <button
                type="button"
                onClick={() => navigate(`/customer/payment/${payment.bookingId}`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                Proceed to Checkout
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/customer/booking/${payment.bookingId}`)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Associated Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
