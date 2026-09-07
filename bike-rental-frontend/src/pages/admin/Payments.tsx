import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  CreditCard,
  Filter,
  RotateCcw,
  Search,
  XCircle,
  FileText,
  DollarSign,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

import { Pagination } from "@/components/common/Pagination";
import PaymentTable from "@/components/admin/PaymentTable";
import AdminDetailModal from "@/components/admin/AdminDetailModal";

import adminService from "@/services/adminService";
import type { PaymentAdmin } from "@/types/admin";

const PAGE_SIZE = 8;

interface SummaryCardProps {
  title: string;
  count: number | string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  badgeClass?: string;
  subtitle?: string;
}

const SummaryCard = ({
  title,
  count,
  active,
  onClick,
  icon,
  badgeClass,
  subtitle,
}: SummaryCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer flex flex-col justify-between space-y-2 ${
      active
        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
        : "border-border/80 bg-card hover:bg-muted/40 hover:border-border"
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        {title}
      </span>
      <div className="p-2 rounded-xl bg-background border border-border/70 shadow-2xs">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xl sm:text-2xl font-black text-foreground">{count}</span>
      {badgeClass && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${badgeClass}`}>
          {title}
        </span>
      )}
    </div>
    {subtitle && (
      <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
        {subtitle}
      </p>
    )}
  </button>
);

export default function AdminPayments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState<PaymentAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and tabs state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailPayment, setDetailPayment] = useState<PaymentAdmin | null>(null);

  // Sync URL search params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const qParam = searchParams.get("q");

    if (statusParam) {
      const upper = statusParam.toUpperCase();
      setStatusFilter(upper);
      setActiveTab(upper);
    }
    if (qParam) setSearch(qParam);
  }, [searchParams]);

  const loadPayments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await adminService.getPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to load admin payments:", error);
      setPayments([]);
      toast.error(
        error?.response?.data?.message || "Unable to load payments from server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  // Compute counts
  const counts = useMemo(() => {
    const total = payments.length;
    const success = payments.filter(
      (p) =>
        p.status?.toUpperCase() === "SUCCESS" ||
        p.status?.toUpperCase() === "COMPLETED" ||
        p.status?.toUpperCase() === "PAID"
    ).length;
    const pending = payments.filter(
      (p) =>
        p.status?.toUpperCase() === "PENDING" ||
        p.status?.toUpperCase() === "READY_FOR_PAYMENT"
    ).length;
    const failed = payments.filter((p) => p.status?.toUpperCase() === "FAILED").length;
    const totalRevenue = payments
      .filter(
        (p) =>
          p.status?.toUpperCase() === "SUCCESS" ||
          p.status?.toUpperCase() === "COMPLETED" ||
          p.status?.toUpperCase() === "PAID"
      )
      .reduce((acc, p) => acc + Number(p.amount || p.finalAmount || 0), 0);

    return { total, success, pending, failed, totalRevenue };
  }, [payments]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);

    if (tabId !== "ALL") {
      setStatusFilter(tabId);
    } else {
      setStatusFilter("ALL");
    }
  };

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const status = payment.status?.toUpperCase() ?? "UNKNOWN";
      const isSuccess =
        status === "SUCCESS" || status === "COMPLETED" || status === "PAID";
      const isPending =
        status === "PENDING" || status === "READY_FOR_PAYMENT";
      const isFailed = status === "FAILED";

      // Tab filter
      if (activeTab === "SUCCESS" && !isSuccess) return false;
      if (activeTab === "PENDING" && !isPending) return false;
      if (activeTab === "FAILED" && !isFailed) return false;

      // Dropdown Status filter
      if (statusFilter === "SUCCESS" && !isSuccess) return false;
      if (statusFilter === "PENDING" && !isPending) return false;
      if (statusFilter === "FAILED" && !isFailed) return false;

      if (query) {
        const searchable = [
          String(payment.paymentId),
          String(payment.bookingId),
          payment.customerId ? `customer ${payment.customerId}` : "",
          payment.transactionId,
          payment.razorpayPaymentId,
          payment.razorpayOrderId,
          payment.invoiceNumber,
          payment.paymentMethod,
          payment.status,
          payment.paymentDate,
          payment.paidAt,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.paidAt || a.paymentDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.paidAt || b.paymentDate || b.createdAt || 0).getTime();
      const amountA = Number(a.amount || a.finalAmount || 0);
      const amountB = Number(b.amount || b.finalAmount || 0);

      if (sortBy === "NEWEST") {
        if (dateA && dateB && dateA !== dateB) {
          return dateB - dateA;
        }
        return Number(b.paymentId || 0) - Number(a.paymentId || 0);
      }
      if (sortBy === "OLDEST") {
        if (dateA && dateB && dateA !== dateB) {
          return dateA - dateB;
        }
        return Number(a.paymentId || 0) - Number(b.paymentId || 0);
      }
      if (sortBy === "AMOUNT_HIGH") {
        return amountB - amountA;
      }
      if (sortBy === "AMOUNT_LOW") {
        return amountA - amountB;
      }
      return 0;
    });
  }, [payments, search, activeTab, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAGE_SIZE)
  );

  const paginatedPayments = filteredPayments.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6 text-foreground min-h-screen pb-16 max-w-7xl mx-auto font-sans">
      {/* Title & Header */}
      <div className="bg-card border border-border/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Financial Ledger & Settlement Operations
          </span>
          <h1 className="text-2xl font-serif font-black text-foreground mt-0.5 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Payment Transaction Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review live transaction records, gateway payment receipts, platform commission splits, and settlement logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadPayments(true)}
          disabled={refreshing || loading}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground transition-all duration-150 cursor-pointer flex items-center gap-2 disabled:opacity-60 shadow-2xs active:scale-95"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Ledger"}</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <SummaryCard
          title="Total Transactions"
          count={counts.total}
          active={activeTab === "ALL"}
          onClick={() => handleTabChange("ALL")}
          icon={<Layers className="h-4 w-4 text-primary" />}
          subtitle="All recorded attempts"
        />
        <SummaryCard
          title="Settled / Paid"
          count={counts.success}
          active={activeTab === "SUCCESS"}
          onClick={() => handleTabChange("SUCCESS")}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          badgeClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          subtitle="Successfully captured"
        />
        <SummaryCard
          title="Pending / Ready"
          count={counts.pending}
          active={activeTab === "PENDING"}
          onClick={() => handleTabChange("PENDING")}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          badgeClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          subtitle="Awaiting authorization"
        />
        <SummaryCard
          title="Failed / Voided"
          count={counts.failed}
          active={activeTab === "FAILED"}
          onClick={() => handleTabChange("FAILED")}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          badgeClass="bg-destructive/10 text-destructive"
          subtitle="Unsuccessful attempts"
        />
        <SummaryCard
          title="Total Net Captured"
          count={`₹${Number(counts.totalRevenue).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`}
          active={false}
          onClick={() => {}}
          icon={<DollarSign className="h-4 w-4 text-purple-500" />}
          badgeClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          subtitle="Completed gross volume"
        />
      </div>

      {/* Navigation Tabs & Filter Bar */}
      <div className="bg-card border border-border/80 p-4 rounded-2xl space-y-4 shadow-xs">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
          {[
            { id: "ALL", label: `All Transactions (${counts.total})` },
            { id: "SUCCESS", label: `Settled / Paid (${counts.success})` },
            { id: "PENDING", label: `Pending (${counts.pending})` },
            { id: "FAILED", label: `Failed (${counts.failed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search Payment ID, Booking #, Method, Ref..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-background border border-border/80 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <Filter className="h-3.5 w-3.5" />
              <span>Status:</span>
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-background border border-border/80 focus:outline-hidden text-foreground cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Settled / Success</option>
              <option value="PENDING">Pending / Ready</option>
              <option value="FAILED">Failed</option>
            </select>

            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold ml-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-background border border-border/80 focus:outline-hidden text-foreground cursor-pointer font-medium"
            >
              <option value="NEWEST">Newest Transactions</option>
              <option value="OLDEST">Oldest Transactions</option>
              <option value="AMOUNT_HIGH">Highest Amount</option>
              <option value="AMOUNT_LOW">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Table */}
      <PaymentTable
        payments={paginatedPayments}
        loading={loading}
        onViewDetails={setDetailPayment}
      />

      {filteredPayments.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      {/* Payment Details Modal */}
      {detailPayment && (
        <AdminDetailModal
          isOpen={!!detailPayment}
          title={`Payment Receipt #${detailPayment.paymentId}`}
          subtitle={`Booking Reference #${detailPayment.bookingId}`}
          badges={
            <span
              className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                detailPayment.status?.toUpperCase() === "SUCCESS" ||
                detailPayment.status?.toUpperCase() === "COMPLETED" ||
                detailPayment.status?.toUpperCase() === "PAID"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : detailPayment.status?.toUpperCase() === "PENDING" ||
                    detailPayment.status?.toUpperCase() === "READY_FOR_PAYMENT"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {detailPayment.status || "UNKNOWN"}
            </span>
          }
          items={[
            { label: "Payment Record ID", value: `#${detailPayment.paymentId}` },
            { label: "Linked Booking ID", value: `#${detailPayment.bookingId}` },
            {
              label: "Customer Account",
              value: detailPayment.customerId ? `Customer #${detailPayment.customerId}` : "Direct Booking",
            },
            {
              label: "Transaction Timestamp",
              value: detailPayment.paidAt || detailPayment.paymentDate || detailPayment.createdAt
                ? new Date(
                    (detailPayment.paidAt || detailPayment.paymentDate || detailPayment.createdAt) as string
                  ).toLocaleString("en-IN")
                : "—",
            },
            {
              label: "Payment Gateway / Mode",
              value: detailPayment.paymentMethod || "Razorpay Online Gateway",
            },
            {
              label: "Razorpay / Bank Transaction ID",
              value: detailPayment.transactionId || detailPayment.razorpayPaymentId || "—",
            },
            {
              label: "Invoice Number",
              value: detailPayment.invoiceNumber || `INV-${detailPayment.paymentId}-${detailPayment.bookingId}`,
            },
            {
              label: "Base Ride Fare",
              value: detailPayment.baseRentalAmount
                ? `₹${Number(detailPayment.baseRentalAmount).toFixed(2)}`
                : "—",
            },
            {
              label: "Late Penalty Charges",
              value: detailPayment.lateCharge
                ? `₹${Number(detailPayment.lateCharge).toFixed(2)}`
                : "₹0.00",
            },
            {
              label: "Taxes & Platform Fees",
              value: detailPayment.taxAmount
                ? `₹${Number(detailPayment.taxAmount).toFixed(2)}`
                : "Included",
            },
            {
              label: "Total Captured Amount",
              value: (
                <span className="font-black text-sm text-foreground">
                  ₹{Number(detailPayment.amount || detailPayment.finalAmount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              ),
            },
          ]}
          onClose={() => setDetailPayment(null)}
        />
      )}
    </div>
  );
}