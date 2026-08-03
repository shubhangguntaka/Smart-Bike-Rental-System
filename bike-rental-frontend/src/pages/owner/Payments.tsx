import React from "react";
import { CreditCard, DollarSign, TrendingUp, ArrowDownRight } from "lucide-react";

export default function OwnerPayments() {
  const payouts = [
    { id: "PO-3301", date: "2026-08-01", amount: 1560, status: "Transferred", bank: "HDFC Bank (**** 4892)" },
    { id: "PO-3210", date: "2026-07-25", amount: 2800, status: "Transferred", bank: "HDFC Bank (**** 4892)" },
  ];

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Payments & Earnings</h2>
        <p className="text-xs text-muted-foreground mt-1">Overview of bike rental revenue payouts and transaction history.</p>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Total Earnings</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">₹4,360</p>
          <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +18.4% from last month
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Pending Payout</span>
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">₹960</p>
          <span className="text-[10px] text-muted-foreground">Scheduled for Aug 5</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Platform Commission</span>
            <ArrowDownRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">10%</p>
          <span className="text-[10px] text-muted-foreground">Standard owner rate</span>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold">Payout Transactions Log</h3>

        <div className="space-y-3">
          {payouts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50 text-xs"
            >
              <div className="space-y-1">
                <p className="font-bold text-foreground font-mono">{p.id}</p>
                <p className="text-muted-foreground">{p.bank} • {p.date}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-foreground text-sm">₹{p.amount}</p>
                <span className="text-[10px] font-bold text-green-500 uppercase">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
