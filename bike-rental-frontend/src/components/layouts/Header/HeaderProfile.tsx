import { User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function HeaderProfile() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  if (!isAuthenticated || !user) {
    return null; // Profile is only shown if authenticated inside dashboard
  }

  // Safely find dashboard path based on role
  const roleKey = (user.role || "CUSTOMER").toUpperCase() as "CUSTOMER" | "OWNER" | "ADMIN";
  const dashboardPath = ROUTES[roleKey]?.DASHBOARD || "/customer/dashboard";
  const role = (user.role || "CUSTOMER").toLowerCase();

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
    <div className="relative z-45" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 rounded-xl p-1 sm:p-1.5 transition-all duration-300 hover:bg-accent text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Dashboard user profile menu"
        aria-expanded={open}
      >
        <div className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-xs border border-primary/20">
          {initials}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-56 sm:w-60 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden focus:outline-none z-50"
          >
            <div className="border-b border-border px-4 py-3 sm:px-4.5 sm:py-3.5 bg-muted/20">
              <p className="text-sm font-bold text-foreground truncate">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Dashboard User"}
              </p>
              <p className="text-xs text-muted-foreground truncate mb-1">
                {user.email}
              </p>
              <span className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wider">
                {user.role}
              </span>
            </div>

            <div className="p-1 space-y-0.5">
              <Link
                to={dashboardPath}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors duration-200 outline-none"
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                Dashboard
              </Link>

              <Link
                to={`/${role}/profile`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors duration-200 outline-none"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Profile
              </Link>

              <Link
                to={`/${role}/settings`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors duration-200 outline-none"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </Link>
            </div>

            <div className="border-t border-border p-1">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors duration-200 outline-none cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
