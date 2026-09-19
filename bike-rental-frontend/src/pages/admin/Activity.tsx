import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  BadgeCheck,
  Bike,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Layers,
  RotateCcw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { Pagination } from "@/components/common/Pagination";
import AdminDetailModal from "@/components/admin/AdminDetailModal";
import adminService from "@/services/adminService";
import type { AdminActivity } from "@/types/admin";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

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

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [detailActivity, setDetailActivity] = useState<AdminActivity | null>(null);

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

  // Compute counts
  const counts = useMemo(() => {
    const total = activities.length;
    const userActions = activities.filter((a) =>
      (a.action || "").toUpperCase().includes("USER") || (a.targetType || "").toUpperCase() === "USER"
    ).length;
    const fleetActions = activities.filter((a) =>
      (a.action || "").toUpperCase().includes("BIKE") || (a.targetType || "").toUpperCase() === "BIKE"
    ).length;
    const verificationActions = activities.filter((a) =>
      (a.action || "").toUpperCase().includes("VERIF") || (a.targetType || "").toUpperCase().includes("DOCUMENT")
    ).length;
    const successLogs = activities.filter(
      (a) => (a.status || "").toUpperCase() === "SUCCESS"
    ).length;

    return { total, userActions, fleetActions, verificationActions, successLogs };
  }, [activities]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);

    if (tabId !== "ALL") {
      setActionFilter(tabId);
    } else {
      setActionFilter("ALL");
    }
  };

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities.filter((item) => {
      const actionUpper = (item.action || "").toUpperCase();
      const targetUpper = (item.targetType || "").toUpperCase();
      const statusUpper = (item.status || "").toUpperCase();

      // Tab filter
      if (activeTab === "USER" && !actionUpper.includes("USER") && targetUpper !== "USER") return false;
      if (activeTab === "BIKE" && !actionUpper.includes("BIKE") && targetUpper !== "BIKE") return false;
      if (activeTab === "VERIFICATION" && !actionUpper.includes("VERIF") && !targetUpper.includes("DOCUMENT")) return false;

      // Dropdown Action Filter
      if (actionFilter === "USER" && !actionUpper.includes("USER") && targetUpper !== "USER") return false;
      if (actionFilter === "BIKE" && !actionUpper.includes("BIKE") && targetUpper !== "BIKE") return false;
      if (actionFilter === "VERIFICATION" && !actionUpper.includes("VERIF") && !targetUpper.includes("DOCUMENT")) return false;
      if (actionFilter === "USER_ACTIVATED" && !actionUpper.includes("USER_ACTIVATED")) return false;
      if (actionFilter === "USER_DEACTIVATED" && !actionUpper.includes("USER_DEACTIVATED")) return false;
      if (actionFilter === "BIKE_STATUS_CHANGED" && !actionUpper.includes("BIKE")) return false;

      // Dropdown Status Filter
      if (statusFilter !== "ALL" && statusUpper !== statusFilter) return false;

      if (query) {
        const searchable = [
          item.id != null ? String(item.id) : "",
          item.action ?? "",
          item.performedBy ?? "",
          item.details ?? "",
          item.targetType ?? "",
          item.targetId != null ? String(item.targetId) : "",
          item.status ?? "",
          item.timestamp ?? "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();

      if (sortBy === "NEWEST") {
        if (timeA && timeB && timeA !== timeB) {
          return timeB - timeA;
        }
        return Number(b.id || 0) - Number(a.id || 0);
      }
      if (sortBy === "OLDEST") {
        if (timeA && timeB && timeA !== timeB) {
          return timeA - timeB;
        }
        return Number(a.id || 0) - Number(b.id || 0);
      }
      if (sortBy === "ACTION_AZ") {
        return (a.action || "").localeCompare(b.action || "");
      }
      if (sortBy === "ACTOR_AZ") {
        return (a.performedBy || "").localeCompare(b.performedBy || "");
      }
      return 0;
    });
  }, [activities, search, activeTab, actionFilter, statusFilter, sortBy]);

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
    <div className="space-y-6 text-foreground min-h-screen pb-12">
      {/* Title & Header */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Member 3 — Audit Trail & Governance
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            Admin Activity & Audit Trail
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time audit records of administrative operations, fleet modifications, verification reviews, and user status toggles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadActivities(true)}
          disabled={refreshing || loading}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60 shadow-2xs"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <SummaryCard
          title="Total Audit Logs"
          count={counts.total}
          active={activeTab === "ALL"}
          onClick={() => handleTabChange("ALL")}
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
        />
        <SummaryCard
          title="User Governance"
          count={counts.userActions}
          active={activeTab === "USER"}
          onClick={() => handleTabChange("USER")}
          icon={<UserCheck className="h-4 w-4 text-blue-500" />}
          badgeClass="bg-blue-500/10 text-blue-500"
        />
        <SummaryCard
          title="Fleet Operations"
          count={counts.fleetActions}
          active={activeTab === "BIKE"}
          onClick={() => handleTabChange("BIKE")}
          icon={<Bike className="h-4 w-4 text-emerald-500" />}
          badgeClass="bg-emerald-500/10 text-emerald-500"
        />
        <SummaryCard
          title="Verification Reviews"
          count={counts.verificationActions}
          active={activeTab === "VERIFICATION"}
          onClick={() => handleTabChange("VERIFICATION")}
          icon={<BadgeCheck className="h-4 w-4 text-amber-500" />}
          badgeClass="bg-amber-500/10 text-amber-500"
        />
        <SummaryCard
          title="Success / Logged"
          count={counts.successLogs}
          active={false}
          onClick={() => {}}
          icon={<CheckCircle2 className="h-4 w-4 text-purple-500" />}
          badgeClass="bg-purple-500/10 text-purple-500"
        />
      </div>

      {/* Navigation Tabs & Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {[
            { id: "ALL", label: `All Events (${counts.total})` },
            { id: "USER", label: `User Actions (${counts.userActions})` },
            { id: "BIKE", label: `Fleet Operations (${counts.fleetActions})` },
            { id: "VERIFICATION", label: `Verification Reviews (${counts.verificationActions})` },
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

        {/* Search & Select Filters */}
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
              placeholder="Search action, actor, target ID, details..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start sm:justify-end">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Action Scope Dropdown */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer"
            >
              <option value="ALL">Category: All</option>
              <option value="USER">User Operations</option>
              <option value="BIKE">Fleet Operations</option>
              <option value="VERIFICATION">Verification Reviews</option>
              <option value="USER_ACTIVATED">User Activated</option>
              <option value="USER_DEACTIVATED">User Deactivated</option>
              <option value="BIKE_STATUS_CHANGED">Bike Status Changed</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>

            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold w-full sm:w-auto sm:pl-2 sm:border-l sm:border-border">
              <ArrowUpDown className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer font-medium ml-1"
              >
                <option value="NEWEST">Newest Logs First</option>
                <option value="OLDEST">Oldest Logs First</option>
                <option value="ACTION_AZ">Action (A - Z)</option>
                <option value="ACTOR_AZ">Actor (A - Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Table Content */}
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
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[750px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 font-bold text-muted-foreground">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Summary Description</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Audit Detail</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActivities.length > 0 ? (
                  paginatedActivities.map((item, index) => (
                    <tr
                      key={item.id ?? index}
                      className="border-b border-border last:border-0 hover:bg-muted/15 transition-colors"
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
                          <Activity className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="font-mono text-xs">{item.action || "ADMIN_ACTION"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-semibold">
                        <span className="inline-block bg-muted/60 text-foreground px-2 py-0.5 rounded text-[11px]">
                          {item.performedBy || "Administrator"}
                        </span>
                      </td>
                      <td className="p-4">
                        {item.targetType ? (
                          <span className="inline-block bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                            {item.targetType} {item.targetId != null ? `#${item.targetId}` : ""}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">—</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground max-w-sm truncate font-medium">
                        {item.details || "—"}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
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
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDetailActivity(item)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                      <div className="mx-auto flex flex-col items-center justify-center space-y-2">
                        <Activity className="h-9 w-9 text-muted-foreground/40" />
                        <p className="text-sm font-bold text-foreground">
                          {search
                            ? "No matching audit log records found."
                            : "No administrative activities recorded yet."}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {search
                            ? "Try adjusting your search query or reset filters."
                            : "Administrative events and audit trails will appear here in real-time as actions occur."}
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

      {/* Detail Inspection Modal */}
      {detailActivity && (
        <AdminDetailModal
          isOpen={!!detailActivity}
          title={detailActivity.action || "Audit Event Detail"}
          subtitle={`Audit Record ID #${detailActivity.id ?? "N/A"}`}
          badges={
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                detailActivity.status?.toUpperCase() === "SUCCESS"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {detailActivity.status || "LOGGED"}
            </span>
          }
          items={[
            { label: "Action Type", value: detailActivity.action || "N/A" },
            { label: "Performed By (Actor)", value: detailActivity.performedBy || "System Administrator" },
            { label: "Target Entity Type", value: detailActivity.targetType || "System" },
            { label: "Target Record ID", value: detailActivity.targetId != null ? `#${detailActivity.targetId}` : "—" },
            {
              label: "Timestamp",
              value: detailActivity.timestamp ? new Date(detailActivity.timestamp).toLocaleString("en-IN") : "—",
            },
            { label: "Event Details / Payload", value: detailActivity.details || "No additional metadata recorded." },
          ]}
          onClose={() => setDetailActivity(null)}
        />
      )}
    </div>
  );
}
