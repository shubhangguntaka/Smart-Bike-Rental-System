import { useState } from "react";
import { Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import {
  CUSTOMER_SIDEBAR,
  OWNER_SIDEBAR,
  ADMIN_SIDEBAR,
} from "@/constants/navigation";
import Sidebar from "@/components/layouts/Sidebar/Sidebar";
import MobileSidebar from "@/components/layouts/Sidebar/MobileSidebar";
import Header from "@/components/layouts/Header/Header";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  // Resolve sidebar navigation list by role
  const role = user?.role?.toUpperCase();
  const resolvedSections =
    role === "ADMIN"
      ? ADMIN_SIDEBAR
      : role === "OWNER"
      ? OWNER_SIDEBAR
      : CUSTOMER_SIDEBAR;

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Collapsible Sidebar for Desktop screens (>= lg) */}
      <Sidebar />

      {/* Slide-out Sidebar Drawer for Mobile screens (< lg) */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sections={resolvedSections}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header containing Hamburger trigger, Breadcrumbs, and Profile menu */}
        <Header title="Dashboard" onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}