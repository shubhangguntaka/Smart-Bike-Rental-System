import { X, Bike } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { SidebarSection as SidebarSectionType } from "@/constants/layout";
import SidebarSection from "./SidebarSection";
import SidebarFooter from "./SidebarFooter";

interface MobileSidebarProps {
  sections: SidebarSectionType[];
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ sections, open, onClose }: MobileSidebarProps) {
  // Prevent page scroll when sidebar is open
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
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed left-0 top-0 z-50 flex h-full w-full max-w-[280px] sm:w-72 flex-col border-r border-border bg-background shadow-2xl lg:hidden focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard Navigation Sidebar"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <Link to="/" onClick={onClose} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                  <Bike className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground leading-none">Smart Bike</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5 leading-none">Dashboard</span>
                </div>
              </Link>

              <button
                onClick={onClose}
                className="rounded-xl p-2 transition hover:bg-accent text-muted-foreground hover:text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Lists */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {sections.map((section) => (
                <SidebarSection
                  key={section.id || section.title}
                  section={section}
                  collapsed={false}
                  onNavigate={onClose}
                />
              ))}
            </div>

            {/* Footer Profile & Logout */}
            <SidebarFooter collapsed={false} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
