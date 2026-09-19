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
  Clock,
  Filter,
  RotateCcw,
  Search,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import toast from "react-hot-toast";

import { Pagination } from "@/components/common/Pagination";
import CustomerTable from "@/components/admin/CustomerTable";
import StatusActionModal from "@/components/admin/StatusActionModal";
import AdminDetailModal from "@/components/admin/AdminDetailModal";

import adminService from "@/services/adminService";
import type { CustomerAdmin } from "@/types/admin";

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

export default function AdminCustomers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<CustomerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [kycFilter, setKycFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [actionCustomer, setActionCustomer] = useState<CustomerAdmin | null>(null);
  const [detailCustomer, setDetailCustomer] = useState<CustomerAdmin | null>(null);

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

  const loadCustomers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await adminService.getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomers([]);
      toast.error("Unable to load customers.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const counts = useMemo(() => {
    const total = customers.length;
    const verified = customers.filter(
      (c) => Boolean(c.verificationStatus) || Boolean(c.aadhaarVerified && c.drivingLicenseVerified)
    ).length;
    const pendingKyc = total - verified;
    const active = customers.filter(
      (c) => c.status?.toUpperCase() === "ACTIVE"
    ).length;
    const inactive = total - active;

    return { total, verified, pendingKyc, active, inactive };
  }, [customers]);

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

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const isVerified =
        Boolean(customer.verificationStatus) ||
        Boolean(customer.aadhaarVerified && customer.drivingLicenseVerified);
      const isActive = customer.status?.toUpperCase() === "ACTIVE";

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
          customer.customerName,
          customer.email,
          customer.phoneNumber,
          String(customer.customerId),
          customer.status,
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
        return Number(b.customerId || 0) - Number(a.customerId || 0);
      }
      if (sortBy === "OLDEST") {
        return Number(a.customerId || 0) - Number(b.customerId || 0);
      }
      if (sortBy === "BOOKINGS_HIGH") {
        return Number(b.totalBookings ?? 0) - Number(a.totalBookings ?? 0);
      }
      if (sortBy === "SPENT_HIGH") {
        return Number(b.totalRentalAmount ?? 0) - Number(a.totalRentalAmount ?? 0);
      }
      if (sortBy === "NAME_AZ") {
        return (a.customerName || "").localeCompare(b.customerName || "");
      }
      return Number(b.customerId || 0) - Number(a.customerId || 0);
    });
  }, [customers, search, activeTab, kycFilter, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE)
  );

  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleStatusAction = async () => {
    if (!actionCustomer) {
      return;
    }

    const customerId = actionCustomer.customerId;

    if (!Number.isFinite(customerId)) {
      toast.error("Invalid customer ID.");
      setActionCustomer(null);
      return;
    }

    const isActive =
      actionCustomer.status?.toUpperCase() === "ACTIVE";

    try {
      setActionLoading(true);

      await adminService.updateUserStatus(customerId, !isActive);

      toast.success(
        !isActive
          ? "Customer activated successfully."
          : "Customer deactivated successfully."
      );

      setActionCustomer(null);
      await loadCustomers();
    } catch (error: any) {
      console.error("Failed to update customer status:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update customer status.";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const customerIsActive =
    actionCustomer?.status?.toUpperCase() === "ACTIVE";

  return (
    <div className="space-y-6 text-foreground min-h-screen pb-12">
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Member 3 — Customer Supervision & Compliance
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            Customer Account Management
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Supervise customer profiles, KYC compliance verification, booking histories, and rental expenditure.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadCustomers(true)}
          disabled={refreshing || loading}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <SummaryCard
          title="Total Customers"
          count={counts.total}
          active={activeTab === "ALL"}
          onClick={() => handleTabChange("ALL")}
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <SummaryCard
          title="Verified KYC"
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
          title="Inactive Accounts"
          count={counts.inactive}
          active={activeTab === "INACTIVE"}
          onClick={() => handleTabChange("INACTIVE")}
          icon={<UserX className="h-4 w-4 text-destructive" />}
          badgeClass="bg-destructive/10 text-destructive"
        />
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {[
            { id: "ALL", label: `All Customers (${counts.total})` },
            { id: "VERIFIED", label: `Verified KYC (${counts.verified})` },
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
              placeholder="Search customer name, email, phone, ID..."
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
                <option value="BOOKINGS_HIGH">Bookings: High to Low</option>
                <option value="SPENT_HIGH">Spent: High to Low</option>
                <option value="NAME_AZ">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <CustomerTable
        customers={paginatedCustomers}
        loading={loading}
        onStatusAction={setActionCustomer}
        onViewDetails={setDetailCustomer}
      />

      {filteredCustomers.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      <StatusActionModal
        isOpen={!!actionCustomer}
        title={
          customerIsActive
            ? "Deactivate Customer Account"
            : "Activate Customer Account"
        }
        description={
          actionCustomer
            ? customerIsActive
              ? `Are you sure you want to deactivate ${actionCustomer.customerName}'s account? They will not be able to book bikes.`
              : `Are you sure you want to activate ${actionCustomer.customerName}'s account?`
            : ""
        }
        actionLabel={customerIsActive ? "Yes, Deactivate" : "Yes, Activate"}
        actionType={customerIsActive ? "danger" : "success"}
        loading={actionLoading}
        onClose={() => {
          if (!actionLoading) {
            setActionCustomer(null);
          }
        }}
        onConfirm={() => {
          void handleStatusAction();
        }}
      />

      {detailCustomer && (
        <AdminDetailModal
          isOpen={!!detailCustomer}
          title={detailCustomer.customerName || "Customer Details"}
          subtitle={`Customer ID #${detailCustomer.customerId}`}
          headerImage={detailCustomer.profileImage}
          badges={
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                Boolean(detailCustomer.verificationStatus) ||
                Boolean(detailCustomer.aadhaarVerified && detailCustomer.drivingLicenseVerified)
                  ? "bg-green-500/10 text-green-500"
                  : "bg-amber-500/10 text-amber-500"
              }`}
            >
              {Boolean(detailCustomer.verificationStatus) ||
              Boolean(detailCustomer.aadhaarVerified && detailCustomer.drivingLicenseVerified)
                ? "KYC VERIFIED"
                : "KYC PENDING"}
            </span>
          }
          items={[
            { label: "Customer Name", value: detailCustomer.customerName },
            { label: "Email Address", value: detailCustomer.email },
            { label: "Phone Number", value: detailCustomer.phoneNumber },
            {
              label: "Aadhaar Card",
              value: detailCustomer.aadhaarVerified ? "Verified (UIDAI)" : "Pending / Not Uploaded",
            },
            {
              label: "Driving License",
              value: detailCustomer.drivingLicenseVerified ? "Verified (RTO)" : "Pending / Not Uploaded",
            },
            {
              label: "Lifetime Bookings",
              value: `${detailCustomer.totalBookings ?? 0} bookings (${detailCustomer.completedBookings ?? 0} completed, ${detailCustomer.cancelledBookings ?? 0} cancelled)`,
            },
            {
              label: "Total Rental Spend",
              value: `₹${Number(detailCustomer.totalRentalAmount ?? 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}`,
            },
            {
              label: "Account Status",
              value: (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    detailCustomer.status?.toUpperCase() === "ACTIVE"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {detailCustomer.status || "INACTIVE"}
                </span>
              ),
            },
            { label: "Total Bookings", value: `${detailCustomer.totalBookings ?? 0} bookings` },
            { label: "Completed Bookings", value: `${detailCustomer.completedBookings ?? 0} rides` },
            { label: "Cancelled Bookings", value: `${detailCustomer.cancelledBookings ?? 0} rides` },
            {
              label: "Total Platform Spend",
              value: `₹${Number(detailCustomer.totalRentalAmount ?? 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}`,
            },
          ]}
          onClose={() => setDetailCustomer(null)}
        />
      )}
    </div>
  );
}