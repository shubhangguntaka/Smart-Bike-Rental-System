import { Bell, Check, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

export default function NavbarNotification() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "New Ride Available",
      description: "Electric bikes are ready at Station Center.",
      time: "2 mins ago",
      read: false,
      type: "success",
    },
    {
      id: "2",
      title: "GPS Status Normal",
      description: "Tracker pinging correctly for all rentals.",
      time: "1 hour ago",
      read: false,
      type: "info",
    },
    {
      id: "3",
      title: "Promo Code Active",
      description: "Use RIDE50 for 50% off your next booking.",
      time: "5 hours ago",
      read: true,
      type: "warning",
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
    <div className="relative z-50" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2.5 transition-all duration-300 hover:bg-accent text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className={`flex items-start gap-3 p-4 transition-colors duration-200 cursor-pointer hover:bg-accent/40 ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          n.type === "success"
                            ? "bg-green-500/10 text-green-500"
                            : n.type === "warning"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Info className="h-4 w-4" />
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
                  No new notifications.
                </div>
              )}
            </div>

            <div className="border-t border-border px-5 py-3 text-center bg-muted/10">
              <button className="text-xs font-semibold text-primary hover:underline w-full">
                View all activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}