import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Clock, RefreshCw, Search, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import adminService from "@/services/adminService";
import type { AdminActivity } from "@/types/admin";

const PAGE_SIZE = 10;

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await adminService.getActivity();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load admin activities:", err);
      setError("Unable to load activity logs. Please try again.");
      toast.error("Failed to load activity logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return activities;
    }

    return activities.filter((item) => {
      const searchable = [
        item.id != null ? String(item.id) : "",
        item.action ?? "",
        item.performedBy ?? "",
        item.details ?? "",
        item.status ?? "",
        item.timestamp ?? "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [activities, search]);

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const paginatedActivities = filteredActivities.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="min-h-screen space-y-6 text-foreground">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Admin Activity Log</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Audit trail of administrative actions, platform modifications, and security events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadActivities(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search activity, action, actor, details..."
          width="max-w-md w-full"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            Loading activity log records...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <button
            type="button"
            onClick={() => void loadActivities()}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 font-semibold text-muted-foreground">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActivities.length > 0 ? (
                  paginatedActivities.map((item, index) => (
                    <tr
                      key={item.id ?? index}
                      className="border-b border-border last:border-0 hover:bg-muted/10"
                    >
                      <td className="p-4 whitespace-nowrap text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {item.timestamp
                            ? new Date(item.timestamp).toLocaleString("en-IN")
                            : "—"}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Activity className="h-3.5 w-3.5 text-primary" />
                          <span>{item.action || "Administrative Action"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">
                        {item.performedBy || "System Administrator"}
                      </td>
                      <td className="p-4 text-muted-foreground max-w-md truncate">
                        {item.details || "—"}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            item.status?.toUpperCase() === "SUCCESS"
                              ? "bg-green-500/10 text-green-500"
                              : item.status?.toUpperCase() === "FAILED"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {item.status || "LOGGED"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-muted-foreground">
                      <div className="mx-auto flex flex-col items-center justify-center space-y-2">
                        <Activity className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm font-semibold text-foreground">
                          {search
                            ? "No matching activity records found."
                            : "No administrative activities logged yet."}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {search
                            ? "Try adjusting your search criteria."
                            : "Administrative events and audit trails will appear here as actions occur."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredActivities.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}
    </div>
  );
}
