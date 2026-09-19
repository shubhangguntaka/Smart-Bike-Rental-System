import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpDown,
  BadgeCheck,
  Bike,
  Clock,
  CreditCard,
  Filter,
  RotateCcw,
  Search,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import toast from "react-hot-toast";

import { Pagination } from "@/components/common/Pagination";
import OwnerTable from "@/components/admin/OwnerTable";
import AdminDetailModal from "@/components/admin/AdminDetailModal";

import adminService from "@/services/adminService";
import type { OwnerAdmin } from "@/types/admin";

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

export default function AdminOwners() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [owners, setOwners] = useState<OwnerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters and tabs state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [kycFilter, setKycFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailOwner, setDetailOwner] = useState<OwnerAdmin | null>(null);

  // Sync URL search params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const qParam = searchParams.get("q");

    if (statusParam) {
      const upper = statusParam.toUpperCase();
      setStatusFilter(upper);
      setActiveTab(upper);
    }
    if (qParam) setSearch(qParam);
  }, [searchParams]);

  const loadOwners = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await adminService.getOwners();
      setOwners(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to load admin owners:", error);
      setOwners([]);
      toast.error(
        error?.response?.data?.message || "Unable to load owners."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOwners();
  }, [loadOwners]);

  // Compute counts
  const counts = useMemo(() => {
    const total = owners.length;
    const verified = owners.filter((o) => Boolean(o.verificationStatus)).length;
    const pendingKyc = total - verified;
    const active = owners.filter(
      (o) => o.status?.toUpperCase() === "ACTIVE"
    ).length;
    const inactive = total - active;
    const totalGrossEarnings = owners.reduce(
      (acc, o) => acc + Number(o.totalEarnings || 0),
      0
    );

    return { total, verified, pendingKyc, active, inactive, totalGrossEarnings };
  }, [owners]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);

    if (tabId === "VERIFIED") {
      setKycFilter("VERIFIED");
      setStatusFilter("ALL");
    } else if (tabId === "PENDING_KYC") {
      setKycFilter("PENDING");
      setStatusFilter("ALL");
    } else if (tabId === "ACTIVE") {
      setStatusFilter("ACTIVE");
      setKycFilter("ALL");
    } else if (tabId === "INACTIVE") {
      setStatusFilter("INACTIVE");
      setKycFilter("ALL");
    } else {
      setKycFilter("ALL");
      setStatusFilter("ALL");
    }
  };

  const filteredOwners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return owners.filter((owner) => {
      const isVerified = Boolean(owner.verificationStatus);
      const isActive = owner.status?.toUpperCase() === "ACTIVE";

      if (activeTab === "VERIFIED" && !isVerified) return false;
      if (activeTab === "PENDING_KYC" && isVerified) return false;
      if (activeTab === "ACTIVE" && !isActive) return false;
      if (activeTab === "INACTIVE" && isActive) return false;

      if (kycFilter === "VERIFIED" && !isVerified) return false;
      if (kycFilter === "PENDING" && isVerified) return false;

      if (statusFilter === "ACTIVE" && !isActive) return false;
      if (statusFilter === "INACTIVE" && isActive) return false;

      if (query) {
        const searchable = [
          owner.ownerName,
          owner.email,
          owner.phoneNumber,
          owner.status,
          String(owner.ownerId),
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
      if (sortBy === "NEWEST") {
        return (b.ownerId || 0) - (a.ownerId || 0);
      }
      if (sortBy === "OLDEST") {
        return (a.ownerId || 0) - (b.ownerId || 0);
      }
      if (sortBy === "EARNINGS_HIGH") {
        return Number(b.totalEarnings || 0) - Number(a.totalEarnings || 0);
      }
      if (sortBy === "EARNINGS_LOW") {
        return Number(a.totalEarnings || 0) - Number(b.totalEarnings || 0);
      }
      if (sortBy === "BIKES_HIGH") {
        return (b.totalBikes || 0) - (a.totalBikes || 0);
      }
      if (sortBy === "NAME_AZ") {
        return (a.ownerName || "").localeCompare(b.ownerName || "");
      }
      return 0;
    });
  }, [owners, search, activeTab, kycFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredOwners.length / PAGE_SIZE));
  const paginatedOwners = filteredOwners.slice(
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
            Member 3 — Owner & Partner Management
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            Bike Owner & Partner Management
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Audit partner accounts, registered fleet sizes, partner verification status, and cumulative gross earnings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadOwners(true)}
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
          title="Total Owners"
          count={counts.total}
          active={activeTab === "ALL"}
          onClick={() => handleTabChange("ALL")}
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <SummaryCard
          title="Verified Hosts"
          count={counts.verified}
          active={activeTab === "VERIFIED"}
          onClick={() => handleTabChange("VERIFIED")}
          icon={<BadgeCheck className="h-4 w-4 text-emerald-500" />}
          badgeClass="bg-emerald-500/10 text-emerald-500"
        />
        <SummaryCard
          title="Pending KYC"
          count={counts.pendingKyc}
          active={activeTab === "PENDING_KYC"}
          onClick={() => handleTabChange("PENDING_KYC")}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          badgeClass="bg-amber-500/10 text-amber-500"
        />
        <SummaryCard
          title="Active Accounts"
          count={counts.active}
          active={activeTab === "ACTIVE"}
          onClick={() => handleTabChange("ACTIVE")}
          icon={<UserCheck className="h-4 w-4 text-blue-500" />}
          badgeClass="bg-blue-500/10 text-blue-500"
        />
        <SummaryCard
          title="Gross Payouts"
          count={`₹${Number(counts.totalGrossEarnings).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
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
            { id: "ALL", label: `All Owners (${counts.total})` },
            { id: "VERIFIED", label: `Verified Hosts (${counts.verified})` },
            { id: "PENDING_KYC", label: `Pending KYC (${counts.pendingKyc})` },
            { id: "ACTIVE", label: `Active (${counts.active})` },
            { id: "INACTIVE", label: `Inactive (${counts.inactive})` },
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
              placeholder="Search owner name, email, phone, ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start sm:justify-end">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>
            <select
              value={kycFilter}
              onChange={(e) => {
                setKycFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer"
            >
              <option value="ALL">KYC: All</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending Review</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
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
                <option value="NEWEST">Newest Host First</option>
                <option value="OLDEST">Oldest Host First</option>
                <option value="EARNINGS_HIGH">Highest Earnings</option>
                <option value="EARNINGS_LOW">Lowest Earnings</option>
                <option value="BIKES_HIGH">Largest Fleet</option>
                <option value="NAME_AZ">Name (A - Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Table */}
      <OwnerTable
        owners={paginatedOwners}
        loading={loading}
        onViewDetails={setDetailOwner}
      />

      {filteredOwners.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      {/* Owner Details Modal */}
      {detailOwner && (
        <AdminDetailModal
          isOpen={!!detailOwner}
          title={detailOwner.ownerName || "Owner Details"}
          subtitle={`Owner ID #${detailOwner.ownerId}`}
          headerImage={detailOwner.profileImage}
          badges={
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                detailOwner.verificationStatus
                  ? "bg-green-500/10 text-green-500"
                  : "bg-amber-500/10 text-amber-500"
              }`}
            >
              {detailOwner.verificationStatus ? "VERIFIED HOST" : "KYC PENDING"}
            </span>
          }
          items={[
            { label: "Host / Owner Name", value: detailOwner.ownerName },
            { label: "Email Address", value: detailOwner.email },
            { label: "Phone Number", value: detailOwner.phoneNumber },
            { label: "Registered Fleet", value: `${detailOwner.totalBikes ?? 0} bikes listed` },
            { label: "Total Completed Rides", value: `${detailOwner.totalBookings ?? 0} bookings fulfilled` },
            {
              label: "Cumulative Gross Revenue",
              value: `₹${Number(detailOwner.totalEarnings ?? 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}`,
            },
            {
              label: "Account Status",
              value: (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    detailOwner.status?.toUpperCase() === "ACTIVE"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {detailOwner.status || "INACTIVE"}
                </span>
              ),
            },
          ]}
          onClose={() => setDetailOwner(null)}
        />
      )}
    </div>
  );
}