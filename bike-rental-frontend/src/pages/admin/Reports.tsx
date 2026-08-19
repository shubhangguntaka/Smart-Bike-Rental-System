import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BarChart3,
  Bike,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Filter,
  Layers,
  PieChart as PieChartIcon,
  RotateCcw,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";

import adminService from "@/services/adminService";
import type {
  AdminDashboard,
  BikeAdmin,
  BookingAdmin,
  CustomerAdmin,
  OwnerAdmin,
  PaymentAdmin,
} from "@/types/admin";

interface SummaryCardProps {
  title: string;
  count: number | string;
  icon: React.ReactNode;
  to: string;
  badgeClass: string;
  subtext: string;
}

const SummaryCard = ({
  title,
  count,
  icon,
  to,
  badgeClass,
  subtext,
}: SummaryCardProps) => (
  <Link
    to={to}
    className="p-4 rounded-2xl border border-border bg-card hover:bg-muted/40 transition text-left flex flex-col justify-between space-y-2 shadow-xs group"
  >
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {title}
      </span>
      <div className="p-2 rounded-xl bg-background border border-border/80 group-hover:scale-105 transition-transform">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline justify-between">
      <span className="text-2xl font-extrabold text-foreground">{count}</span>
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${badgeClass}`}>
        View Details
      </span>
    </div>
    <p className="text-[10px] text-muted-foreground font-medium pt-1 border-t border-border/40 truncate">
      {subtext}
    </p>
  </Link>
);

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#10b981", // Emerald
  ACTIVE: "#3b82f6", // Blue
  CONFIRMED: "#6366f1", // Indigo
  PENDING: "#f59e0b", // Amber
  CANCELLED: "#ef4444", // Red
  AVAILABLE: "#10b981",
  BOOKED: "#3b82f6",
  UNDER_MAINTENANCE: "#f59e0b",
  NOT_AVAILABLE: "#ef4444",
};

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Raw dataset
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [bookings, setBookings] = useState<BookingAdmin[]>([]);
  const [bikes, setBikes] = useState<BikeAdmin[]>([]);
  const [payments, setPayments] = useState<PaymentAdmin[]>([]);
  const [owners, setOwners] = useState<OwnerAdmin[]>([]);
  const [customers, setCustomers] = useState<CustomerAdmin[]>([]);

  // Filters
  const [dateRange, setDateRange] = useState<"ALL" | "TODAY" | "7DAYS" | "30DAYS" | "THIS_MONTH">("ALL");

  const loadAllData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [dashRes, bookRes, bikeRes, payRes, ownRes, custRes] =
        await Promise.allSettled([
          adminService.getDashboard(),
          adminService.getBookings(),
          adminService.getBikes(),
          adminService.getPayments(),
          adminService.getOwners(),
          adminService.getCustomers(),
        ]);

      if (dashRes.status === "fulfilled") setDashboard(dashRes.value);
      if (bookRes.status === "fulfilled") setBookings(Array.isArray(bookRes.value) ? bookRes.value : []);
      if (bikeRes.status === "fulfilled") setBikes(Array.isArray(bikeRes.value) ? bikeRes.value : []);
      if (payRes.status === "fulfilled") setPayments(Array.isArray(payRes.value) ? payRes.value : []);
      if (ownRes.status === "fulfilled") setOwners(Array.isArray(ownRes.value) ? ownRes.value : []);
      if (custRes.status === "fulfilled") setCustomers(Array.isArray(custRes.value) ? custRes.value : []);
    } catch (error) {
      console.error("Failed to load reporting data:", error);
      toast.error("Failed to load analytics data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  // Filter bookings by date range
  const filteredBookings = useMemo(() => {
    if (dateRange === "ALL") return bookings;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return bookings.filter((b) => {
      const dateStr = b.startTime || b.createdDate;
      if (!dateStr) return true;
      const date = new Date(dateStr);

      if (dateRange === "TODAY") {
        return date >= startOfToday;
      }
      if (dateRange === "7DAYS") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= sevenDaysAgo;
      }
      if (dateRange === "30DAYS") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return date >= thirtyDaysAgo;
      }
      if (dateRange === "THIS_MONTH") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return date >= startOfMonth;
      }
      return true;
    });
  }, [bookings, dateRange]);

  // Aggregate Core Metrics
  const metrics = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => {
        const s = (p.status || "").toUpperCase();
        return s === "SUCCESS" || s === "COMPLETED" || s === "PAID";
      })
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);

    const totalBookingsCount = filteredBookings.length;
    const activeRentalsCount = filteredBookings.filter(
      (b) => (b.bookingStatus || "").toUpperCase() === "ACTIVE" || (b.bookingStatus || "").toUpperCase() === "CONFIRMED"
    ).length;
    const completedRentalsCount = filteredBookings.filter(
      (b) => (b.bookingStatus || "").toUpperCase() === "COMPLETED"
    ).length;
    const availableBikesCount = bikes.filter(
      (b) => (b.bikeStatus || "").toUpperCase() === "AVAILABLE"
    ).length;
    const activeCustomersCount = customers.filter(
      (c) => (c.status || "").toUpperCase() === "ACTIVE"
    ).length;

    return {
      totalRevenue,
      totalBookingsCount,
      activeRentalsCount,
      completedRentalsCount,
      availableBikesCount,
      activeCustomersCount,
    };
  }, [payments, filteredBookings, bikes, customers]);

  // Chart 1: Revenue Timeline (Grouped by Month/Period)
  const revenueTrendData = useMemo(() => {
    const monthlyMap: Record<string, { month: string; revenue: number; bookings: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize with last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      monthlyMap[label] = { month: label, revenue: 0, bookings: 0 };
    }

    payments.forEach((p) => {
      if (!p.paymentDate) return;
      const d = new Date(p.paymentDate);
      const label = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      if (monthlyMap[label]) {
        const s = (p.status || "").toUpperCase();
        if (s === "SUCCESS" || s === "COMPLETED" || s === "PAID") {
          monthlyMap[label].revenue += Number(p.amount || 0);
        }
      }
    });

    bookings.forEach((b) => {
      const dateStr = b.startTime || b.createdDate;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const label = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      if (monthlyMap[label]) {
        monthlyMap[label].bookings += 1;
      }
    });

    return Object.values(monthlyMap);
  }, [payments, bookings]);

  // Chart 2: Booking Status Breakdown
  const bookingStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      Completed: 0,
      Active: 0,
      Pending: 0,
      Cancelled: 0,
    };

    filteredBookings.forEach((b) => {
      const s = (b.bookingStatus || "").toUpperCase();
      if (s === "COMPLETED") statusCounts.Completed += 1;
      else if (s === "ACTIVE" || s === "CONFIRMED") statusCounts.Active += 1;
      else if (s === "PENDING") statusCounts.Pending += 1;
      else if (s === "CANCELLED") statusCounts.Cancelled += 1;
    });

    return [
      { name: "Completed", value: statusCounts.Completed, color: STATUS_COLORS.COMPLETED },
      { name: "Active", value: statusCounts.Active, color: STATUS_COLORS.ACTIVE },
      { name: "Pending", value: statusCounts.Pending, color: STATUS_COLORS.PENDING },
      { name: "Cancelled", value: statusCounts.Cancelled, color: STATUS_COLORS.CANCELLED },
    ].filter((item) => item.value > 0);
  }, [filteredBookings]);

  // Chart 3: Fleet Status Breakdown
  const fleetStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      Available: 0,
      "In Rental": 0,
      Maintenance: 0,
      Unavailable: 0,
    };

    bikes.forEach((b) => {
      const s = (b.bikeStatus || "").toUpperCase();
      if (s === "AVAILABLE") statusCounts.Available += 1;
      else if (s === "BOOKED") statusCounts["In Rental"] += 1;
      else if (s === "UNDER_MAINTENANCE") statusCounts.Maintenance += 1;
      else statusCounts.Unavailable += 1;
    });

    return [
      { status: "Available", count: statusCounts.Available, fill: "#10b981" },
      { status: "In Rental", count: statusCounts["In Rental"], fill: "#3b82f6" },
      { status: "Maintenance", count: statusCounts.Maintenance, fill: "#f59e0b" },
      { status: "Unavailable", count: statusCounts.Unavailable, fill: "#ef4444" },
    ];
  }, [bikes]);

  // Chart 4: Top Bike Categories / Utilization
  const categoryData = useMemo(() => {
    const catMap: Record<string, { category: string; count: number; bookings: number }> = {};

    bikes.forEach((b) => {
      const cat = b.category || "Standard Commuter";
      if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, bookings: 0 };
      catMap[cat].count += 1;
    });

    filteredBookings.forEach((b) => {
      const bike = bikes.find((bk) => bk.bikeId === b.bikeId || bk.bikeName === b.bikeName);
      const cat = bike?.category || "Standard Commuter";
      if (catMap[cat]) catMap[cat].bookings += 1;
    });

    return Object.values(catMap).slice(0, 5);
  }, [bikes, filteredBookings]);

  // CSV Export Function
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      toast.error("No booking records available to export for the selected date range.");
      return;
    }

    try {
      const headers = [
        "Booking ID",
        "Reference",
        "Customer Name",
        "Owner Name",
        "Bike Name",
        "Registration Number",
        "Start Time",
        "Return Time",
        "Booking Status",
        "Payment Status",
        "Amount (INR)",
      ];

      const rows = filteredBookings.map((b) => [
        b.bookingId ?? "",
        b.bookingReference ?? "",
        `"${(b.customerName ?? "").replace(/"/g, '""')}"`,
        `"${(b.ownerName ?? "").replace(/"/g, '""')}"`,
        `"${(b.bikeName ?? "").replace(/"/g, '""')}"`,
        b.registrationNumber ?? "",
        b.startTime ? new Date(b.startTime).toISOString() : "",
        b.returnTime ? new Date(b.returnTime).toISOString() : "",
        b.bookingStatus ?? "",
        b.paymentStatus ?? "",
        b.totalAmount ?? b.rentalAmount ?? 0,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `smartbike_admin_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV Report generated and downloaded successfully!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export report CSV.");
    }
  };

  return (
    <div className="space-y-6 text-foreground min-h-screen pb-12">
      {/* Title & Header */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Member 3 — Platform Intelligence & Analytics
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            Executive Analytics & Platform Reports
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Aggregated fleet utilization, rental velocity, financial revenue trends, and operational metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV Report</span>
          </button>

          <button
            type="button"
            onClick={() => void loadAllData(true)}
            disabled={refreshing || loading}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60 shadow-2xs"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <SummaryCard
          title="Total Gross Revenue"
          count={`₹${Number(metrics.totalRevenue).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          icon={<CreditCard className="h-4 w-4 text-purple-500" />}
          to="/admin/payments?status=SUCCESS"
          badgeClass="bg-purple-500/10 text-purple-500"
          subtext="Processed payments"
        />
        <SummaryCard
          title="Total Bookings"
          count={metrics.totalBookingsCount}
          icon={<CalendarCheck className="h-4 w-4 text-primary" />}
          to="/admin/bookings"
          badgeClass="bg-primary/10 text-primary"
          subtext="Filtered date range"
        />
        <SummaryCard
          title="Active Rentals"
          count={metrics.activeRentalsCount}
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          to="/admin/bookings?status=ACTIVE"
          badgeClass="bg-blue-500/10 text-blue-500"
          subtext="Ongoing dispatches"
        />
        <SummaryCard
          title="Completed Rentals"
          count={metrics.completedRentalsCount}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          to="/admin/bookings?status=COMPLETED"
          badgeClass="bg-emerald-500/10 text-emerald-500"
          subtext="Rides fulfilled"
        />
        <SummaryCard
          title="Available Fleet"
          count={metrics.availableBikesCount}
          icon={<Bike className="h-4 w-4 text-emerald-500" />}
          to="/admin/bikes?status=AVAILABLE"
          badgeClass="bg-emerald-500/10 text-emerald-500"
          subtext="Ready for rent"
        />
        <SummaryCard
          title="Active Customers"
          count={metrics.activeCustomersCount}
          icon={<UserCheck className="h-4 w-4 text-blue-500" />}
          to="/admin/customers?status=ACTIVE"
          badgeClass="bg-blue-500/10 text-blue-500"
          subtext="Verified users"
        />
      </div>

      {/* Date Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Analysis Timeframe:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", label: "All Time" },
            { id: "TODAY", label: "Today" },
            { id: "7DAYS", label: "Last 7 Days" },
            { id: "30DAYS", label: "Last 30 Days" },
            { id: "THIS_MONTH", label: "This Month" },
          ].map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => setDateRange(range.id as any)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                dateRange === range.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analytics Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue & Booking Velocity */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Revenue Trend (₹)</h3>
              <p className="text-[11px] text-muted-foreground">Historical revenue collected across billing cycles</p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Gross Revenue"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Booking Status Breakdown */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Booking Lifecycle Distribution</h3>
              <p className="text-[11px] text-muted-foreground">Status breakdown across filtered bookings</p>
            </div>
            <PieChartIcon className="h-4 w-4 text-blue-500" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {bookingStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(val) => <span className="text-xs text-foreground font-semibold">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground">No booking records found for timeframe.</p>
            )}
          </div>
        </div>

        {/* Chart 3: Fleet Status Breakdown */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Global Fleet Readiness</h3>
              <p className="text-[11px] text-muted-foreground">Operational availability across registered bikes</p>
            </div>
            <Bike className="h-4 w-4 text-primary" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                <XAxis dataKey="status" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} bikes`, "Fleet Units"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {fleetStatusData.map((entry, index) => (
                    <Cell key={`fleet-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Category Utilization */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Category Popularity & Demand</h3>
              <p className="text-[11px] text-muted-foreground">Rentals demanded per vehicle category</p>
            </div>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                <XAxis type="number" stroke="#888888" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="category" type="category" stroke="#888888" fontSize={10} width={90} />
                <Tooltip
                  formatter={(val: any) => [`${val} rentals`, "Rides Booked"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="bookings" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Highlights Table */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Recent High-Value Dispatches</h3>
            <p className="text-[11px] text-muted-foreground">Latest bookings recorded under active report filter</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Host / Owner</th>
                <th className="py-3 px-4">Rental Fee</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.slice(0, 5).map((b) => (
                <tr key={b.bookingId} className="border-b border-border last:border-0 hover:bg-muted/15">
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    #{b.bookingId}
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">
                    {b.customerName || `Customer #${b.customerId ?? "—"}`}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {b.bikeName || `Bike #${b.bikeId ?? "—"}`}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {b.ownerName || `Owner #${b.ownerId ?? "—"}`}
                  </td>
                  <td className="py-3 px-4 font-bold text-foreground">
                    ₹{Number(b.totalAmount ?? b.rentalAmount ?? 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        (b.bookingStatus || "").toUpperCase() === "COMPLETED"
                          ? "bg-green-500/10 text-green-500"
                          : (b.bookingStatus || "").toUpperCase() === "CANCELLED"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {b.bookingStatus || "PENDING"}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No bookings recorded in this timeframe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
