import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import toast from "react-hot-toast";

import OwnerTable from "@/components/admin/OwnerTable";

import adminService from "@/services/adminService";
import type { OwnerAdmin } from "@/types/admin";

const PAGE_SIZE = 5;

export default function AdminOwners() {
  const [owners, setOwners] = useState<OwnerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadOwners = async () => {
      try {
        setLoading(true);

        const data = await adminService.getOwners();

        setOwners(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(
          "Failed to load admin owners:",
          error
        );

        setOwners([]);
        toast.error("Unable to load owners.");
      } finally {
        setLoading(false);
      }
    };

    void loadOwners();
  }, []);

  const filteredOwners = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return owners;
    }

    return owners.filter((owner) =>
      [
        owner.ownerName,
        owner.email,
        owner.status,
        String(owner.ownerId),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [owners, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOwners.length / PAGE_SIZE)
  );

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
    <div className="min-h-screen space-y-6 text-foreground">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold">
          Owner Management
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Monitor owners, verification, fleet size,
          bookings and earnings.
        </p>
      </div>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search owner name, email..."
        width="max-w-md w-full"
      />

      <OwnerTable
        owners={paginatedOwners}
        loading={loading}
      />

      {filteredOwners.length > PAGE_SIZE && (
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