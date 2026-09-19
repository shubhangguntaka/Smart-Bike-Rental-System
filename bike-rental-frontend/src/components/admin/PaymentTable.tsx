import React from "react";
import { CreditCard, Eye, Hash, Wallet, ArrowUpRight } from "lucide-react";

import type { PaymentAdmin } from "@/types/admin";

interface PaymentTableProps {
  payments: PaymentAdmin[];
  loading?: boolean;
  onViewDetails?: (payment: PaymentAdmin) => void;
}

export default function PaymentTable({
  payments,
  loading = false,
  onViewDetails,
}: PaymentTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          Loading payment ledger...
        </p>
      </div>
    );
  }

  const getStatusBadge = (rawStatus?: string) => {
    const status = rawStatus?.toUpperCase() || "UNKNOWN";
    if (status === "SUCCESS" || status === "COMPLETED" || status === "PAID") {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    }
    if (status === "PENDING" || status === "READY_FOR_PAYMENT") {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    }
    if (status === "REFUNDED") {
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    }
    return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[750px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border/80 bg-muted/25 font-semibold text-muted-foreground">
              <th className="p-4">Payment ID & Ref</th>
              <th className="p-4">Linked Booking</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Status</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4">Final Amount</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => {
                const status = payment.status?.toUpperCase() || "UNKNOWN";
                const dateStr = payment.paidAt || payment.paymentDate || payment.createdAt;

                return (
                  <tr
                    key={payment.paymentId}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/15 transition-colors"
                  >
                    {/* Payment ID & Transaction ID */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            #{payment.paymentId}
                          </p>
                          {payment.transactionId || payment.razorpayPaymentId ? (
                            <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[130px]">
                              {payment.transactionId || payment.razorpayPaymentId}
                            </p>
                          ) : payment.invoiceNumber ? (
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {payment.invoiceNumber}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Booking ID */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/60">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        {payment.bookingId}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="p-4 text-muted-foreground">
                      {payment.customerId ? (
                        <span className="font-medium text-foreground">
                          Customer #{payment.customerId}
                        </span>
                      ) : (
                        <span className="italic text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-muted-foreground">
                      {dateStr ? (
                        <div>
                          <p className="font-medium text-foreground">
                            {new Date(dateStr).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(dateStr).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ) : (
                        <span className="italic">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                          status
                        )}`}
                      >
                        {status === "READY_FOR_PAYMENT" ? "READY" : status}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                        <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                        {payment.paymentMethod || "ONLINE / GATEWAY"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <p className="font-black text-sm text-foreground">
                        ₹{Number(payment.amount || payment.finalAmount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      {payment.taxAmount != null && payment.taxAmount > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          Incl. ₹{payment.taxAmount} GST
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      {onViewDetails && (
                        <button
                          type="button"
                          onClick={() => onViewDetails(payment)}
                          className="rounded-xl border border-border/80 bg-background/80 p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer shadow-2xs hover:border-primary/40 active:scale-95 min-h-[34px] min-w-[34px] inline-flex items-center justify-center"
                          title="View complete transaction breakdown"
                          aria-label="View complete transaction breakdown"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="p-12 text-center text-muted-foreground"
                >
                  <CreditCard className="mx-auto mb-2 h-6 w-6 opacity-40" />
                  <p className="font-semibold text-xs text-foreground">No payments found</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    No transactions match the selected filter or query.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}