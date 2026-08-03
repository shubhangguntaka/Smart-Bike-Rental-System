import { Menu, X, Bike } from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PUBLIC_NAVIGATION } from "@/constants/navigation";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Disable body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl p-2.5 transition-all duration-300 hover:bg-accent text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:hidden"
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border bg-background p-6 shadow-2xl lg:hidden focus:outline-none"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              <div className="flex items-center justify-between border-b border-border pb-5">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                    <Bike className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-foreground text-base">Smart Bike</span>
                </Link>

                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 transition hover:bg-accent text-muted-foreground hover:text-foreground outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 py-8 space-y-2">
                {PUBLIC_NAVIGATION.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 outline-none
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`
                    }
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Theme Settings Widget at the bottom */}
              <div className="border-t border-border pt-6 space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">
                  Theme Options
                </p>
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}