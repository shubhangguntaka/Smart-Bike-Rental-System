import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  AlertCircle,
  Users,
  UserRoundCog,
  Bike,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Percent,
  BarChart3,
} from "lucide-react";

import type { AdminActivity, AdminDashboard, BookingAdmin } from "@/types/admin";
import adminService from "@/services/adminService";
import DashboardCards from "@/components/admin/DashboardCards";

export default function Dashboard() {
  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingAdmin[]>([]);
  const [recentActivities, setRecentActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [statsData, bookingsData, activityData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getBookings().catch(() => []),
        adminService.getActivity().catch(() => []),
      ]);

      setStats(statsData);
      setRecentBookings(Array.isArray(bookingsData) ? bookingsData.slice(0, 5) : []);
      setRecentActivities(Array.isArray(activityData) ? activityData.slice(0, 5) : []);
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = () => {
    void loadDashboard(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen space-y-6 text-foreground">
        <header className="rounded-2xl border border-border bg-card p-6">
          <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-muted/60" />
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-border bg-card shadow-xs"
            >
              <div className="space-y-3 p-5">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-7 w-16 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted/60" />
              </div>
            </div>
          ))}
        </section>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="flex min-h-[400px] items-center justify-center p-6 text-foreground">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>

          <h1 className="text-lg font-bold text-foreground">
            Dashboard unavailable
          </h1>

          <p className="mt-2 text-xs text-muted-foreground">
            {error ?? "Dashboard statistics could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  const bikeActivePercent =
    stats.totalBikes > 0
      ? Math.round((stats.activeBikes / stats.totalBikes) * 100)
      : 0;

  const bookingCompletionRate =
    stats.totalBookings > 0
      ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
      : 0;

  const quickActions = [
    { label: "Executive Reports", to: "/admin/reports", icon: BarChart3, desc: "Platform analytics & CSV" },
    { label: "Manage Users", to: "/admin/users", icon: Users, desc: "Accounts & roles" },
    { label: "Fleet Control", to: "/admin/bikes", icon: Bike, desc: "Status & hubs" },
    { label: "Bookings Ledger", to: "/admin/bookings", icon: CalendarDays, desc: "Live rentals" },
    { label: "Payments Ledger", to: "/admin/payments", icon: CreditCard, desc: "Billing & payouts" },
    { label: "Verification Bureau", to: "/admin/verification", icon: ShieldCheck, desc: "KYC approval" },
  ];

  return (
    <main className="min-h-screen space-y-6 text-foreground pb-12">
      {/* Header */}
      <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Member 3 — Admin Operations
          </span>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground mt-0.5">
            Platform Operations Dashboard
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Real-time platform metrics, fleet utilization, financial velocity, and system management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/reports"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>View Reports & Analytics</span>
          </Link>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow-2xs transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>
        </div>
      </header>

      {/* Main KPI Cards */}
      <DashboardCards stats={stats} />

      {/* Platform Health & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Fleet & Operation Metrics */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Platform Health</h2>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-muted-foreground">Fleet Availability Rate</span>
                <span className="font-bold text-foreground">{bikeActivePercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${bikeActivePercent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {stats.activeBikes} of {stats.totalBikes} bikes available for rent
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-muted-foreground">Booking Completion Rate</span>
                <span className="font-bold text-foreground">{bookingCompletionRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${bookingCompletionRate}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {stats.completedBookings} successfully completed of {stats.totalBookings} total
              </p>
            </div>
          </div>
        </section>

        {/* Quick Management Actions */}
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-sm font-bold text-foreground mb-4">Quick Operations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex flex-col justify-between p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recent Bookings and Audit Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">Recent Bookings</h2>
                <p className="text-xs text-muted-foreground">Latest rental requests on the system</p>
              </div>
              <Link
                to="/admin/bookings"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentBookings.length > 0 ? (
              <div className="divide-y divide-border">
                {recentBookings.map((b) => (
                  <div key={b.bookingId} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {b.bikeName || `Booking #${b.bookingId}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        Renter: {b.customerName || `Customer #${b.customerId ?? "—"}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-foreground">
                        ₹{Number(b.totalAmount || b.rentalAmount || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">
                        {b.bookingStatus || "PENDING"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No recent bookings recorded.
              </p>
            )}
          </div>
        </section>

        {/* Recent Administrative Activity */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">Recent Activity Logs</h2>
                <p className="text-xs text-muted-foreground">Audit trail of platform operations</p>
              </div>
              <Link
                to="/admin/activity"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentActivities.length > 0 ? (
              <div className="divide-y divide-border">
                {recentActivities.map((act, index) => (
                  <div key={act.id ?? index} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-bold text-foreground truncate">
                        {act.action || "Admin Operation"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {act.details || `By ${act.performedBy ?? "ADMIN"}`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No administrative activity logged yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}