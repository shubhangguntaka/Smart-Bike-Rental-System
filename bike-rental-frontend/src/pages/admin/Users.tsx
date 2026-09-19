import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpDown,
  Filter,
  Layers,
  RotateCcw,
  Search,
  UserCheck,
  UserRound,
  UserRoundCog,
  Users,
  UserX,
} from "lucide-react";
import toast from "react-hot-toast";

import { Pagination } from "@/components/common/Pagination";
import UserTable from "@/components/admin/UserTable";
import StatusActionModal from "@/components/admin/StatusActionModal";
import AdminDetailModal from "@/components/admin/AdminDetailModal";

import adminService from "@/services/adminService";
import type { UserAdmin } from "@/types/admin";

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

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [actionUser, setActionUser] = useState<UserAdmin | null>(null);
  const [detailUser, setDetailUser] = useState<UserAdmin | null>(null);

  // Sync URL query parameters
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const roleParam = searchParams.get("role");
    const qParam = searchParams.get("q");

    if (statusParam) {
      setStatusFilter(statusParam.toUpperCase());
      setActiveTab(statusParam.toUpperCase());
    }
    if (roleParam) setRoleFilter(roleParam.toUpperCase());
    if (qParam) setSearch(qParam);
  }, [searchParams]);

  const loadUsers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load admin users:", error);
      setUsers([]);
      toast.error("Unable to load users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // Compute counts
  const counts = useMemo(() => {
    const total = users.length;
    const active = users.filter(
      (u) => Boolean(u.enabled) || u.status?.toUpperCase() === "ACTIVE"
    ).length;
    const inactive = total - active;
    const customers = users.filter((u) => u.role?.toUpperCase() === "CUSTOMER").length;
    const owners = users.filter((u) => u.role?.toUpperCase() === "OWNER").length;
    const admins = users.filter((u) => u.role?.toUpperCase() === "ADMIN").length;

    return { total, active, inactive, customers, owners, admins };
  }, [users]);

  // Handle Tab Switch
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);

    const nextParams = new URLSearchParams();
    if (search) nextParams.set("q", search);
    if (roleFilter !== "ALL") nextParams.set("role", roleFilter);

    if (tabId === "ACTIVE") {
      setStatusFilter("ACTIVE");
      nextParams.set("status", "ACTIVE");
    } else if (tabId === "INACTIVE") {
      setStatusFilter("INACTIVE");
      nextParams.set("status", "INACTIVE");
    } else if (tabId === "CUSTOMER") {
      setRoleFilter("CUSTOMER");
      setStatusFilter("ALL");
      nextParams.set("role", "CUSTOMER");
    } else if (tabId === "OWNER") {
      setRoleFilter("OWNER");
      setStatusFilter("ALL");
      nextParams.set("role", "OWNER");
    } else {
      setStatusFilter("ALL");
      setRoleFilter("ALL");
    }

    setSearchParams(nextParams, { replace: true });
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      // Tab filter
      const isActive =
        Boolean(user.enabled) || user.status?.toUpperCase() === "ACTIVE";

      if (activeTab === "ACTIVE" && !isActive) return false;
      if (activeTab === "INACTIVE" && isActive) return false;
      if (activeTab === "CUSTOMER" && user.role?.toUpperCase() !== "CUSTOMER") return false;
      if (activeTab === "OWNER" && user.role?.toUpperCase() !== "OWNER") return false;
      if (activeTab === "ADMIN" && user.role?.toUpperCase() !== "ADMIN") return false;

      // Dropdown Role Filter
      if (roleFilter !== "ALL" && user.role?.toUpperCase() !== roleFilter.toUpperCase()) {
        return false;
      }

      // Dropdown Status Filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "ACTIVE" && !isActive) return false;
        if (statusFilter === "INACTIVE" && isActive) return false;
      }

      // Search text filter
      if (query) {
        const searchable = [
          user.fullName,
          user.email,
          user.phoneNumber,
          user.role,
          user.status,
          String(user.userId),
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
        return Number(b.userId || 0) - Number(a.userId || 0);
      }
      if (sortBy === "OLDEST") {
        return Number(a.userId || 0) - Number(b.userId || 0);
      }
      if (sortBy === "NAME_AZ") {
        return (a.fullName || "").localeCompare(b.fullName || "");
      }
      if (sortBy === "NAME_ZA") {
        return (b.fullName || "").localeCompare(a.fullName || "");
      }
      return Number(b.userId || 0) - Number(a.userId || 0);
    });
  }, [users, search, activeTab, roleFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleStatusAction = async () => {
    if (!actionUser) return;

    const role = actionUser.role?.toUpperCase();
    if (role === "ADMIN") {
      toast.error("Admin accounts cannot be activated or deactivated.");
      setActionUser(null);
      return;
    }

    const currentlyActive =
      Boolean(actionUser.enabled) || actionUser.status?.toUpperCase() === "ACTIVE";

    try {
      setActionLoading(true);
      const updatedUser = await adminService.updateUserStatus(
        actionUser.userId,
        !currentlyActive
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.userId === updatedUser.userId ? updatedUser : user
        )
      );

      toast.success(
        !currentlyActive
          ? "User account activated successfully."
          : "User account deactivated successfully."
      );
      setActionUser(null);
    } catch (error: any) {
      console.error("Failed to update user status:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update user status.";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const userIsActive =
    Boolean(actionUser?.enabled) ||
    actionUser?.status?.toUpperCase() === "ACTIVE";

  return (
    <div className="space-y-6 text-foreground min-h-screen pb-12">
      {/* Title & Header */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Member 3 — User Governance & Access Control
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            System User Administration
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage customer, bike owner, and administrative accounts, role privileges, and security activation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadUsers(true)}
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
          title="Total Users"
          count={counts.total}
          active={activeTab === "ALL"}
          onClick={() => handleTabChange("ALL")}
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <SummaryCard
          title="Active Accounts"
          count={counts.active}
          active={activeTab === "ACTIVE"}
          onClick={() => handleTabChange("ACTIVE")}
          icon={<UserCheck className="h-4 w-4 text-emerald-500" />}
          badgeClass="bg-emerald-500/10 text-emerald-500"
        />
        <SummaryCard
          title="Inactive Accounts"
          count={counts.inactive}
          active={activeTab === "INACTIVE"}
          onClick={() => handleTabChange("INACTIVE")}
          icon={<UserX className="h-4 w-4 text-destructive" />}
          badgeClass="bg-destructive/10 text-destructive"
        />
        <SummaryCard
          title="Customers"
          count={counts.customers}
          active={activeTab === "CUSTOMER"}
          onClick={() => handleTabChange("CUSTOMER")}
          icon={<UserRound className="h-4 w-4 text-blue-500" />}
          badgeClass="bg-blue-500/10 text-blue-500"
        />
        <SummaryCard
          title="Bike Owners"
          count={counts.owners}
          active={activeTab === "OWNER"}
          onClick={() => handleTabChange("OWNER")}
          icon={<UserRoundCog className="h-4 w-4 text-amber-500" />}
          badgeClass="bg-amber-500/10 text-amber-500"
        />
      </div>

      {/* Navigation Tabs & Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {[
            { id: "ALL", label: `All Users (${counts.total})` },
            { id: "ACTIVE", label: `Active (${counts.active})` },
            { id: "INACTIVE", label: `Inactive (${counts.inactive})` },
            { id: "CUSTOMER", label: `Customers (${counts.customers})` },
            { id: "OWNER", label: `Owners (${counts.owners})` },
            { id: "ADMIN", label: `Admins (${counts.admins})` },
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
              placeholder="Search by name, email, phone, ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start sm:justify-end">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-hidden text-foreground cursor-pointer"
            >
              <option value="ALL">Role: All</option>
              <option value="CUSTOMER">Customer</option>
              <option value="OWNER">Owner</option>
              <option value="ADMIN">Admin</option>
            </select>

            {/* Status Filter */}
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
                <option value="NAME_AZ">Name: A to Z</option>
                <option value="NAME_ZA">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <UserTable
        users={paginatedUsers}
        loading={loading}
        onStatusAction={setActionUser}
        onViewDetails={setDetailUser}
      />

      {filteredUsers.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      {/* Activation / Deactivation Confirmation */}
      <StatusActionModal
        isOpen={!!actionUser}
        title={userIsActive ? "Deactivate User Account" : "Activate User Account"}
        description={
          actionUser
            ? userIsActive
              ? `Are you sure you want to deactivate ${actionUser.fullName}'s account? They will not be able to log in.`
              : `Are you sure you want to activate ${actionUser.fullName}'s account?`
            : ""
        }
        actionLabel={userIsActive ? "Yes, Deactivate" : "Yes, Activate"}
        actionType={userIsActive ? "danger" : "success"}
        loading={actionLoading}
        onClose={() => {
          if (!actionLoading) {
            setActionUser(null);
          }
        }}
        onConfirm={() => {
          void handleStatusAction();
        }}
      />

      {/* User Details Modal */}
      {detailUser && (
        <AdminDetailModal
          isOpen={!!detailUser}
          title={detailUser.fullName || "User Details"}
          subtitle={`Account ID #${detailUser.userId}`}
          headerImage={detailUser.profileImage}
          badges={
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">
              {detailUser.role || "USER"}
            </span>
          }
          items={[
            { label: "Full Name", value: detailUser.fullName },
            { label: "Email Address", value: detailUser.email },
            { label: "Phone Number", value: detailUser.phoneNumber },
            { label: "Assigned Role", value: detailUser.role },
            {
              label: "Account Status",
              value: (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    Boolean(detailUser.enabled) || detailUser.status?.toUpperCase() === "ACTIVE"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {Boolean(detailUser.enabled) || detailUser.status?.toUpperCase() === "ACTIVE"
                    ? "ACTIVE"
                    : "INACTIVE"}
                </span>
              ),
            },
            {
              label: "Security Clearance",
              value:
                detailUser.role?.toUpperCase() === "ADMIN"
                  ? "Protected Root Access"
                  : "Standard Account",
            },
          ]}
          onClose={() => setDetailUser(null)}
        />
      )}
    </div>
  );
}