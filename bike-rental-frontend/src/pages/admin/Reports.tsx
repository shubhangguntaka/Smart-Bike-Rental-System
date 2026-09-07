import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpDown,
  Bike,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import reportService from "@/services/reportService";
import adminService from "@/services/adminService";

import type { BookingReportRow, RevenueReportRow, BikeReportRow, PaymentReportRow, } from "@/types/report";
import toast from "react-hot-toast";

import analyticsService from "@/services/analyticsService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { DashboardAnalytics, RevenueAnalytics, BookingAnalytics, BikeAnalytics, UserAnalytics, RideAnalytics, } from "@/types/analytics";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconClassName?: string;
}

const MetricCard = ({ title, value, subtitle, icon, iconClassName = "text-primary", }: MetricCardProps) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>

          <p className="text-3xl font-extrabold text-foreground mt-2">
            {value}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border">
          <span className={iconClassName}>{icon}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 border-t border-border/50 pt-3">
        {subtitle}
      </p>
    </div>
  );
};

const formatCurrency = (value: number) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

type AnalyticsRange =
  | "ALL"
  | "TODAY"
  | "7DAYS"
  | "30DAYS"
  | "THIS_MONTH";

const formatAnalyticsDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateRange = (range: AnalyticsRange) => {
  const today = new Date();

  const to = new Date(today);
  let from = new Date(today);

  switch (range) {
    case "ALL":
      from = new Date(2020, 0, 1);
      break;

    case "TODAY":
      break;

    case "7DAYS":
      from.setDate(today.getDate() - 6);
      break;

    case "30DAYS":
      from.setDate(today.getDate() - 29);
      break;

    case "THIS_MONTH":
      from = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      break;

    default:
      from = new Date(2020, 0, 1);
  }

  return {
    from: formatAnalyticsDate(from),
    to: formatAnalyticsDate(to),
  };
};

