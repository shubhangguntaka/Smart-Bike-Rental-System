import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "@/hooks/useNotification";
import type { SidebarSubItem } from "@/constants/layout";

interface SidebarItemProps {
  item: {
    label: string;
    path: string;
    icon: LucideIcon;
    children?: SidebarSubItem[];
  };
  collapsed: boolean;
  onNavigate?: () => void;
}

export default function SidebarItem({ item, collapsed, onNavigate }: SidebarItemProps) {
  const Icon = item.icon;
  const location = useLocation();
  const { unreadCount } = useNotification();
  const isNotifications = item.label.toLowerCase() === "notifications";

  const hasChildren = Boolean(item.children && item.children.length > 0);

  // Check if any child path matches the current URL
  const isChildActive = hasChildren && (
    item.children?.some(
      (child) => location.pathname === child.path || (child.path !== "/" && location.pathname.startsWith(child.path))
    ) ?? false
  );

  const isParentActive = location.pathname === item.path;

  // Dropdown open state
  const [isOpen, setIsOpen] = useState<boolean>(() => isChildActive || isParentActive);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (isChildActive || isParentActive) {
      setIsOpen(true);
    }
  }, [location.pathname, isChildActive, isParentActive]);

  // Handle parent click
  const handleParentClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      if (!collapsed) {
        setIsOpen((prev) => !prev);
      }
    } else {
      if (onNavigate) onNavigate();
    }
  };

  // If item has children, render dropdown accordion
  if (hasChildren) {
    return (
      <div
        className="relative select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Parent Header Button */}
        <button
          type="button"
          onClick={handleParentClick}
          className={`group relative flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${
            isChildActive || isParentActive
              ? "text-primary bg-primary/10 font-bold"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          }`}
        >
          <div className="relative">
            <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
              isChildActive || isParentActive ? "text-primary" : ""
            }`} />
          </div>

          {!collapsed && (
            <>
              <span className="truncate text-left flex-1">{item.label}</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-foreground" : ""
                }`}
              />
            </>
          )}

          {/* Collapsed floating tooltip & popup submenu */}
          {collapsed && isHovered && (
            <div className="absolute left-full ml-3 top-0 z-50 min-w-48 rounded-2xl bg-card border border-border p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-xs font-bold text-foreground border-b border-border mb-1">
                {item.label}
              </div>
              <div className="space-y-1">
                {item.children?.map((child) => {
                  const ChildIcon = child.icon;
                  const isCurrent = location.pathname === child.path;
                  return (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      onClick={onNavigate}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition ${
                        isCurrent
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {ChildIcon && <ChildIcon className="h-3.5 w-3.5" />}
                      <span>{child.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </button>

        {/* Submenu Accordion when expanded */}
        {!collapsed && (
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="ml-5 pl-3 border-l border-border/80 my-1 space-y-1">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onNavigate}
                        end={child.path === item.path}
                        className={({ isActive }) =>
                          `group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-primary text-primary-foreground font-bold shadow-xs"
                              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                          }`
                        }
                      >
                        {ChildIcon && (
                          <ChildIcon className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  }

  // Standard non-dropdown SidebarItem
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isActive
            ? "text-primary-foreground bg-primary shadow-md shadow-primary/25"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative">
            <Icon className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-105" />
            {isNotifications && unreadCount > 0 && collapsed && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Label, hidden when collapsed */}
          {!collapsed && (
            <span className="truncate">
              {item.label}
            </span>
          )}

          {!collapsed && isNotifications && unreadCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground">
              {unreadCount}
            </span>
          )}

          {/* Active indicator dot when collapsed */}
          {collapsed && isActive && (
            <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
          )}

          {/* Collapsed Tooltip */}
          {collapsed && (
            <div className="pointer-events-none absolute left-full ml-4 z-50 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-semibold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100 whitespace-nowrap">
              {item.label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}