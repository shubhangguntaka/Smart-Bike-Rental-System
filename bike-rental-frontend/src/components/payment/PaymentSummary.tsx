import React from "react";
import { ReceiptText } from "lucide-react";

import type { PaymentResponse } from "@/types/payment";

interface PaymentSummaryProps {
  payment: PaymentResponse;
}

const formatAmount = (amount: number | undefined | null) => {
  return Number(amount ?? 0).toFixed(2);
};

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  payment,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ReceiptText className="h-5 w-5 text-primary" />
        </div>

        <div>
          <h2 className="font-bold text-foreground">
            Payment Summary
          </h2>

          <p className="text-xs text-muted-foreground">
            Final amount calculated by the server
          </p>
        </div>
      </div>

      <div className="space-y-4">

        {/* Base Rental Amount */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Base rental amount
          </span>

          <span className="text-sm font-bold text-foreground">
            ₹{formatAmount(payment.baseRentalAmount)}
          </span>
        </div>

        {/* Late Charge */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Late return charge
          </span>

          <span className="text-sm font-bold text-foreground">
            ₹{formatAmount(payment.lateCharge)}
          </span>
        </div>

        {/* Eligible Transaction */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Eligible transaction amount
          </span>

          <span className="text-sm font-bold text-foreground">
            ₹{formatAmount(payment.eligibleTransactionAmount)}
          </span>
        </div>

        {/* Platform Fee */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Platform fee ({formatAmount(payment.platformFeePercent)}%)
          </span>

          <span className="text-sm font-bold text-foreground">
            ₹{formatAmount(payment.platformFeeAmount)}
          </span>
        </div>

        {/* Tax */}
        {Number(payment.taxAmount ?? 0) > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Tax
            </span>

            <span className="text-sm font-bold text-foreground">
              ₹{formatAmount(payment.taxAmount)}
            </span>
          </div>
        )}

        {/* Final Amount */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-bold text-foreground">
                Final payable amount
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Amount charged through Razorpay
              </p>
            </div>

            <span className="text-2xl font-black text-primary">
              ₹{formatAmount(payment.finalAmount)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentSummary;