import React from "react";
import { Eye, UserCheck, UserRound, UserX } from "lucide-react";

import type { UserAdmin } from "@/types/admin";

interface UserTableProps {
  users: UserAdmin[];
  loading?: boolean;
  onStatusAction?: (user: UserAdmin) => void;
  onViewDetails?: (user: UserAdmin) => void;
}

export default function UserTable({
  users,
  loading = false,
  onStatusAction,
  onViewDetails,
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
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[600px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20 font-semibold text-muted-foreground">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
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
                    className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary shrink-0">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.fullName || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-4 w-4" />
                          )}
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

                    <td className="p-4 text-muted-foreground font-mono">
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

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {onViewDetails && (
                          <button
                            type="button"
                            onClick={() => onViewDetails(user)}
                            className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
                            title="View user details"
                            aria-label="View user details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}

                        {isAdmin ? (
                          <span className="text-[10px] font-medium text-muted-foreground px-2.5 py-1.5 bg-muted/40 rounded-lg">
                            Protected
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onStatusAction?.(user)}
                            className={`rounded-xl border border-border p-2 transition cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center ${
                              isActive
                                ? "text-destructive hover:border-destructive hover:bg-destructive/5"
                                : "text-green-500 hover:border-green-500 hover:bg-green-500/5"
                            }`}
                            title={
                              isActive
                                ? "Deactivate account"
                                : "Activate account"
                            }
                            aria-label={
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
                      </div>
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