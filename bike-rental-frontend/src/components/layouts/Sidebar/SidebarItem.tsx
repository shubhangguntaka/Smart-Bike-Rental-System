import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  item: {
    label: string;
    path: string;
    icon: LucideIcon;
  };
  collapsed: boolean;
  onNavigate?: () => void;
}

export default function SidebarItem({ item, collapsed, onNavigate }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${
          isActive
            ? "text-primary-foreground bg-primary shadow-md shadow-primary/25"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-105" />

          {/* Label, hidden when collapsed */}
          {!collapsed && (
            <span className="truncate">
              {item.label}
            </span>
          )}

          {/* Active indicator dot (optional, when collapsed) */}
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