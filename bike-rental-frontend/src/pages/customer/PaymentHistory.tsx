import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Eye,
  RotateCw,
  AlertCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  Receipt,
  Calendar,
  Layers,
} from "lucide-react";
import paymentService from "@/services/paymentService";
import type { PaymentResponse } from "@/types/payment";
import useAuth from "@/hooks/useAuth";

const PaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getPaymentHistory();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to load payment history.";
      setError(typeof msg === "string" ? msg : "Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filtered & sorted payments
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        // Status filter
        if (statusFilter !== "ALL" && p.paymentStatus !== statusFilter) {
          return false;
        }
        // Search filter
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase().trim();
          const pId = String(p.paymentId || "");
          const bId = String(p.bookingId || "");
          const tId = (p.transactionId || "").toLowerCase();
          const inv = (p.invoiceNumber || "").toLowerCase();
          const method = (p.paymentMethod || "").toLowerCase();
          return (
            pId.includes(q) ||
            bId.includes(q) ||
            tId.includes(q) ||
            inv.includes(q) ||
            method.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.paidAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.paidAt || b.createdAt || 0).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [payments, searchQuery, statusFilter, sortOrder]);

  // Summary Metrics
  const stats = useMemo(() => {
    const totalSpent = payments
      .filter((p) => p.paymentStatus === "SUCCESS")
      .reduce((sum, p) => sum + (Number(p.finalAmount) || 0), 0);

    const completedCount = payments.filter((p) => p.paymentStatus === "SUCCESS").length;
    const failedCount = payments.filter((p) => p.paymentStatus === "FAILED").length;
    const pendingCount = payments.filter(
      (p) => p.paymentStatus !== "SUCCESS" && p.paymentStatus !== "FAILED"
    ).length;

    return {
      totalSpent,
      completedCount,
      failedCount,
      pendingCount,
      totalCount: payments.length,
    };
  }, [payments]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Paid
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
            <XCircle className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      case "PROCESSING":
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <RotateCw className="h-3.5 w-3.5 animate-spin" />
            Processing
          </span>
        );
      case "READY_FOR_PAYMENT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Clock className="h-3.5 w-3.5" />
            Ready for Payment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Payment History
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Review your bike rental transactions, billing breakdowns, and download invoices.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Spent */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Spent
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-foreground">
            ₹{stats.totalSpent.toFixed(2)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Across {stats.completedCount} completed {stats.completedCount === 1 ? "trip" : "trips"}
          </p>
        </div>

        {/* Completed Transactions */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Completed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.completedCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Invoices available for download
          </p>
        </div>

        {/* Pending / In-progress */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pending / Action
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.pendingCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Awaiting checkout completion
          </p>
        </div>

        {/* Total Records */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Records
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-foreground">
            {stats.totalCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Lifetime payment events
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Payment ID, Booking ID, Transaction ID, Invoice #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Paid (Success)</option>
              <option value="READY_FOR_PAYMENT">Ready for Payment</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted cursor-pointer"
            title={`Sort by Date (${sortOrder === "desc" ? "Newest first" : "Oldest first"})`}
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start justify-between rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm font-medium text-foreground">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchPayments}
            className="rounded-lg bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive hover:bg-destructive/20 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Payments Content */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm font-semibold text-muted-foreground">
            Loading your payment history...
          </p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Receipt className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-foreground">
            {payments.length === 0 ? "No payment records found" : "No matching payments"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {payments.length === 0
              ? "When you complete bike rentals and payments, your transaction history and invoices will appear here."
              : "Try adjusting your search query or status filter to find what you're looking for."}
          </p>
          {payments.length === 0 ? (
            <button
              type="button"
              onClick={() => navigate("/customer/explore-bikes")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95 cursor-pointer shadow-xs"
            >
              Explore Bikes
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="mt-4 rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Transaction / ID</th>
                  <th className="px-6 py-4">Booking</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((p) => {
                  const isSuccess = p.paymentStatus === "SUCCESS";
                  const isFailed = p.paymentStatus === "FAILED";
                  const isReady = p.paymentStatus === "READY_FOR_PAYMENT";

                  return (
                    <tr
                      key={p.paymentId}
                      className="transition hover:bg-muted/30 group"
                    >
                      {/* Payment ID & Transaction */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">
                          #PAY-{p.paymentId}
                        </div>
                        {p.transactionId ? (
                          <div className="mt-0.5 max-w-[180px] truncate text-xs text-muted-foreground" title={p.transactionId}>
                            Txn: {p.transactionId}
                          </div>
                        ) : p.invoiceNumber ? (
                          <div className="mt-0.5 text-xs font-medium text-primary">
                            Inv: {p.invoiceNumber}
                          </div>
                        ) : null}
                      </td>

                      {/* Booking ID */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/customer/booking/${p.bookingId}`)}
                          className="font-bold text-primary hover:underline cursor-pointer"
                        >
                          #BK-{p.bookingId}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {formatDate(p.paidAt || p.createdAt)}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <div className="font-black text-foreground">
                          ₹{Number(p.finalAmount || 0).toFixed(2)}
                        </div>
                        {Number(p.lateCharge) > 0 && (
                          <div className="text-[11px] font-semibold text-rose-500">
                            +₹{Number(p.lateCharge).toFixed(2)} late fee
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(p.paymentStatus)}
                      </td>

                      {/* Method */}
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                        {p.paymentMethod ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs uppercase font-semibold text-foreground">
                            {p.paymentMethod}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/customer/payments/${p.paymentId}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-muted hover:border-primary/40 cursor-pointer shadow-2xs"
                            title="View Transaction Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            Details
                          </button>

                          {isSuccess && (
                            <button
                              type="button"
                              onClick={() => navigate(`/customer/payments/${p.paymentId}/invoice`)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20 active:scale-95 cursor-pointer"
                              title="View and Print Invoice"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Invoice
                            </button>
                          )}

                          {isFailed && (
                            <button
                              type="button"
                              onClick={() => navigate(`/customer/payment/${p.bookingId}`)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/20 active:scale-95 cursor-pointer"
                              title="Retry Payment"
                            >
                              <RotateCw className="h-3.5 w-3.5" />
                              Retry
                            </button>
                          )}

                          {isReady && (
                            <button
                              type="button"
                              onClick={() => navigate(`/customer/payment/${p.bookingId}`)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95 cursor-pointer"
                              title="Pay Now"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="divide-y divide-border md:hidden">
            {filteredPayments.map((p) => {
              const isSuccess = p.paymentStatus === "SUCCESS";
              const isFailed = p.paymentStatus === "FAILED";
              const isReady = p.paymentStatus === "READY_FOR_PAYMENT";

              return (
                <div key={p.paymentId} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">#PAY-{p.paymentId}</span>
                        {getStatusBadge(p.paymentStatus)}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Booking #BK-{p.bookingId} • {formatDate(p.paidAt || p.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-foreground">
                        ₹{Number(p.finalAmount || 0).toFixed(2)}
                      </div>
                      {p.paymentMethod && (
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                          {p.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>

                  {p.invoiceNumber && (
                    <div className="rounded-lg bg-primary/5 px-3 py-1.5 text-xs text-primary font-medium flex items-center justify-between">
                      <span>Invoice: {p.invoiceNumber}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/customer/payments/${p.paymentId}`)}
                      className="flex-1 rounded-xl border border-border py-2 text-center text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
                    >
                      Details
                    </button>

                    {isSuccess && (
                      <button
                        type="button"
                        onClick={() => navigate(`/customer/payments/${p.paymentId}/invoice`)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Invoice
                      </button>
                    )}

                    {isFailed && (
                      <button
                        type="button"
                        onClick={() => navigate(`/customer/payment/${p.bookingId}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-rose-500/10 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-500/20 cursor-pointer"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        Retry
                      </button>
                    )}

                    {isReady && (
                      <button
                        type="button"
                        onClick={() => navigate(`/customer/payment/${p.bookingId}`)}
                        className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground hover:opacity-90 transition cursor-pointer"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
