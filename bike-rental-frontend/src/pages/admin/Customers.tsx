import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";

import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import CustomerTable from "@/components/admin/CustomerTable";
import StatusActionModal from "@/components/admin/StatusActionModal";

import adminService from "@/services/adminService";

import type { CustomerAdmin } from "@/types/admin";

const PAGE_SIZE = 5;

export default function AdminCustomers() {
  const [customers, setCustomers] =
    useState<CustomerAdmin[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [actionCustomer, setActionCustomer] =
    useState<CustomerAdmin | null>(null);

  const loadCustomers = useCallback(
    async () => {
      try {
        setLoading(true);

        const data =
          await adminService.getCustomers();

        setCustomers(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load customers:",
          error
        );

        setCustomers([]);

        toast.error(
          "Unable to load customers."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        [
          customer.customerName,
          customer.email,
          customer.phoneNumber,
          String(customer.customerId),
          customer.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
    );
  }, [customers, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length /
        PAGE_SIZE
    )
  );

  const paginatedCustomers =
    filteredCustomers.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleStatusAction =
    async () => {
      if (!actionCustomer) {
        return;
      }

      const customerId =
        actionCustomer.customerId;

      if (!Number.isFinite(customerId)) {
        toast.error(
          "Invalid customer ID."
        );

        setActionCustomer(null);
        return;
      }

      const isActive =
        actionCustomer.status?.toUpperCase() ===
        "ACTIVE";

      try {
        setActionLoading(true);

        /*
         * Customer accounts are user accounts.
         * Therefore the existing Admin user-status
         * endpoint is used.
         */
        await adminService.updateUserStatus(
          customerId,
          !isActive
        );

        toast.success(
          !isActive
            ? "Customer activated successfully."
            : "Customer deactivated successfully."
        );

        setActionCustomer(null);

        /*
         * Reload from backend after the update.
         * This guarantees the table displays the
         * persisted database state.
         */
        await loadCustomers();
      } catch (error: any) {
        console.error(
          "Failed to update customer status:",
          error
        );

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
    actionCustomer?.status?.toUpperCase() ===
    "ACTIVE";

  return (
    <div className="min-h-screen space-y-6 text-foreground">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold">
          Customer Management
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          View customer profiles, verification,
          booking activity and account status.
        </p>
      </div>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search customers, email, phone..."
        width="max-w-md w-full"
      />

      <CustomerTable
        customers={paginatedCustomers}
        loading={loading}
        onStatusAction={
          setActionCustomer
        }
      />

      {filteredCustomers.length >
        PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      <StatusActionModal
        isOpen={
          !!actionCustomer
        }
        title={
          customerIsActive
            ? "Deactivate Customer"
            : "Activate Customer"
        }
        description={
          actionCustomer
            ? customerIsActive
              ? `This will deactivate ${actionCustomer.customerName}'s account.`
              : `This will activate ${actionCustomer.customerName}'s account.`
            : ""
        }
        actionLabel={
          customerIsActive
            ? "Yes, Deactivate"
            : "Yes, Activate"
        }
        actionType={
          customerIsActive
            ? "danger"
            : "success"
        }
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
    </div>
  );
}