import {
  LayoutDashboard,
  Bike,
  CalendarDays,
  Users,
  UserRound,
  UserRoundCog,
  CreditCard,
  Settings,
  UserCircle,
  ShieldCheck,
  Home,
  Info,
  Phone,
  TestTube2Icon,
  FileText,
  MapPin,
  Compass,
  QrCode,
  Bell,
  Activity,
  BarChart3,
} from "lucide-react";
import type { SidebarSection } from "./layout";

/* ===========================
   Public Navigation
   =========================== */

export const PUBLIC_NAVIGATION = [
  {
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    label: "Nearby Bikes",
    path: "/nearby-bikes",
    icon: Bike,
  },
  {
    label: "Explore Map",
    path: "/maps",
    icon: Compass,
  },
  {
    label: "Pricing & Plans",
    path: "/pricing",
    icon: FileText,
  },
  {
    label: "Find Hubs",
    path: "/stations",
    icon: MapPin,
  },
  {
    label: "Contact Support",
    path: "/contact",
    icon: Phone,
  },
];

/* ===========================
   Customer Sidebar
   =========================== */

export const CUSTOMER_SIDEBAR: SidebarSection[] = [
  {
    id: "main",
    title: "Main",
    items: [
      {
        label: "Dashboard",
        path: "/customer/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Bookings",
        path: "/customer/bookings",
        icon: CalendarDays,
      },
      {
        label: "Explore Bikes",
        path: "/customer/explore",
        icon: Bike,
      },
      {
        label: "Nearby Stations",
        path: "/customer/stations",
        icon: MapPin,
      },
      {
        label: "Scan QR",
        path: "/customer/scan-qr",
        icon: QrCode,
      },
    ],
  },
  {
    id: "finance",
    title: "Finance & Alerts",
    items: [
      {
        label: "Payments",
        path: "/customer/payments",
        icon: CreditCard,
      },
      {
        label: "Verification",
        path: "/customer/verification",
        icon: ShieldCheck,
      },
      {
        label: "Notifications",
        path: "/customer/notification",
        icon: Bell,
      },
    ],
  },
];

/* ===========================
   Bike Owner Sidebar
   =========================== */

export const OWNER_SIDEBAR: SidebarSection[] = [
  {
    id: "main",
    title: "Main",
    items: [
      {
        label: "Dashboard",
        path: "/owner/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "My Bikes",
        path: "/owner/bikes",
        icon: Bike,
      },
      {
        label: "Bookings",
        path: "/owner/bookings",
        icon: CalendarDays,
      },
    ],
  },
  {
    id: "finance",
    title: "Finance & Alerts",
    items: [
      {
        label: "Earnings",
        path: "/owner/earnings",
        icon: CreditCard,
      },
      {
        label: "Verification",
        path: "/owner/verification",
        icon: ShieldCheck,
      },
      {
        label: "Notifications",
        path: "/owner/notification",
        icon: Bell,
      },
    ],
  },
];

/* ===========================
   Admin Sidebar
   =========================== */

export const ADMIN_SIDEBAR: SidebarSection[] = [
  {
    id: "management",
    title: "Management",
    items: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Users",
        path: "/admin/users",
        icon: Users,
        children: [
          {
            label: "All Users",
            path: "/admin/users",
            icon: Users,
          },
          {
            label: "Customers",
            path: "/admin/customers",
            icon: UserRound,
          },
          {
            label: "Owners",
            path: "/admin/owners",
            icon: UserRoundCog,
          },
        ],
      },
      {
        label: "Bikes",
        path: "/admin/bikes",
        icon: Bike,
      },
      {
        label: "Bookings",
        path: "/admin/bookings",
        icon: CalendarDays,
      },
      {
        label: "Payments",
        path: "/admin/payments",
        icon: CreditCard,
      },
      {
        label: "Verification",
        path: "/admin/verification",
        icon: ShieldCheck,
      },
      {
        label: "Reports",
        path: "/admin/reports",
        icon: BarChart3,
      },
      {
        label: "Activity Log",
        path: "/admin/activity",
        icon: Activity,
      },
      {
        label: "Notifications",
        path: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      {
        label: "Profile",
        path: "/admin/profile",
        icon: UserCircle,
      },
      {
        label: "Settings",
        path: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];