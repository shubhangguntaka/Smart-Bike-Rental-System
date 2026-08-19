import React from "react";
import { UserCheck, UserRound, UserX } from "lucide-react";

import type { UserAdmin } from "@/types/admin";

interface UserTableProps {
  users: UserAdmin[];
  loading?: boolean;
  onStatusAction?: (user: UserAdmin) => void;
}

export default function UserTable({
  users,
  loading = false,
  onStatusAction,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-xs text-muted-foreground">
          Loading users...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20 font-semibold text-muted-foreground">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user) => {
                const isAdmin =
                  user.role?.toUpperCase() === "ADMIN";

                const isActive =
                  user.enabled ||
                  user.status?.toUpperCase() === "ACTIVE";

                return (
                  <tr
                    key={user.userId}
                    className="border-b border-border last:border-0 hover:bg-muted/10"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserRound className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="font-bold text-foreground">
                            {user.fullName || "Unknown User"}
                          </p>

                          <p className="text-[10px] text-muted-foreground">
                            ID #{user.userId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {user.email || "—"}
                    </td>

                    <td className="p-4">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                        {user.role || "UNKNOWN"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? "bg-green-500/10 text-green-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {isAdmin ? (
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Protected
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onStatusAction?.(user)}
                          className={`rounded-xl border border-border p-2 transition ${
                            isActive
                              ? "text-destructive hover:border-destructive hover:bg-destructive/5"
                              : "text-green-500 hover:border-green-500 hover:bg-green-500/5"
                          }`}
                          title={
                            isActive
                              ? "Deactivate account"
                              : "Activate account"
                          }
                        >
                          {isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  No users matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}