import { Bell, Check, Bike, CreditCard, ShieldAlert } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "booking" | "payment" | "security";
}

export default function HeaderNotification() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Booking Confirmed",
      description: "Your bike reservation #1892 has been approved.",
      time: "5 mins ago",
      read: false,
      type: "booking",
    },
    {
      id: "2",
      title: "Payment Received",
      description: "Payment of $15.00 for last ride succeeded.",
      time: "2 hours ago",
      read: false,
      type: "payment",
    },
    {
      id: "3",
      title: "Security Verification",
      description: "Upload driver license to activate GPS ride tracking.",
      time: "1 day ago",
      read: true,
      type: "security",
    },
  ]);

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div className="relative z-45" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2.5 transition-all duration-300 hover:bg-accent text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Dashboard Notifications"
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
              <span className="font-bold text-foreground text-sm">Dashboard Alerts</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline outline-none"
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-border/60">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => toggleRead(n.id)}
                    className={`flex items-start gap-3.5 p-4 transition-colors duration-200 cursor-pointer hover:bg-accent/40 ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          n.type === "booking"
                            ? "bg-green-500/10 text-green-500"
                            : n.type === "security"
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {n.type === "booking" && <Bike className="h-4 w-4" />}
                        {n.type === "payment" && <CreditCard className="h-4 w-4" />}
                        {n.type === "security" && <ShieldAlert className="h-4 w-4" />}
                      </div>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold leading-none ${!n.read ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">
                        {n.description}
                      </p>
                    </div>

                    {!n.read && (
                      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No new dashboard alerts.
                </div>
              )}
            </div>

            <div className="border-t border-border px-5 py-3 text-center bg-muted/10">
              <button className="text-xs font-semibold text-primary hover:underline w-full">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
