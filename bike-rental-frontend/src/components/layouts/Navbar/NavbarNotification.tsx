import { Bell, Check, Bike, CreditCard, ShieldAlert, Navigation, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "@/hooks/useNotification";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Notification } from "@/types/notification";

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "just now";
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
};

export default function NavbarNotification() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead
  } = useNotification();

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleMarkAllAsRead = async () => {
    const unreadList = notifications.filter((n) => !n.isRead);
    for (const n of unreadList) {
      if (n.notificationId) {
        await markAsRead(n.notificationId, Number(user.id));
      }
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.notificationId) return;

    // Mark as read
    if (!n.isRead) {
      try {
        await markAsRead(n.notificationId, Number(user.id));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }

    setOpen(false);

    // Determine route based on notification type and title
    const type = (n.notificationType || "").toUpperCase();
    const title = (n.title || "").toUpperCase();
    const role = (user.role || "CUSTOMER").toUpperCase();

    if (type === "BOOKING" || title.includes("BOOKING")) {
      if (role === "OWNER") {
        navigate("/owner/bookings");
      } else {
        navigate("/customer/bookings");
      }
    } else if (type === "PAYMENT" || title.includes("PAYMENT")) {
      if (role === "OWNER") {
        navigate("/owner/payments");
      } else {
        navigate("/customer/bookings");
      }
    } else if (
      type === "VERIFICATION" ||
      type === "BIKE_RC" ||
      title.includes("VERIFICATION") ||
      title.includes("RC")
    ) {
      if (role === "OWNER") {
        navigate("/owner/profile");
      } else {
        navigate("/customer/profile");
      }
    } else if (type === "RIDE" || title.includes("RIDE")) {
      if (role === "OWNER") {
        navigate("/owner/bookings");
      } else {
        navigate("/customer/bookings");
      }
    }
  };

  const getNotificationIconAndStyle = (type?: string) => {
    const t = (type || "").toUpperCase();
    if (t === "BOOKING") {
      return {
        icon: <Bike className="h-4 w-4" />,
        style: "bg-green-500/10 text-green-500",
      };
    }
    if (t === "PAYMENT") {
      return {
        icon: <CreditCard className="h-4 w-4" />,
        style: "bg-blue-500/10 text-blue-500",
      };
    }
    if (t === "VERIFICATION" || t === "BIKE_RC") {
      return {
        icon: <ShieldAlert className="h-4 w-4" />,
        style: "bg-rose-500/10 text-rose-500",
      };
    }
    if (t === "RIDE") {
      return {
        icon: <Navigation className="h-4 w-4" />,
        style: "bg-amber-500/10 text-amber-500",
      };
    }
    return {
      icon: <Bell className="h-4 w-4" />,
      style: "bg-primary/10 text-primary",
    };
  };

  return (
    <div className="relative z-50" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2.5 transition-all duration-300 hover:bg-accent text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        aria-label="Notifications Dropdown"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-3.5 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-xl overflow-hidden focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
              <span className="font-bold text-foreground text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline outline-none cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  Clear All
                </button>
              )}
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-border/60">
              {loading && unreadNotifications.length === 0 ? (
                <div className="p-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading alerts...</span>
                </div>
              ) : error ? (
                <div className="p-6 text-center space-y-2">
                  <p className="text-xs text-destructive font-semibold">{error}</p>
                  <button
                    onClick={() => user && refreshNotifications(Number(user.id))}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : unreadNotifications.length > 0 ? (
                unreadNotifications.map((n) => {
                  const { icon, style } = getNotificationIconAndStyle(n.notificationType);
                  return (
                    <div
                      key={n.notificationId}
                      onClick={() => handleNotificationClick(n)}
                      className={`flex items-start gap-3 p-4 transition-colors duration-200 cursor-pointer hover:bg-accent/40 ${
                        !n.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${style}`}
                        >
                          {icon}
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-semibold leading-none ${
                              !n.isRead ? "text-foreground font-bold" : "text-muted-foreground"
                            }`}
                          >
                            {n.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-normal">
                          {n.message}
                        </p>
                      </div>

                      {!n.isRead && (
                        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No new notifications.
                </div>
              )}
            </div>

            <div className="border-t border-border px-5 py-3 text-center bg-muted/10">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate(`/${(user?.role || "CUSTOMER").toLowerCase()}/notification`);
                }}
                className="text-xs font-semibold text-primary hover:underline w-full cursor-pointer"
              >
                View all activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}