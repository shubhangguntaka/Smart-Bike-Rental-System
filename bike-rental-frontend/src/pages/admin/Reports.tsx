import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Bike, Calendar, CalendarCheck, CheckCircle2, Clock, CreditCard, RefreshCw, TrendingUp, Users, } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import reportService from "@/services/reportService";

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

  const [reportData, setReportData] = useState<
    | BookingReportRow[]
    | RevenueReportRow[]
    | BikeReportRow[]
    | PaymentReportRow[]
  >([]);

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

      const dateRange = {
        from,
        to,
      };

      let data;

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

      setReportData(data || []);
    } catch (error) {
      console.error("Failed to load report:", error);

      setReportError(
        "Unable to load report data. Please try again."
      );
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
          analyticsService.getDashboard(),
          analyticsService.getRevenue(selectedRange),
          analyticsService.getBookings(selectedRange),
          analyticsService.getBikes(selectedRange),
          analyticsService.getUsers(selectedRange),
          analyticsService.getRides(selectedRange),
        ]);

        setDashboard(dashboardData);
        setRevenue(revenueData);
        setBookings(bookingData || {});
        setBikes(bikeData || {});
        setUsers(userData || {});
        setRides(rideData);

      } catch (error) {
        console.error("Failed to load analytics:", error);
        toast.error("Failed to load analytics data.");
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

      {/* Detailed Operational Reports */}
      <section className="bg-card border border-border rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-foreground">
              Detailed Reports
            </h2>

            <p className="text-xs text-muted-foreground mt-0.5">
              Live operational reports automatically generated for the selected timeframe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedReport}
              onChange={(e) => {
                setSelectedReport(e.target.value as ReportType);
              }}
              className="bg-background border border-border text-foreground rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            >
              <option value="bookings">Bookings</option>
              <option value="revenue">Revenue</option>
              <option value="bikes">Bikes</option>
              <option value="payments">Payments</option>
            </select>

            <select
              value={analyticsRange}
              onChange={(e) =>
                setAnalyticsRange(e.target.value as AnalyticsRange)
              }
              className="bg-background border border-border text-foreground rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
            </select>

            <button
              type="button"
              onClick={exportReportToCSV}
              disabled={reportData.length === 0 || reportLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-background border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={exportReportToPDF}
              disabled={reportData.length === 0 || reportLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-background border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            >
              Export PDF
            </button>
          </div>
        </div>

        {reportError && (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {reportError}
          </div>
        )}

        {reportLoading && (
          <div className="mt-8 py-12 text-center">
            <div className="animate-spin mx-auto mb-2 h-6 w-6 rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground font-medium">Updating report data...</p>
          </div>
        )}

        {!reportLoading && reportData.length === 0 && !reportError && (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No records found for the selected {selectedReport} report within this timeframe.
          </div>
        )}

        {!reportLoading && reportData.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-2xs">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {Object.keys(reportData[0]).map((key) => (
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
                {reportData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-border/50 hover:bg-muted/30 transition last:border-b-0"
                  >
                    {Object.entries(row).map(([key, value]) => (
                      <td
                        key={key}
                        className="whitespace-nowrap px-4 py-3 text-foreground font-medium"
                      >
                        {value === null || value === undefined
                          ? "-"
                          : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
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
            <p className="text-xs text-muted-foreground">
              Total Users
            </p>
            <p className="text-xl font-bold mt-1">
              {dashboard?.totalUsers || 0}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Total Owners
            </p>
            <p className="text-xl font-bold mt-1">
              {dashboard?.totalOwners || 0}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Bike Utilization
            </p>
            <p className="text-xl font-bold mt-1">
              {Number(
                dashboard?.bikeUtilizationPercentage || 0
              ).toFixed(1)}
              %
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Successful Payments
            </p>
            <p className="text-xl font-bold mt-1">
              {dashboard?.successfulPayments || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}