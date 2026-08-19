import React from "react";
import { CreditCard, Eye } from "lucide-react";

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
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-xs text-muted-foreground">
          Loading payments...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20 font-semibold text-muted-foreground">
              <th className="p-4">Payment</th>
              <th className="p-4">Booking</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Amount</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => {
                const status = payment.status?.toUpperCase() || "UNKNOWN";

                return (
                  <tr
                    key={payment.paymentId}
                    className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-bold text-foreground">
                          #{payment.paymentId}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-muted-foreground font-mono">
                      #{payment.bookingId}
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleString("en-IN")
                        : "—"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          status === "SUCCESS" || status === "COMPLETED"
                            ? "bg-green-500/10 text-green-500"
                            : status === "PENDING"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {payment.status || "UNKNOWN"}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-foreground">
                      ₹{Number(payment.amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="p-4 text-right">
                      {onViewDetails && (
                        <button
                          type="button"
                          onClick={() => onViewDetails(payment)}
                          className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition cursor-pointer"
                          title="View payment receipt summary"
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
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  No payments matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}