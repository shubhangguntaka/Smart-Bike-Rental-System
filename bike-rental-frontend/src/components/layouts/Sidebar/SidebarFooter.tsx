import { LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface SidebarFooterProps {
  collapsed: boolean;
}

export default function SidebarFooter({ collapsed }: SidebarFooterProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  // Safe initials resolver
  const getInitials = () => {
    const f = typeof user.firstName === "string" ? user.firstName.trim() : "";
    const l = typeof user.lastName === "string" ? user.lastName.trim() : "";
    if (f || l) {
      return `${f[0] || ""}${l[0] || ""}`.toUpperCase();
    }
    const email = typeof user.email === "string" ? user.email.trim() : "";
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const initials = getInitials();

  return (
    <div className="border-t border-border p-4 transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        {/* User Card */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm border border-primary/20">
            {initials}
          </div>

          {!collapsed && (
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-xs font-bold text-foreground truncate">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Dashboard User"}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                {user.role}
              </span>
            </div>
          )}
        </div>

        {/* Logout Action */}
        {!collapsed && (
          <button
            onClick={handleLogout}
            className="rounded-xl p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-300 outline-none focus:ring-2 focus:ring-ring"
            aria-label="Logout"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center mt-3 pt-2 border-t border-border/40">
          <button
            onClick={handleLogout}
            className="rounded-xl p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-300 outline-none focus:ring-2 focus:ring-ring"
            aria-label="Logout"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
    </div>
  );
}
