import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bike,
  Building2,
  ShieldCheck,
  Calendar,
  CreditCard,
  Receipt,
  FileCheck,
} from "lucide-react";
import paymentService from "@/services/paymentService";
import type { InvoiceDTO } from "@/types/payment";
import useAuth from "@/hooks/useAuth";

const InvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invoice, setInvoice] = useState<InvoiceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentId = Number(id);

  const fetchInvoice = async () => {
    if (!paymentId || isNaN(paymentId)) {
      setError("Invalid payment ID parameter.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getInvoice(paymentId);
      setInvoice(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Invoice is not available for this payment.";
      setError(typeof msg === "string" ? msg : "Invoice is not available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          Generating invoice preview...
        </p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">
            Invoice Unavailable
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {error ||
              "Invoices are only generated and accessible for completed, successful payments. Unfinished or failed transactions do not have tax invoices."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/customer/payments")}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
            >
              Back to Payments
            </button>
            <button
              type="button"
              onClick={() => navigate(`/customer/payments/${paymentId}`)}
              className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition cursor-pointer"
            >
              View Transaction Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  const customerDisplayName =
    invoice.customerName ||
    (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "") ||
    `Customer #${invoice.customerId}`;

  const customerEmail = invoice.customerEmail || user?.email || "—";
  const customerPhone = invoice.customerPhone || user?.phoneNumber || "—";

  return (
    <div className="space-y-6 pb-12 print:p-0 print:m-0 print:space-y-0">
      {/* Print styles injected for optimal A4 print layout */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          aside, nav, header, footer, .no-print, [data-sidebar], .print-hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
          .invoice-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden in Print) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <button
          type="button"
          onClick={() => navigate(`/customer/payments/${invoice.paymentId}`)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transaction Details
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition cursor-pointer shadow-xs"
          >
            <Printer className="h-4 w-4 text-muted-foreground" />
            Print
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 transition cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4" />
            Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-4 sm:p-8 md:p-12 shadow-sm transition hover:shadow-md invoice-card">
        {/* Invoice Header */}
        <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-primary">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bike className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">
                Smart Bike Rental
              </span>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed space-y-0.5">
              <p className="font-semibold text-foreground">Smart Bike Rental Services Pvt. Ltd.</p>
              <p>Platform & Fleet Operations</p>
              <p>GSTIN: 36AABCS1429B1Z8</p>
              <p>support@smartbikerental.com</p>
            </div>
          </div>

          <div className="space-y-2 md:text-right">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              PAID & COMPLETED
            </div>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              Tax Invoice
            </h2>
            <div className="text-xs text-muted-foreground space-y-0.5 font-medium">
              <p>
                Invoice No: <span className="font-bold text-foreground">{invoice.invoiceNumber}</span>
              </p>
              <p>
                Invoice Date: <span className="font-bold text-foreground">{formatDate(invoice.paidAt || invoice.createdAt)}</span>
              </p>
              <p>
                Payment Ref: <span className="font-mono text-foreground">#PAY-{invoice.paymentId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Customer & Booking Details Grid */}
        <div className="grid grid-cols-1 gap-6 border-b border-border py-8 sm:grid-cols-2">
          {/* Bill To */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Billed To (Customer)
            </span>
            <div className="space-y-1 text-sm">
              <p className="font-black text-foreground text-base">
                {customerDisplayName}
              </p>
              <p className="text-xs text-muted-foreground">
                Email: <span className="font-medium text-foreground">{customerEmail}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Phone: <span className="font-medium text-foreground">{customerPhone}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Customer ID: <span className="font-medium text-foreground">#{invoice.customerId}</span>
              </p>
            </div>
          </div>

          {/* Trip / Rental Info */}
          <div className="space-y-2 sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Rental Reference
            </span>
            <div className="space-y-1 text-sm">
              <p className="font-black text-primary text-base">
                Booking #BK-{invoice.bookingId}
              </p>
              <p className="text-xs text-muted-foreground">
                Payment Method: <span className="font-semibold text-foreground uppercase">{invoice.paymentMethod || "Razorpay"}</span>
              </p>
              {invoice.transactionId && (
                <p className="text-xs text-muted-foreground">
                  Transaction ID: <span className="font-mono text-foreground">{invoice.transactionId}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Verification Status: <span className="font-semibold text-emerald-600">Signature Verified</span>
              </p>
            </div>
          </div>
        </div>

        {/* Itemized Billing Breakdown Table */}
        <div className="py-8 overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-3">Description</th>
                <th className="pb-3 text-center">Rate / Details</th>
                <th className="pb-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Base Rental */}
              <tr>
                <td className="py-4">
                  <div className="font-bold text-foreground">Base Bike Rental Fee</div>
                  <div className="text-xs text-muted-foreground">
                    Rental fee for reserved rental duration
                  </div>
                </td>
                <td className="py-4 text-center text-xs text-muted-foreground">Standard Rate</td>
                <td className="py-4 text-right font-bold text-foreground">
                  ₹{Number(invoice.baseRentalAmount || 0).toFixed(2)}
                </td>
              </tr>

              {/* Late Charge */}
              <tr>
                <td className="py-4">
                  <div className="font-bold text-foreground">Late Duration Charges</div>
                  <div className="text-xs text-muted-foreground">
                    {Number(invoice.lateCharge) > 0
                      ? "Additional fee applied for late return past schedule"
                      : "Returned on time within grace period"}
                  </div>
                </td>
                <td className="py-4 text-center text-xs text-muted-foreground">
                  {Number(invoice.lateCharge) > 0 ? "Excess Time Rate" : "₹0.00"}
                </td>
                <td
                  className={`py-4 text-right font-bold ${
                    Number(invoice.lateCharge) > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                  }`}
                >
                  ₹{Number(invoice.lateCharge || 0).toFixed(2)}
                </td>
              </tr>

              {/* Subtotal */}
              <tr className="bg-muted/20">
                <td className="py-3 font-semibold text-foreground">Eligible Subtotal</td>
                <td className="py-3 text-center text-xs text-muted-foreground">—</td>
                <td className="py-3 text-right font-bold text-foreground">
                  ₹{Number(invoice.eligibleTransactionAmount || 0).toFixed(2)}
                </td>
              </tr>

              {/* Platform Fee */}
              <tr>
                <td className="py-4">
                  <div className="font-bold text-foreground">Platform Convenience Fee</div>
                  <div className="text-xs text-muted-foreground">
                    Fleet maintenance, 24x7 support & secure platform fee
                  </div>
                </td>
                <td className="py-4 text-center text-xs font-semibold text-muted-foreground">
                  {Number(invoice.platformFeePercent || 0)}%
                </td>
                <td className="py-4 text-right font-bold text-foreground">
                  ₹{Number(invoice.platformFeeAmount || 0).toFixed(2)}
                </td>
              </tr>

              {/* Tax */}
              {invoice.taxAmount !== undefined && invoice.taxAmount !== null && (
                <tr>
                  <td className="py-4">
                    <div className="font-bold text-foreground">Goods & Services Tax (GST)</div>
                    <div className="text-xs text-muted-foreground">Applicable government tax</div>
                  </td>
                  <td className="py-4 text-center text-xs text-muted-foreground">Included</td>
                  <td className="py-4 text-right font-bold text-foreground">
                    ₹{Number(invoice.taxAmount || 0).toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Totals */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col items-end gap-2">
            <div className="flex w-full max-w-xs justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">
                ₹{Number(invoice.eligibleTransactionAmount || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex w-full max-w-xs justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="font-semibold text-foreground">
                +₹{Number(invoice.platformFeeAmount || 0).toFixed(2)}
              </span>
            </div>

            {invoice.taxAmount !== undefined && invoice.taxAmount !== null && Number(invoice.taxAmount) > 0 && (
              <div className="flex w-full max-w-xs justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-semibold text-foreground">
                  ₹{Number(invoice.taxAmount || 0).toFixed(2)}
                </span>
              </div>
            )}

            <div className="mt-2 flex w-full max-w-xs justify-between rounded-xl bg-primary/10 p-3.5 text-base font-black text-primary">
              <span>Total Paid</span>
              <span>₹{Number(invoice.finalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Confirmation & Notes Footer */}
        <div className="mt-12 rounded-2xl bg-muted/40 p-6 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <FileCheck className="h-4 w-4 text-primary" />
            Electronic Tax Invoice Notice
          </div>
          <p className="leading-relaxed">
            This is a computer-generated invoice and does not require a physical signature.
            Payment was verified and authorized via Razorpay Gateway. For billing queries,
            please reach out to support@smartbikerental.com quoting invoice number{" "}
            <span className="font-bold text-foreground">{invoice.invoiceNumber}</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
