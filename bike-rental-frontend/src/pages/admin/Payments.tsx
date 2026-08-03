import React, { useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { CreditCard, TrendingUp, DollarSign, Wallet } from "lucide-react";

const MOCK_REVENUE_LOGS = [
  { id: "TX-4011", date: "2026-08-02", user: "Rahul Sharma", bike: "SummitCrusher Trail XT", amount: 360, method: "UPI", status: "Successful" },
  { id: "TX-4010", date: "2026-08-01", user: "Amit Kumar", bike: "VoltPulse Electric S1", amount: 600, method: "Razorpay Secure", status: "Successful" },
  { id: "TX-4009", date: "2026-07-28", user: "Rahul Sharma", bike: "AeroRoad Elite Carbon", amount: 450, method: "UPI", status: "Successful" },
];

export default function AdminPayments() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_REVENUE_LOGS.filter((r) =>
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.user.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * 5, page * 5);

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Global Ledger Transactions</h2>
        <p className="text-xs text-muted-foreground mt-1">Review system billing records, commission earnings, and payouts history.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Overall Gross Revenue</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">₹28,450</p>
          <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +12.3% weekly hike
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Commission Earned (10%)</span>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">₹2,845</p>
          <span className="text-[10px] text-muted-foreground">Admin income pool</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Pending Owner Payouts</span>
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">₹960</p>
          <span className="text-[10px] text-muted-foreground">Automatic weekly payout cycle</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by transaction ID, customer name..."
          width="max-w-md w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Renter Customer</th>
                <th className="p-4">Bicycle Item</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 text-right">Paid Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-muted/10 last:border-0">
                    <td className="p-4 font-bold text-foreground font-mono">{tx.id}</td>
                    <td className="p-4 text-muted-foreground font-medium">{tx.user}</td>
                    <td className="p-4 text-muted-foreground font-medium">{tx.bike}</td>
                    <td className="p-4 text-muted-foreground font-medium">{tx.method}</td>
                    <td className="p-4 text-right font-black text-foreground">₹{tx.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No transactions registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > 5 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filtered.length / 5)}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}
    </div>
  );
}
