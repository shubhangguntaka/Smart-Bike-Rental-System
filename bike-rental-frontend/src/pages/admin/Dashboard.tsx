import { useCallback, useEffect, useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import type { AdminDashboard } from "@/types/admin";
import adminService from "@/services/adminService";
import DashboardCards from "@/components/admin/DashboardCards";

export default function Dashboard() {
    const [stats, setStats] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(
        async (isRefresh = false) => {
            try {
                setError(null);

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const dashboard =
                    await adminService.getDashboard();

                setStats(dashboard);
            } catch (err) {
                console.error(
                    "Failed to load admin dashboard:",
                    err
                );

                setError(
                    "Unable to load dashboard statistics. Please try again."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const handleRefresh = () => {
        void loadDashboard(true);
    };

    if (loading) {
        return (
            <main className="space-y-6 text-foreground min-h-screen">
                <header className="bg-card border border-border p-6 rounded-2xl">
                    <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
                    <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-muted/60" />
                </header>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 animate-pulse rounded-2xl border border-border bg-card shadow-xs"
                        >
                            <div className="p-5 space-y-3">
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
                        {error ??
                            "Dashboard statistics could not be loaded."}
                    </p>

                    <button
                        type="button"
                        onClick={() => void loadDashboard()}
                        className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 cursor-pointer"
                    >
                        Try again
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="space-y-6 text-foreground min-h-screen">
            <header className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        Admin Dashboard
                    </h1>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Monitor users, owners, bikes, bookings and payments across the platform.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-2xs"
                >
                    <RefreshCw
                        className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""
                            }`}
                    />

                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </header>

            <DashboardCards stats={stats} />
        </main>
    );
}