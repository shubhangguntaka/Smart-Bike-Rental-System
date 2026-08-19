import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bike,
  CheckCircle2,
  Clock,
  Filter,
  RotateCcw,
  Search,
  ShieldAlert,
  Wrench,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { Pagination } from "@/components/common/Pagination";
import BikeTable from "@/components/admin/BikeTable";
import StatusActionModal from "@/components/admin/StatusActionModal";
import AdminDetailModal from "@/components/admin/AdminDetailModal";

import adminService from "@/services/adminService";
import type {
  AdminBikeStatus,
  BikeAdmin,
} from "@/types/admin";

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

export default function AdminBikes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bikes, setBikes] = useState<BikeAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter and tabs state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [actionBike, setActionBike] = useState<BikeAdmin | null>(null);
  const [detailBike, setDetailBike] = useState<BikeAdmin | null>(null);

  // Sync URL search params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const qParam = searchParams.get("q");

    if (statusParam) {
      setStatusFilter(statusParam.toUpperCase());
      setActiveTab(statusParam.toUpperCase());
    }
    if (qParam) setSearch(qParam);
  }, [searchParams]);

  const loadBikes = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await adminService.getBikes();
      setBikes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load admin bikes:", error);
      setBikes([]);
      toast.error("Unable to load bikes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleDeleteBike = async (bike: BikeAdmin) => {
    if (!window.confirm(`Are you sure you want to delete bike "${bike.bikeName || bike.bikeId}"?`)) return;
    try {
      setLoading(true);
      await adminService.deleteBike(bike.bikeId);
      toast.success(`Bike ${bike.bikeName || bike.bikeId} deleted successfully.`);
      void loadBikes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete bike.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBikes();
  }, [loadBikes]);

  // Compute counts
  const counts = useMemo(() => {
    const total = bikes.length;
    const available = bikes.filter((b) => b.bikeStatus?.toUpperCase() === "AVAILABLE").length;
    const booked = bikes.filter((b) => b.bikeStatus?.toUpperCase() === "BOOKED").length;
    const maintenance = bikes.filter((b) => b.bikeStatus?.toUpperCase() === "UNDER_MAINTENANCE").length;
    const notAvailable = bikes.filter((b) => b.bikeStatus?.toUpperCase() === "NOT_AVAILABLE").length;

    return { total, available, booked, maintenance, notAvailable };
  }, [bikes]);

  // Get distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    bikes.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [bikes]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);

    const nextParams = new URLSearchParams();
    if (search) nextParams.set("q", search);

    if (tabId !== "ALL") {
      setStatusFilter(tabId);
      nextParams.set("status", tabId);
    } else {
      setStatusFilter("ALL");
    }

    setSearchParams(nextParams, { replace: true });
  };

  const filteredBikes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bikes.filter((bike) => {
      const status = bike.bikeStatus?.toUpperCase() ?? "UNKNOWN";

      // Tab filter
      if (activeTab !== "ALL" && status !== activeTab) {
        return false;
      }

      // Dropdown Status filter
      if (statusFilter !== "ALL" && status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "ALL" && bike.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Search query
      if (query) {
        const searchable = [
          bike.bikeName,
          bike.brand,
          bike.model,
          bike.registrationNumber,
          bike.ownerName,
          bike.location,
          bike.category,
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
  }, [bikes, search, activeTab, statusFilter, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBikes.length / PAGE_SIZE)
  );

  const paginatedBikes = filteredBikes.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleStatusAction = async () => {
    if (!actionBike) return;

    const bikeId = actionBike.bikeId;
    const currentStatus = actionBike.bikeStatus?.toUpperCase();

    let nextStatus: AdminBikeStatus;

    if (currentStatus === "AVAILABLE") {
      nextStatus = "NOT_AVAILABLE";
    } else if (currentStatus === "NOT_AVAILABLE") {
      nextStatus = "AVAILABLE";
    } else {
      toast.error(`Bike with status ${currentStatus} cannot be modified directly.`);
      setActionBike(null);
      return;
    }

    try {
      setActionLoading(true);
      await adminService.updateBikeStatus(bikeId, nextStatus);
      await loadBikes();

      toast.success(
        nextStatus === "AVAILABLE"
          ? "Bike activated and listed as available for rent."
          : "Bike deactivated and removed from active rental fleet."
      );

      setActionBike(null);
    } catch (error: any) {
      console.error("Failed to update bike status:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update bike status.";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const bikeIsAvailable =
    actionBike?.bikeStatus?.toUpperCase() === "AVAILABLE";

  return (
    <div className="space-y-6 text-foreground min-h-screen pb-12">
      {/* Title & Header */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Member 3 — Global Fleet Operations
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            Global Fleet Administration
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Supervise rental vehicles, specifications, hub locations, owner assignments, and operational availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadBikes(true)}
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
          title="Total Fleet"
          count={counts.total}
          active={activeTab === "ALL"}
          onClick={() => handleTabChange("ALL")}
          icon={<Bike className="h-4 w-4 text-primary" />}
        />
        <SummaryCard
          title="Available Now"
          count={counts.available}
          active={activeTab === "AVAILABLE"}
          onClick={() => handleTabChange("AVAILABLE")}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          badgeClass="bg-emerald-500/10 text-emerald-500"
        />
        <SummaryCard
          title="In Rental"
          count={counts.booked}
          active={activeTab === "BOOKED"}
          onClick={() => handleTabChange("BOOKED")}
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          badgeClass="bg-blue-500/10 text-blue-500"
        />
        <SummaryCard
          title="Maintenance"
          count={counts.maintenance}
          active={activeTab === "UNDER_MAINTENANCE"}
          onClick={() => handleTabChange("UNDER_MAINTENANCE")}
          icon={<Wrench className="h-4 w-4 text-amber-500" />}
          badgeClass="bg-amber-500/10 text-amber-500"
        />
        <SummaryCard
          title="Unavailable"
          count={counts.notAvailable}
          active={activeTab === "NOT_AVAILABLE"}
          onClick={() => handleTabChange("NOT_AVAILABLE")}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          badgeClass="bg-destructive/10 text-destructive"
        />
      </div>

      {/* Navigation Tabs & Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {[
            { id: "ALL", label: `All Bikes (${counts.total})` },
            { id: "AVAILABLE", label: `Available (${counts.available})` },
            { id: "BOOKED", label: `In Rental (${counts.booked})` },
            { id: "UNDER_MAINTENANCE", label: `Maintenance (${counts.maintenance})` },
            { id: "NOT_AVAILABLE", label: `Unavailable (${counts.notAvailable})` },
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
              placeholder="Search bike name, brand, model, registration, owner, hub..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer"
            >
              <option value="ALL">Category: All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="AVAILABLE">Available</option>
              <option value="BOOKED">Booked</option>
              <option value="UNDER_MAINTENANCE">Maintenance</option>
              <option value="NOT_AVAILABLE">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bike Table */}
      <BikeTable
        bikes={paginatedBikes}
        loading={loading}
        onStatusAction={setActionBike}
        onViewDetails={setDetailBike}
      />

      {filteredBikes.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      {/* Confirmation Modal */}
      <StatusActionModal
        isOpen={!!actionBike}
        title={
          bikeIsAvailable
            ? "Deactivate Rental Bike"
            : "Activate Rental Bike"
        }
        description={
          actionBike
            ? bikeIsAvailable
              ? `Are you sure you want to deactivate ${
                  actionBike.bikeName || `Bike #${actionBike.bikeId}`
                }? It will not be bookable by customers.`
              : `Are you sure you want to activate ${
                  actionBike.bikeName || `Bike #${actionBike.bikeId}`
                }? It will be made available for rent.`
            : ""
        }
        actionLabel={
          bikeIsAvailable
            ? "Yes, Deactivate"
            : "Yes, Activate"
        }
        actionType={bikeIsAvailable ? "danger" : "success"}
        loading={actionLoading}
        onClose={() => setActionBike(null)}
        onConfirm={() => {
          void handleStatusAction();
        }}
      />

      {/* Bike Details Modal */}
      {detailBike && (
        <AdminDetailModal
          isOpen={!!detailBike}
          title={detailBike.bikeName || `${detailBike.brand || ""} ${detailBike.model || ""}`.trim() || "Bike Details"}
          subtitle={`Fleet Asset ID #${detailBike.bikeId}`}
          headerImage={detailBike.imageUrl}
          badges={
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                detailBike.bikeStatus?.toUpperCase() === "AVAILABLE"
                  ? "bg-green-500/10 text-green-500"
                  : detailBike.bikeStatus?.toUpperCase() === "BOOKED"
                  ? "bg-primary/10 text-primary"
                  : detailBike.bikeStatus?.toUpperCase() === "UNDER_MAINTENANCE"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {detailBike.bikeStatus || "UNKNOWN"}
            </span>
          }
          items={[
            { label: "Asset Name", value: detailBike.bikeName },
            { label: "Brand & Model", value: `${detailBike.brand || "—"} ${detailBike.model || ""}`.trim() },
            { label: "Category", value: detailBike.category || "Standard Commuter" },
            { label: "Registration No.", value: detailBike.registrationNumber || "Unregistered" },
            { label: "Assigned Owner", value: detailBike.ownerName || `Owner #${detailBike.ownerId ?? "—"}` },
            { label: "Station / Location", value: detailBike.location || "Hyderabad Central" },
            {
              label: "Rental Rate (Hourly)",
              value: detailBike.hourlyRate != null ? `₹${detailBike.hourlyRate} / hour` : "—",
            },
            {
              label: "Rental Rate (Daily)",
              value: detailBike.rentalPrice != null ? `₹${detailBike.rentalPrice} / day` : "—",
            },
            {
              label: "Fleet Status",
              value: (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    detailBike.bikeStatus?.toUpperCase() === "AVAILABLE"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {detailBike.bikeStatus || "NOT_AVAILABLE"}
                </span>
              ),
            },
          ]}
          onClose={() => setDetailBike(null)}
        />
      )}
    </div>
  );
}