export default function AdminReports() {
  type ReportType = "bookings" | "revenue" | "bikes" | "payments";

  const [selectedReport, setSelectedReport] =
    useState<ReportType>("bookings");

  const [reportData, setReportData] = useState<any[]>([]);
  const [reportSearch, setReportSearch] = useState("");
  const [reportSortBy, setReportSortBy] = useState("NEWEST");

  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [analyticsRange, setAnalyticsRange] =
    useState<AnalyticsRange>("ALL");

  const [dashboard, setDashboard] =
    useState<DashboardAnalytics | null>(null);

  const [revenue, setRevenue] =
    useState<RevenueAnalytics | null>(null);

  const [bookings, setBookings] =
    useState<BookingAnalytics>({});

  const [bikes, setBikes] =
    useState<BikeAnalytics>({});

  const [users, setUsers] =
    useState<UserAnalytics>({});

  const [rides, setRides] =
    useState<RideAnalytics | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setReportLoading(true);
      setReportError(null);

      const { from, to } = getDateRange(analyticsRange);
      const fromDate = new Date(from).getTime();
      const toDate = new Date(to).getTime() + 24 * 60 * 60 * 1000;

      const dateRange = {
        from,
        to,
      };

      let data: any[] = [];

      try {
        switch (selectedReport) {
          case "bookings":
            data = await reportService.getBookings(dateRange);
            break;
          case "revenue":
            data = await reportService.getRevenue(dateRange);
            break;
          case "bikes":
            data = await reportService.getBikes(dateRange);
            break;
          case "payments":
            data = await reportService.getPayments(dateRange);
            break;
        }
      } catch (err) {
        console.warn("Specialized report endpoint returned error, using adminService fallback:", err);
      }

      // If backend reports returned empty or failed, fallback to adminService live entities
      if (!Array.isArray(data) || data.length === 0) {
        if (selectedReport === "bookings") {
          const raw = await adminService.getBookings().catch(() => []);
          data = Array.isArray(raw)
            ? raw
                .filter((b) => {
                  const t = new Date(b.createdAt || b.startTime || 0).getTime();
                  return !t || (t >= fromDate && t <= toDate);
                })
                .map((b) => ({
                  bookingId: b.bookingId,
                  bikeId: b.bikeId,
                  customerId: b.customerId,
                  bookingStatus: b.bookingStatus,
                  paymentStatus: b.paymentStatus,
                  rentalAmount: b.rentalAmount || b.totalAmount,
                  startTime: b.startTime,
                  returnTime: b.returnTime,
                  createdAt: b.createdAt,
                }))
            : [];
        } else if (selectedReport === "revenue" || selectedReport === "payments") {
          const raw = await adminService.getPayments().catch(() => []);
          data = Array.isArray(raw)
            ? raw
                .filter((p) => {
                  if (selectedReport === "revenue") {
                    const st = (p.status || p.paymentStatus || "").toUpperCase();
                    if (st !== "SUCCESS" && st !== "COMPLETED" && st !== "PAID") return false;
                  }
                  const t = new Date(p.paidAt || p.paymentDate || p.createdAt || 0).getTime();
                  return !t || (t >= fromDate && t <= toDate);
                })
                .map((p) => ({
                  paymentId: p.paymentId,
                  bookingId: p.bookingId,
                  amount: p.finalAmount != null ? p.finalAmount : p.amount,
                  status: p.status || p.paymentStatus,
                  paymentMethod: p.paymentMethod || "ONLINE",
                  paymentDate: p.paidAt || p.paymentDate || p.createdAt,
                }))
            : [];
        } else if (selectedReport === "bikes") {
          const raw = await adminService.getBikes().catch(() => []);
          data = Array.isArray(raw)
            ? raw
                .filter((bk: any) => {
                  const t = bk.createdAt || bk.availableDate ? new Date(bk.createdAt || bk.availableDate).getTime() : 0;
                  return !t || (t >= fromDate && t <= toDate);
                })
                .map((bk: any) => ({
                  bikeId: bk.bikeId,
                  ownerId: bk.ownerId,
                  bikeName: bk.bikeName,
                  brand: bk.brand,
                  model: bk.model,
                  rentalPrice: bk.rentalPrice,
                  bikeStatus: bk.bikeStatus,
                  location: bk.location,
                  createdAt: bk.createdAt || bk.availableDate,
                }))
            : [];
        }
      }

      setReportData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load report:", error);
      setReportError("Unable to load report data. Please try again.");
    } finally {
      setReportLoading(false);
    }
  }, [selectedReport, analyticsRange]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const loadAnalytics = useCallback(
    async (
      range: AnalyticsRange = analyticsRange,
      refresh = false
    ) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const selectedRange = getDateRange(range);

        const [
          dashboardData,
          revenueData,
          bookingData,
          bikeData,
          userData,
          rideData,
        ] = await Promise.all([
          analyticsService.getDashboard().catch(async () => {
            const adminDash = await adminService.getDashboard().catch(() => null);
            if (!adminDash) return null;
            return {
              totalRevenue: (adminDash as any).totalRevenue || 0,
              totalBookings: adminDash.totalBookings,
              activeBookings: adminDash.activeBookings,
              completedBookings: adminDash.completedBookings,
              totalBikes: adminDash.totalBikes,
              availableBikes: adminDash.activeBikes,
              totalCustomers: adminDash.totalUsers - adminDash.totalOwners,
              totalUsers: adminDash.totalUsers,
              totalOwners: adminDash.totalOwners,
              bikeUtilizationPercentage: adminDash.totalBikes > 0 ? (adminDash.activeBikes / adminDash.totalBikes) * 100 : 0,
              successfulPayments: adminDash.completedBookings,
            } as DashboardAnalytics;
          }),
          analyticsService.getRevenue(selectedRange).catch(() => null),
          analyticsService.getBookings(selectedRange).catch(() => ({})),
          analyticsService.getBikes(selectedRange).catch(() => ({})),
          analyticsService.getUsers(selectedRange).catch(() => ({})),
          analyticsService.getRides(selectedRange).catch(() => null),
        ]);

        setDashboard(dashboardData);
        setRevenue(revenueData);
        setBookings(bookingData || {});
        setBikes(bikeData || {});
        setUsers(userData || {});
        setRides(rideData);

      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [analyticsRange]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const exportReportToPDF = () => {
    if (!reportData.length) {
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const title =
      `${selectedReport.charAt(0).toUpperCase()}${selectedReport.slice(1)} Report`;

    doc.setFontSize(18);
    doc.text(title, 14, 15);

    const { from, to } = getDateRange(analyticsRange);

    doc.setFontSize(10);
    doc.text(
      `Period: ${from} to ${to}`,
      14,
      22
    );

    const headers = Object.keys(reportData[0]);

    const rows = reportData.map((row) =>
      headers.map((header) => {
        const value = row[header as keyof typeof row];

        if (value === null || value === undefined) {
          return "-";
        }

        if (typeof value === "object") {
          return JSON.stringify(value);
        }

        return String(value);
      })
    );

    autoTable(doc, {
      head: [
        headers.map((header) =>
          header
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
        ),
      ],
      body: rows,
      startY: 28,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fontSize: 7,
      },
      margin: {
        left: 10,
        right: 10,
      },
    });

    doc.save(`${selectedReport}-report.pdf`);
  };

  const exportReportToCSV = () => {
    if (!reportData.length) {
      return;
    }

    const headers = Object.keys(reportData[0]);

    const rows = reportData.map((row) =>
      headers.map((header) => {
        const value = row[header as keyof typeof row];

        if (value === null || value === undefined) {
          return "";
        }

        return `"${String(value).replace(/"/g, '""')}"`;
      })
    );

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedReport}-report.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * Revenue chart
   * Data is calculated by the backend analytics service.
   */
  const revenueChartData = useMemo(() => {
    if (!revenue?.revenueByDate) {
      return [];
    }

    return Object.entries(revenue.revenueByDate).map(
      ([date, amount]) => ({
        date,
        revenue: Number(amount || 0),
      })
    );
  }, [revenue]);

  /*
   * Booking status chart
   */
  const bookingChartData = useMemo(() => {
    const statusMap: Record<string, string> = {
      PENDING: "Pending",
      APPROVED: "Approved",
      CONFIRMED: "Confirmed",
      ACTIVE: "Active",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      REJECTED: "Rejected",
    };

    return Object.entries(statusMap)
      .map(([key, label]) => ({
        name: label,
        value: Number(bookings[key] || 0),
      }))
      .filter((item) => item.value > 0);
  }, [bookings]);

  /*
   * Fleet status chart
   */
  const bikeChartData = useMemo(() => {
    const statusMap = [
      {
        key: "AVAILABLE",
        name: "Available",
        fill: "#10b981",
      },
      {
        key: "BOOKED",
        name: "Booked",
        fill: "#3b82f6",
      },
      {
        key: "UNDER_MAINTENANCE",
        name: "Maintenance",
        fill: "#f59e0b",
      },
      {
        key: "NOT_AVAILABLE",
        name: "Unavailable",
        fill: "#ef4444",
      },
    ];

    return statusMap.map((item) => ({
      name: item.name,
      value: Number(bikes[item.key] || 0),
      fill: item.fill,
    }));
  }, [bikes]);

  /*
   * Ride activity chart
   */
  const rideChartData = useMemo(() => {
    if (!rides) {
      return [];
    }

    return [
      {
        name: "Total",
        value: Number(rides.totalRides || 0),
      },
      {
        name: "Active",
        value: Number(rides.activeRides || 0),
      },
      {
        name: "Completed",
        value: Number(rides.completedRides || 0),
      },
    ];
  }, [rides]);

  const filteredReportData = useMemo(() => {
    let list = [...reportData];

    if (reportSearch.trim()) {
      const q = reportSearch.toLowerCase().trim();
      list = list.filter((row) =>
        Object.values(row).some((val) =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    list.sort((a, b) => {
      const timeA = new Date(a.paymentDate || a.createdAt || a.startTime || a.availableDate || 0).getTime();
      const timeB = new Date(b.paymentDate || b.createdAt || b.startTime || b.availableDate || 0).getTime();
      const amountA = Number(a.amount || a.finalAmount || a.rentalAmount || a.rentalPrice || a.hourlyRate || 0);
      const amountB = Number(b.amount || b.finalAmount || b.rentalAmount || b.rentalPrice || b.hourlyRate || 0);

      if (reportSortBy === "NEWEST") {
        if (timeA && timeB && timeA !== timeB) return timeB - timeA;
        const idA = a.bookingId || a.paymentId || a.bikeId || a.id || 0;
        const idB = b.bookingId || b.paymentId || b.bikeId || b.id || 0;
        return Number(idB) - Number(idA);
      }
      if (reportSortBy === "OLDEST") {
        if (timeA && timeB && timeA !== timeB) return timeA - timeB;
        const idA = a.bookingId || a.paymentId || a.bikeId || a.id || 0;
        const idB = b.bookingId || b.paymentId || b.bikeId || b.id || 0;
        return Number(idA) - Number(idB);
      }
      if (reportSortBy === "AMOUNT_HIGH") {
        return amountB - amountA;
      }
      if (reportSortBy === "AMOUNT_LOW") {
        return amountA - amountB;
      }
      return 0;
    });

    return list;
  }, [reportData, reportSearch, reportSortBy]);

  const renderCellValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground/60">—</span>;
    }

    const keyLower = key.toLowerCase();

    // Money
    if (
      keyLower.includes("amount") ||
      keyLower.includes("price") ||
      keyLower.includes("revenue") ||
      keyLower.includes("rate") ||
      keyLower.includes("fee")
    ) {
      return (
        <span className="font-bold text-foreground">
          ₹{Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </span>
      );
    }

    // Status
    if (keyLower.includes("status")) {
      const s = String(value).toUpperCase();
      const isGood = s === "SUCCESS" || s === "COMPLETED" || s === "PAID" || s === "AVAILABLE" || s === "CONFIRMED";
      const isWarn = s === "PENDING" || s === "BOOKED" || s === "READY_FOR_PAYMENT";
      const isBad = s === "FAILED" || s === "CANCELLED" || s === "REJECTED" || s === "NOT_AVAILABLE";

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
            isGood
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : isWarn
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              : isBad
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {String(value)}
        </span>
      );
    }

    // Date
    if (keyLower.includes("time") || keyLower.includes("date") || keyLower.includes("at")) {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          return (
            <span className="text-xs text-muted-foreground font-mono">
              {d.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              {d.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          );
        }
      } catch {
        // fallback
      }
    }

    if (typeof value === "object") {
      return <span>{JSON.stringify(value)}</span>;
    }

    return <span>{String(value)}</span>;
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-3 h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground min-h-screen pb-12">
      {/* Header */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold mt-1">
              Executive Analytics Dashboard
            </h1>

            <p className="text-xs text-muted-foreground mt-1">
              Operational metrics, revenue trends, booking activity,
              fleet utilization and ride statistics.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadAnalytics()}
            disabled={refreshing}
            className="self-start px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition flex items-center gap-2 text-sm font-bold disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""
                }`}
            />

            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Analysis Timeframe */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />

            <div>
              <p className="text-xs font-bold text-foreground">
                Analysis Timeframe
              </p>

              <p className="text-[11px] text-muted-foreground">
                Select the period for analytics and charts
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "ALL" as AnalyticsRange,
                label: "All Time",
              },
              {
                id: "TODAY" as AnalyticsRange,
                label: "Today",
              },
              {
                id: "7DAYS" as AnalyticsRange,
                label: "Last 7 Days",
              },
              {
                id: "30DAYS" as AnalyticsRange,
                label: "Last 30 Days",
              },
              {
                id: "THIS_MONTH" as AnalyticsRange,
                label: "This Month",
              },
            ].map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setAnalyticsRange(range.id)}
                disabled={loading || refreshing}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${analyticsRange === range.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  } disabled:opacity-60`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Today's Revenue"
          value={formatCurrency(
            Number(dashboard?.totalRevenue || 0)
          )}
          subtitle="Successful payments"
          icon={<CreditCard className="h-5 w-5" />}
          iconClassName="text-purple-500"
        />

        <MetricCard
          title="Today's Bookings"
          value={dashboard?.totalBookings || 0}
          subtitle="Bookings recorded today"
          icon={<CalendarCheck className="h-5 w-5" />}
          iconClassName="text-blue-500"
        />

        <MetricCard
          title="Active Rentals"
          value={dashboard?.activeBookings || 0}
          subtitle="Currently active bookings"
          icon={<Clock className="h-5 w-5" />}
          iconClassName="text-orange-500"
        />

        <MetricCard
          title="Completed Rentals"
          value={dashboard?.completedBookings || 0}
          subtitle="Completed bookings today"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClassName="text-emerald-500"
        />

        <MetricCard
          title="Available Fleet"
          value={dashboard?.availableBikes || 0}
          subtitle={`Out of ${dashboard?.totalBikes || 0} bikes`}
          icon={<Bike className="h-5 w-5" />}
          iconClassName="text-green-500"
        />

        <MetricCard
          title="Total Customers"
          value={dashboard?.totalCustomers || 0}
          subtitle="Registered customers"
          icon={<Users className="h-5 w-5" />}
          iconClassName="text-indigo-500"
        />
      </div>

      {/* Revenue + Booking Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold">
                Revenue Trend
              </h2>

              <p className="text-[11px] text-muted-foreground">
                Successful payment revenue for the last 30 days
              </p>
            </div>

            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="h-72">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient
                      id="analyticsRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(150,150,150,0.15)"
                  />

                  <XAxis
                    dataKey="date"
                    fontSize={10}
                    stroke="#888888"
                  />

                  <YAxis
                    fontSize={10}
                    stroke="#888888"
                    tickFormatter={(value) =>
                      `₹${value}`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Revenue",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#analyticsRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No revenue data available.
              </div>
            )}
          </div>
        </div>

        {/* Booking Lifecycle */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold">
                Booking Lifecycle
              </h2>

              <p className="text-[11px] text-muted-foreground">
                Booking status distribution for the last 30 days
              </p>
            </div>

            <CalendarCheck className="h-5 w-5 text-blue-500" />
          </div>

          <div className="h-72">
            {bookingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {bookingChartData.map((_, index) => (
                      <Cell
                        key={`booking-${index}`}
                        fill={
                          [
                            "#f59e0b",
                            "#8b5cf6",
                            "#6366f1",
                            "#3b82f6",
                            "#10b981",
                            "#ef4444",
                            "#dc2626",
                          ][index % 7]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No booking data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fleet + Ride Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold">
                Fleet Readiness
              </h2>

              <p className="text-[11px] text-muted-foreground">
                Current bike availability and operational status
              </p>
            </div>

            <Bike className="h-5 w-5 text-primary" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bikeChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(150,150,150,0.15)"
                />

                <XAxis
                  dataKey="name"
                  fontSize={10}
                  stroke="#888888"
                />

                <YAxis
                  allowDecimals={false}
                  fontSize={10}
                  stroke="#888888"
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                >
                  {bikeChartData.map((entry, index) => (
                    <Cell
                      key={`bike-${index}`}
                      fill={entry.fill}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rides */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold">
                Ride Activity
              </h2>

              <p className="text-[11px] text-muted-foreground">
                Ride statistics for the last 30 days
              </p>
            </div>

            <Activity className="h-5 w-5 text-blue-500" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rideChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(150,150,150,0.15)"
                />

                <XAxis
                  dataKey="name"
                  fontSize={10}
                  stroke="#888888"
                />

                <YAxis
                  allowDecimals={false}
                  fontSize={10}
                  stroke="#888888"
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Operational Reports Section */}
      <section className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Ledger Data
              </span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black">
                {filteredReportData.length} records
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground mt-0.5">
              Detailed Operational Reports
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live records automatically generated and synchronized for the selected timeframe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedReport}
              onChange={(e) => {
                setSelectedReport(e.target.value as ReportType);
              }}
              className="bg-background border border-border text-foreground rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
            >
              <option value="bookings">Bookings Ledger</option>
              <option value="revenue">Revenue Ledger</option>
              <option value="bikes">Fleet / Bike Catalog</option>
              <option value="payments">All Payments</option>
            </select>

            <select
              value={analyticsRange}
              onChange={(e) =>
                setAnalyticsRange(e.target.value as AnalyticsRange)
              }
              className="bg-background border border-border text-foreground rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
            >
              <option value="ALL">Timeframe: All Time</option>
              <option value="TODAY">Timeframe: Today</option>
              <option value="7DAYS">Timeframe: Last 7 Days</option>
              <option value="30DAYS">Timeframe: Last 30 Days</option>
              <option value="THIS_MONTH">Timeframe: This Month</option>
            </select>

            <button
              type="button"
              onClick={exportReportToCSV}
              disabled={filteredReportData.length === 0 || reportLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-background border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer active:scale-95"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={exportReportToPDF}
              disabled={filteredReportData.length === 0 || reportLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-background border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer active:scale-95"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              placeholder="Search by ID, name, status, method..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
              <span>Sort:</span>
            </div>
            <select
              value={reportSortBy}
              onChange={(e) => setReportSortBy(e.target.value)}
              className="bg-background border border-border text-foreground rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
            >
              <option value="NEWEST">Newest Records First</option>
              <option value="OLDEST">Oldest Records First</option>
              <option value="AMOUNT_HIGH">Highest Amount First</option>
              <option value="AMOUNT_LOW">Lowest Amount First</option>
            </select>
          </div>
        </div>

        {reportError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {reportError}
          </div>
        )}

        {reportLoading && (
          <div className="py-12 text-center">
            <div className="animate-spin mx-auto mb-2 h-6 w-6 rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground font-medium">Updating report data...</p>
          </div>
        )}

        {!reportLoading && filteredReportData.length === 0 && !reportError && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No records found matching your query for the selected {selectedReport} report.
          </div>
        )}

        {!reportLoading && filteredReportData.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-2xs">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {Object.keys(filteredReportData[0]).map((key) => (
                    <th
                      key={key}
                      className="whitespace-nowrap px-4 py-3 text-left font-bold text-muted-foreground uppercase text-[10px] tracking-wider"
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredReportData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-border/50 hover:bg-muted/30 transition last:border-b-0"
                  >
                    {Object.entries(row).map(([key, value]) => (
                      <td
                        key={key}
                        className="whitespace-nowrap px-4 py-3 text-foreground"
                      >
                        {renderCellValue(key, value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Additional statistics */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Registered Users</p>
            <p className="text-xl font-bold mt-1 text-foreground">{dashboard?.totalUsers || 0}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Bike Owners</p>
            <p className="text-xl font-bold mt-1 text-foreground">{dashboard?.totalOwners || 0}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-medium">Bike Fleet Utilization</p>
            <p className="text-xl font-bold mt-1 text-foreground">
              {Number(dashboard?.bikeUtilizationPercentage || 0).toFixed(1)}%
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-medium">Successful Payments</p>
            <p className="text-xl font-bold mt-1 text-foreground">
              {dashboard?.successfulPayments || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}