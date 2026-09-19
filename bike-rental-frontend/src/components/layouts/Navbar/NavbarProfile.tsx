import { User, Settings, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function NavbarProfile() {
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
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="rounded-xl bg-primary px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md hover:opacity-95 transition-all duration-300 outline-none cursor-pointer whitespace-nowrap"
        >
          Login
        </Link>
      </div>
    );
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

  // Role Badge Styles Map
  const roleStyles = {
    ADMIN: "bg-red-500/10 text-red-500 border border-red-500/20",
    OWNER: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    CUSTOMER: "bg-primary/10 text-primary border border-primary/20",
  };

  const activeRoleBadge = roleStyles[roleKey] || roleStyles.CUSTOMER;

  return (
    <div className="relative z-50" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2.5 rounded-xl p-1.5 transition-all duration-300 hover:bg-accent text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer group"
        aria-label="User profile menu"
        aria-expanded={open}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm border border-primary/20 group-hover:border-primary transition-colors duration-200">
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-bold text-foreground">
          {user.firstName || "Account"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            open ? "transform rotate-180 text-primary" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
            }}
            className="absolute right-0 mt-3.5 w-64 rounded-2xl border border-border bg-card shadow-xl overflow-hidden focus:outline-none"
          >
            {/* Header info */}
            <div className="border-b border-border px-5 py-4 bg-muted/10">
              <p className="text-sm font-bold text-foreground truncate">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Active User"}
              </p>
              <p className="text-xs text-muted-foreground truncate mb-2">
                {user.email}
              </p>
              <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${activeRoleBadge}`}>
                {user.role}
              </span>
            </div>

            {/* Links section */}
            <div className="p-2 space-y-1">
              <Link
                to={dashboardPath}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent hover:text-primary transition-all duration-200 outline-none group"
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span>Dashboard</span>
              </Link>

              <Link
                to={`/${role}/profile`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent hover:text-primary transition-all duration-200 outline-none group"
              >
                <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span>Profile Info</span>
              </Link>

              <Link
                to={`/${role}/settings`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent hover:text-primary transition-all duration-200 outline-none group"
              >
                <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span>Settings</span>
              </Link>
            </div>

            {/* Logout button */}
            <div className="border-t border-border p-2 bg-muted/5">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-all duration-200 outline-none cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}