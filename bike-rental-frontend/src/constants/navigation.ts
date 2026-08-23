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
    label: "Contact",
    path: "/contact",
    icon: Phone,
  },
  {
    label: "About",
    path: "/about",
    icon: Info,
  }
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
        label: "Explore Bikes",
        path: "/customer/explore-bikes",
        icon: Bike,
      },
      {
        label: "Nearby Bikes",
        path: "/customer/nearby-bikes",
        icon: MapPin,
      },
      {
        label: "Bookings",
        path: "/customer/bookings",
        icon: CalendarDays,
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
        label: "Notifications",
        path: "/customer/notifications",
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
        path: "/customer/profile",
        icon: UserCircle,
      },
      {
        label: "Settings",
        path: "/customer/settings",
        icon: Settings,
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
        label: "Payments",
        path: "/owner/payments",
        icon: CreditCard,
      },
      {
        label: "Notifications",
        path: "/owner/notifications",
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
        path: "/owner/profile",
        icon: UserCircle,
      },
      {
        label: "Settings",
        path: "/owner/settings",
        icon: Settings,
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