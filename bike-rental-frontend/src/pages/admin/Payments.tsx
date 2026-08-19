import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Filter,
  RotateCcw,
  Search,
  XCircle,
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
}

const SummaryCard = ({
  title,
  count,
  active,
  onClick,
  icon,
  badgeClass,
}: SummaryCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between space-y-2 ${
      active
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border bg-card hover:bg-muted/40"
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {title}
      </span>
      {icon}
    </div>
    <div className="flex items-baseline justify-between">
      <span className="text-2xl font-extrabold text-foreground">{count}</span>
      {badgeClass && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${badgeClass}`}>
          {title}
        </span>
      )}
    </div>
  </button>
);

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and tabs state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailPayment, setDetailPayment] = useState<PaymentAdmin | null>(null);

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
        error?.response?.data?.message || "Unable to load payments."
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
      (p) => p.status?.toUpperCase() === "SUCCESS" || p.status?.toUpperCase() === "COMPLETED" || p.status?.toUpperCase() === "PAID"
    ).length;
    const pending = payments.filter((p) => p.status?.toUpperCase() === "PENDING").length;
    const failed = payments.filter((p) => p.status?.toUpperCase() === "FAILED").length;
    const totalRevenue = payments
      .filter((p) => p.status?.toUpperCase() === "SUCCESS" || p.status?.toUpperCase() === "COMPLETED" || p.status?.toUpperCase() === "PAID")
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);

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
      const isSuccess = status === "SUCCESS" || status === "COMPLETED" || status === "PAID";

      // Tab filter
      if (activeTab === "SUCCESS" && !isSuccess) return false;
      if (activeTab === "PENDING" && status !== "PENDING") return false;
      if (activeTab === "FAILED" && status !== "FAILED") return false;

      // Dropdown Status filter
      if (statusFilter === "SUCCESS" && !isSuccess) return false;
      if (statusFilter === "PENDING" && status !== "PENDING") return false;
      if (statusFilter === "FAILED" && status !== "FAILED") return false;

      if (query) {
        const searchable = [
          String(payment.paymentId),
          String(payment.bookingId),
          payment.status,
          payment.paymentDate,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [payments, search, activeTab, statusFilter]);

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
    <div className="space-y-6 text-foreground min-h-screen pb-12">
      {/* Title & Header */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Member 3 — Financial Audit & Revenue Operations
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            Payment Transaction Ledger
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Review payment records, financial settlement transactions, and billing audit logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadPayments(true)}
          disabled={refreshing || loading}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <SummaryCard
          title="Total Payments"
          count={counts.total}
          active={activeTab === "ALL"}
          onClick={() => handleTabChange("ALL")}
          icon={<CreditCard className="h-4 w-4 text-primary" />}
        />
        <SummaryCard
          title="Success / Paid"
          count={counts.success}
          active={activeTab === "SUCCESS"}
          onClick={() => handleTabChange("SUCCESS")}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          badgeClass="bg-emerald-500/10 text-emerald-500"
        />
        <SummaryCard
          title="Pending Settlements"
          count={counts.pending}
          active={activeTab === "PENDING"}
          onClick={() => handleTabChange("PENDING")}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          badgeClass="bg-amber-500/10 text-amber-500"
        />
        <SummaryCard
          title="Failed Payments"
          count={counts.failed}
          active={activeTab === "FAILED"}
          onClick={() => handleTabChange("FAILED")}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          badgeClass="bg-destructive/10 text-destructive"
        />
        <SummaryCard
          title="Total Gross Settled"
          count={`₹${Number(counts.totalRevenue).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          active={false}
          onClick={() => {}}
          icon={<CreditCard className="h-4 w-4 text-purple-500" />}
          badgeClass="bg-purple-500/10 text-purple-500"
        />
      </div>

      {/* Navigation Tabs & Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {[
            { id: "ALL", label: `All Payments (${counts.total})` },
            { id: "SUCCESS", label: `Success (${counts.success})` },
            { id: "PENDING", label: `Pending (${counts.pending})` },
            { id: "FAILED", label: `Failed (${counts.failed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
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
              placeholder="Search payment ID, booking ID, status..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="SUCCESS">Success / Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
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
          subtitle={`Linked to Booking #${detailPayment.bookingId}`}
          badges={
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                detailPayment.status?.toUpperCase() === "SUCCESS" || detailPayment.status?.toUpperCase() === "COMPLETED" || detailPayment.status?.toUpperCase() === "PAID"
                  ? "bg-green-500/10 text-green-500"
                  : detailPayment.status?.toUpperCase() === "PENDING"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {detailPayment.status || "UNKNOWN"}
            </span>
          }
          items={[
            { label: "Payment ID", value: `#${detailPayment.paymentId}` },
            { label: "Booking ID", value: `#${detailPayment.bookingId}` },
            {
              label: "Transaction Timestamp",
              value: detailPayment.paymentDate ? new Date(detailPayment.paymentDate).toLocaleString("en-IN") : "—",
            },
            {
              label: "Payment Status",
              value: (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    detailPayment.status?.toUpperCase() === "SUCCESS" || detailPayment.status?.toUpperCase() === "COMPLETED" || detailPayment.status?.toUpperCase() === "PAID"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {detailPayment.status || "UNKNOWN"}
                </span>
              ),
            },
            {
              label: "Amount Transacted",
              value: `₹${Number(detailPayment.amount || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            },
          ]}
          onClose={() => setDetailPayment(null)}
        />
      )}
    </div>
  );
}