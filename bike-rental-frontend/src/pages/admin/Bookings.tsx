import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpDown,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Filter,
  Layers,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { Pagination } from "@/components/common/Pagination";
import BookingTable from "@/components/admin/BookingTable";
import AdminDetailModal from "@/components/admin/AdminDetailModal";

import adminService from "@/services/adminService";
import type { BookingAdmin } from "@/types/admin";

const PAGE_SIZE = 8;

interface SummaryCardProps {
  title: string;
  count: number;
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
    className={`p-3 sm:p-4 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between space-y-2 min-w-0 ${
      active
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border bg-card hover:bg-muted/40"
    }`}
  >
    <div className="flex items-center justify-between gap-1">
      <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
        {title}
      </span>
      <span className="shrink-0">{icon}</span>
    </div>
    <div className="flex items-baseline justify-between gap-1">
      <span className="text-xl sm:text-2xl font-extrabold text-foreground truncate">{count}</span>
      {badgeClass && (
        <span className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md truncate ${badgeClass}`}>
          {title}
        </span>
      )}
    </div>
  </button>
);

export default function AdminBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<BookingAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and tabs state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailBooking, setDetailBooking] = useState<BookingAdmin | null>(null);

  // Sync URL search params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const paymentStatusParam = searchParams.get("paymentStatus");
    const qParam = searchParams.get("q");

    if (statusParam) {
      setBookingStatusFilter(statusParam.toUpperCase());
      setActiveTab(statusParam.toUpperCase());
    }
    if (paymentStatusParam) setPaymentStatusFilter(paymentStatusParam.toUpperCase());
    if (qParam) setSearch(qParam);
  }, [searchParams]);

  const loadBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await adminService.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load admin bookings:", error);
      setBookings([]);
      toast.error("Unable to load bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  // Compute counts
  const counts = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter((b) => b.bookingStatus?.toUpperCase() === "ACTIVE" || b.bookingStatus?.toUpperCase() === "CONFIRMED").length;
    const pending = bookings.filter((b) => b.bookingStatus?.toUpperCase() === "PENDING").length;
    const completed = bookings.filter((b) => b.bookingStatus?.toUpperCase() === "COMPLETED").length;
    const cancelled = bookings.filter((b) => b.bookingStatus?.toUpperCase() === "CANCELLED").length;

    return { total, active, pending, completed, cancelled };
  }, [bookings]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);

    const nextParams = new URLSearchParams();
    if (search) nextParams.set("q", search);
    if (paymentStatusFilter !== "ALL") nextParams.set("paymentStatus", paymentStatusFilter);

    if (tabId !== "ALL") {
      setBookingStatusFilter(tabId);
      nextParams.set("status", tabId);
    } else {
      setBookingStatusFilter("ALL");
    }

    setSearchParams(nextParams, { replace: true });
  };

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const bStatus = booking.bookingStatus?.toUpperCase() ?? "UNKNOWN";
      const pStatus = booking.paymentStatus?.toUpperCase() ?? "UNKNOWN";

      // Tab filter
      if (activeTab === "ACTIVE" && bStatus !== "ACTIVE" && bStatus !== "CONFIRMED") return false;
      if (activeTab === "PENDING" && bStatus !== "PENDING") return false;
      if (activeTab === "COMPLETED" && bStatus !== "COMPLETED") return false;
      if (activeTab === "CANCELLED" && bStatus !== "CANCELLED") return false;

      // Dropdown Booking status filter
      if (bookingStatusFilter !== "ALL" && bStatus !== bookingStatusFilter) {
        return false;
      }

      // Dropdown Payment status filter
      if (paymentStatusFilter !== "ALL" && pStatus !== paymentStatusFilter) {
        return false;
      }

      if (query) {
        const searchable = [
          String(booking.bookingId),
          booking.bookingReference,
          booking.customerName,
          booking.ownerName,
          booking.bikeName,
          booking.registrationNumber,
          booking.bookingStatus,
          booking.paymentStatus,
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
      if (sortBy === "NEWEST") {
        const dateA = new Date(a.createdAt || a.startTime || 0).getTime();
        const dateB = new Date(b.createdAt || b.startTime || 0).getTime();
        if (dateA && dateB && dateA !== dateB) return dateB - dateA;
        return Number(b.bookingId || 0) - Number(a.bookingId || 0);
      }
      if (sortBy === "OLDEST") {
        const dateA = new Date(a.createdAt || a.startTime || 0).getTime();
        const dateB = new Date(b.createdAt || b.startTime || 0).getTime();
        if (dateA && dateB && dateA !== dateB) return dateA - dateB;
        return Number(a.bookingId || 0) - Number(b.bookingId || 0);
      }
      if (sortBy === "AMOUNT_HIGH") {
        return Number(b.totalAmount ?? b.rentalAmount ?? 0) - Number(a.totalAmount ?? a.rentalAmount ?? 0);
      }
      if (sortBy === "AMOUNT_LOW") {
        return Number(a.totalAmount ?? a.rentalAmount ?? 0) - Number(b.totalAmount ?? b.rentalAmount ?? 0);
      }
      return Number(b.bookingId || 0) - Number(a.bookingId || 0);
    });
  }, [bookings, search, activeTab, bookingStatusFilter, paymentStatusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const paginatedBookings = filteredBookings.slice(
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
            Member 3 — Booking Administration
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            Rental Booking Administration
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Audit customer rental reservations, itinerary schedules, payment settlements, and vehicle dispatch.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadBookings(true)}
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
          title="Total Bookings"
          count={counts.total}
          active={activeTab === "ALL"}
          onClick={() => handleTabChange("ALL")}
          icon={<CalendarCheck className="h-4 w-4 text-primary" />}
        />
        <SummaryCard
          title="Active Rentals"
          count={counts.active}
          active={activeTab === "ACTIVE"}
          onClick={() => handleTabChange("ACTIVE")}
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          badgeClass="bg-blue-500/10 text-blue-500"
        />
        <SummaryCard
          title="Pending Pickup"
          count={counts.pending}
          active={activeTab === "PENDING"}
          onClick={() => handleTabChange("PENDING")}
          icon={<Layers className="h-4 w-4 text-amber-500" />}
          badgeClass="bg-amber-500/10 text-amber-500"
        />
        <SummaryCard
          title="Completed"
          count={counts.completed}
          active={activeTab === "COMPLETED"}
          onClick={() => handleTabChange("COMPLETED")}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          badgeClass="bg-emerald-500/10 text-emerald-500"
        />
        <SummaryCard
          title="Cancelled"
          count={counts.cancelled}
          active={activeTab === "CANCELLED"}
          onClick={() => handleTabChange("CANCELLED")}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          badgeClass="bg-destructive/10 text-destructive"
        />
      </div>

      {/* Navigation Tabs & Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {[
            { id: "ALL", label: `All Bookings (${counts.total})` },
            { id: "ACTIVE", label: `Active (${counts.active})` },
            { id: "PENDING", label: `Pending (${counts.pending})` },
            { id: "COMPLETED", label: `Completed (${counts.completed})` },
            { id: "CANCELLED", label: `Cancelled (${counts.cancelled})` },
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
              placeholder="Search booking #, ref, customer, owner, bike..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start sm:justify-end">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Booking Status Dropdown */}
            <select
              value={bookingStatusFilter}
              onChange={(e) => {
                setBookingStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer"
            >
              <option value="ALL">Booking Status: All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Payment Status Dropdown */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer"
            >
              <option value="ALL">Payment: All</option>
              <option value="SUCCESS">Success / Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto sm:pl-2 sm:border-l sm:border-border">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer font-medium"
              >
                <option value="NEWEST">Sort: Newest First</option>
                <option value="OLDEST">Sort: Oldest First</option>
                <option value="AMOUNT_HIGH">Amount: High to Low</option>
                <option value="AMOUNT_LOW">Amount: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Table */}
      <BookingTable
        bookings={paginatedBookings}
        loading={loading}
        onViewDetails={setDetailBooking}
      />

      {filteredBookings.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      {/* Booking Details Modal */}
      {detailBooking && (
        <AdminDetailModal
          isOpen={!!detailBooking}
          title={`Booking #${detailBooking.bookingId}`}
          subtitle={detailBooking.bookingReference ? `Reference: ${detailBooking.bookingReference}` : undefined}
          badges={
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                detailBooking.bookingStatus?.toUpperCase() === "COMPLETED"
                  ? "bg-green-500/10 text-green-500"
                  : detailBooking.bookingStatus?.toUpperCase() === "PENDING"
                  ? "bg-amber-500/10 text-amber-500"
                  : detailBooking.bookingStatus?.toUpperCase() === "CANCELLED"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {detailBooking.bookingStatus || "UNKNOWN"}
            </span>
          }
          items={[
            { label: "Customer", value: detailBooking.customerName || `Customer #${detailBooking.customerId ?? "—"}` },
            { label: "Host / Owner", value: detailBooking.ownerName || `Owner #${detailBooking.ownerId ?? "—"}` },
            { label: "Rental Bike", value: detailBooking.bikeName || `Bike #${detailBooking.bikeId ?? "—"}` },
            { label: "Registration No.", value: detailBooking.registrationNumber || "—" },
            {
              label: "Scheduled Pickup",
              value: detailBooking.startTime ? new Date(detailBooking.startTime).toLocaleString() : "—",
            },
            {
              label: "Scheduled Return",
              value: detailBooking.returnTime ? new Date(detailBooking.returnTime).toLocaleString() : "—",
            },
            {
              label: "Payment Status",
              value: (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    detailBooking.paymentStatus?.toUpperCase() === "SUCCESS"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {detailBooking.paymentStatus || "PENDING"}
                </span>
              ),
            },
            {
              label: "Total Rental Fee",
              value: `₹${Number(
                detailBooking.totalAmount ?? detailBooking.rentalAmount ?? 0
              ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            },
          ]}
          onClose={() => setDetailBooking(null)}
        />
      )}
    </div>
  );
}