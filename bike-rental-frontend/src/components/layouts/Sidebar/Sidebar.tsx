import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import {
  CUSTOMER_SIDEBAR,
  OWNER_SIDEBAR,
  ADMIN_SIDEBAR,
} from "@/constants/navigation";
import type { SidebarSection as SidebarSectionType } from "@/constants/layout";
import SidebarLogo from "./SidebarLogo";
import SidebarSection from "./SidebarSection";
import SidebarCollapse from "./SidebarCollapse";
import SidebarFooter from "./SidebarFooter";

interface SidebarProps {
  sections?: SidebarSectionType[];
}

export default function Sidebar({ sections }: SidebarProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  // Determine sections based on user role if not provided via props
  const role = user?.role?.toUpperCase();
  const resolvedSections =
    sections ||
    (role === "ADMIN"
      ? ADMIN_SIDEBAR
      : role === "OWNER"
      ? OWNER_SIDEBAR
      : CUSTOMER_SIDEBAR);

  return (
    <aside
      className={`hidden lg:flex h-screen flex-col border-r border-border bg-background transition-all duration-300 relative z-30 ${
        collapsed ? "w-20" : "w-70"
      }`}
    >
      {/* Sidebar Logo */}
      <SidebarLogo collapsed={collapsed} />

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 scrollbar-thin">
        {resolvedSections.map((section) => (
          <SidebarSection
            key={section.id || section.title}
            section={section}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Sidebar Footer profile / logout */}
      <SidebarFooter collapsed={collapsed} />

      {/* Collapse / Expand Toggle Button absolute position at bottom corner */}
      <div className="absolute bottom-16 -right-[18px] z-50">
        <SidebarCollapse
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>
    </aside>
  );
}