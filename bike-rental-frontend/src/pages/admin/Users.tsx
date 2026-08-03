import React, { useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import type { FilterField } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { ShieldAlert, UserX, UserCheck, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const MOCK_USERS = [
  { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", role: "CUSTOMER", status: "Active" },
  { id: 2, name: "Amit Kumar", email: "amit.kumar@yahoo.com", role: "OWNER", status: "Active" },
  { id: 3, name: "Priya Patel", email: "priya@gmail.com", role: "CUSTOMER", status: "Blocked" },
  { id: 4, name: "Vikram Singh", email: "vikram@outlook.com", role: "OWNER", status: "Active" },
  { id: 5, name: "Suresh Gupta", email: "suresh@admin.com", role: "ADMIN", status: "Active" },
];

const FILTER_CONFIGS: FilterField[] = [
  {
    id: "role",
    label: "Role",
    type: "select",
    options: [
      { label: "Customer", value: "CUSTOMER" },
      { label: "Bike Owner", value: "OWNER" },
      { label: "Admin", value: "ADMIN" },
    ],
  },
  {
    id: "status",
    label: "Status",
    type: "radio",
    options: [
      { label: "Active", value: "Active" },
      { label: "Blocked", value: "Blocked" },
    ],
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [actionUser, setActionUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBlockUser = async () => {
    if (!actionUser) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setUsers(users.map((u) => {
      if (u.id === actionUser.id) {
        return { ...u, status: u.status === "Active" ? "Blocked" : "Active" };
      }
      return u;
    }));
    
    toast.success(`User ${actionUser.name} status updated successfully.`);
    setLoading(false);
    setActionUser(null);
  };

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.role && u.role !== filters.role) {
      return false;
    }
    if (filters.status && u.status !== filters.status) {
      return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * 5, page * 5);

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">User Management</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage platform accounts, security block status, and role privileges.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email..."
          width="max-w-md w-full"
        />
        <FilterBar
          filters={FILTER_CONFIGS}
          value={filters}
          onChange={setFilters}
          onClearAll={() => setFilters({})}
        />
      </div>

      {/* Table / List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/10 last:border-0">
                    <td className="p-4 font-bold text-foreground">{user.name}</td>
                    <td className="p-4 text-muted-foreground font-mono">{user.email}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          user.status === "Active"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActionUser(user)}
                        className={`p-2 rounded-xl border border-border cursor-pointer transition focus:outline-none ${
                          user.status === "Active"
                            ? "text-destructive hover:bg-destructive/5 hover:border-destructive"
                            : "text-green-500 hover:bg-green-500/5 hover:border-green-500"
                        }`}
                        title={user.status === "Active" ? "Block account" : "Unblock account"}
                      >
                        {user.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > 5 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filtered.length / 5)}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      {/* Confirmation Modal */}
      <Modal isOpen={!!actionUser} onClose={() => !loading && setActionUser(null)} size="sm">
        <ModalHeader onClose={() => !loading && setActionUser(null)}>
          {actionUser?.status === "Active" ? "Block User Account" : "Unblock User Account"}
        </ModalHeader>
        <ModalBody>
          {actionUser && (
            <div className="space-y-3.5 text-center py-4">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full mb-2 ${
                actionUser.status === "Active" ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"
              }`}>
                <ShieldAlert className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold">Are you absolutely sure?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {actionUser.status === "Active"
                  ? `This action will immediately disable login credentials for ${actionUser.name} and block any active booking sessions.`
                  : `This action will restore login access to the platform for ${actionUser.name}.`}
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter align="justify-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => setActionUser(null)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleBlockUser}
            className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl text-white transition-all cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-1.5 ${
              actionUser?.status === "Active" ? "bg-destructive hover:opacity-90" : "bg-green-500 hover:opacity-90"
            }`}
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            <span>{actionUser?.status === "Active" ? "Yes, Block Account" : "Yes, Restore Account"}</span>
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
