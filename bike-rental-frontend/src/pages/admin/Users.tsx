import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { FilterBar } from "@/components/common/FilterBar";
import type { FilterField } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import toast from "react-hot-toast";

import UserTable from "@/components/admin/UserTable";
import StatusActionModal from "@/components/admin/StatusActionModal";

import adminService from "@/services/adminService";
import type { UserAdmin } from "@/types/admin";

const PAGE_SIZE = 5;

const FILTER_CONFIGS: FilterField[] = [
  {
    id: "role",
    label: "Role",
    type: "select",
    options: [
      { label: "Customer", value: "CUSTOMER" },
      { label: "Owner", value: "OWNER" },
      { label: "Admin", value: "ADMIN" },
    ],
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filters, setFilters] =
    useState<Record<string, any>>({});

  const [page, setPage] = useState(1);

  const [actionUser, setActionUser] =
    useState<UserAdmin | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await adminService.getUsers();

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Failed to load admin users:",
        error
      );

      setUsers([]);

      toast.error(
        "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
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

      if (
        filters.role &&
        user.role?.toUpperCase() !==
          String(filters.role).toUpperCase()
      ) {
        return false;
      }

      if (filters.status) {
        const isActive =
          Boolean(user.enabled) ||
          user.status?.toUpperCase() === "ACTIVE";

        const expectedActive =
          String(filters.status).toUpperCase() ===
          "ACTIVE";

        if (isActive !== expectedActive) {
          return false;
        }
      }

      return true;
    });
  }, [users, search, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length / PAGE_SIZE
    )
  );

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
    if (!actionUser) {
      return;
    }

    const role =
      actionUser.role?.toUpperCase();

    /*
     * Admin accounts must never be changed
     * through this management action.
     */
    if (role === "ADMIN") {
      toast.error(
        "Admin accounts cannot be activated or deactivated."
      );

      setActionUser(null);

      return;
    }

    const currentlyActive =
      Boolean(actionUser.enabled) ||
      actionUser.status?.toUpperCase() ===
        "ACTIVE";

    try {
      setActionLoading(true);

      const updatedUser =
        await adminService.updateUserStatus(
          actionUser.userId,
          !currentlyActive
        );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.userId === updatedUser.userId
            ? updatedUser
            : user
        )
      );

      toast.success(
        !currentlyActive
          ? "User activated successfully."
          : "User deactivated successfully."
      );

      setActionUser(null);
    } catch (error: any) {
      console.error(
        "Failed to update user status:",
        error
      );

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
    actionUser?.status?.toUpperCase() ===
      "ACTIVE";

  return (
    <div className="min-h-screen space-y-6 text-foreground">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold">
          User Management
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Manage customer, owner and administrative
          accounts.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search name, email, role..."
          width="max-w-md w-full"
        />

        <FilterBar
          filters={FILTER_CONFIGS}
          value={filters}
          onChange={(value) => {
            setFilters(value);
            setPage(1);
          }}
          onClearAll={() => {
            setFilters({});
            setPage(1);
          }}
        />
      </div>

      <UserTable
        users={paginatedUsers}
        loading={loading}
        onStatusAction={setActionUser}
      />

      {filteredUsers.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      <StatusActionModal
        isOpen={!!actionUser}
        title={
          userIsActive
            ? "Deactivate User"
            : "Activate User"
        }
        description={
          actionUser
            ? userIsActive
              ? `This will deactivate ${actionUser.fullName}'s account.`
              : `This will activate ${actionUser.fullName}'s account.`
            : ""
        }
        actionLabel={
          userIsActive
            ? "Yes, Deactivate"
            : "Yes, Activate"
        }
        actionType={
          userIsActive
            ? "danger"
            : "success"
        }
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
    </div>
  );
}