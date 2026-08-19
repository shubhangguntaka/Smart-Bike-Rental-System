import React from "react";
import { CreditCard } from "lucide-react";

import type { PaymentAdmin } from "@/types/admin";

interface PaymentTableProps {
  payments: PaymentAdmin[];
  loading?: boolean;
}

export default function PaymentTable({
  payments,
  loading = false,
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
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr
                  key={payment.paymentId}
                  className="border-b border-border last:border-0 hover:bg-muted/10"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="font-bold">
                        #{payment.paymentId}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-muted-foreground">
                    #{payment.bookingId}
                  </td>

                  <td className="p-4 text-muted-foreground">
                    {payment.paymentDate
                      ? new Date(
                          payment.paymentDate
                        ).toLocaleString("en-IN")
                      : "—"}
                  </td>

                  <td className="p-4">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      {payment.status || "UNKNOWN"}
                    </span>
                  </td>

                  <td className="p-4 text-right font-bold">
                    ₹
                    {Number(payment.amount || 0).toLocaleString(
                      "en-IN"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
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