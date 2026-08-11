import {
  LayoutDashboard,
  Bike,
  CalendarDays,
  Users,
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
    icon: MapPin,
  },
  {
    label: "About",
    path: "/about",
    icon: Info,
  },
  {
    label: "Contact",
    path: "/contact",
    icon: Phone,
  },
];

/* ===========================
   Customer Sidebar
   =========================== */

export const CUSTOMER_SIDEBAR: SidebarSection[] = [
  {
    id: "general",
    title: "General",
    items: [
      {
        label: "Dashboard",
        path: "/customer/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Nearby Bikes",
        path: "/customer/nearby-bikes",
        icon: Compass,
      },
      {
        label: "Explore Map",
        path: "/customer/maps",
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
    id: "general",
    title: "General",
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
      {
        label: "Payments",
        path: "/owner/payments",
        icon: CreditCard,
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
      },
      {
        label: "Bikes",
        path: "/admin/bikes",
        icon: Bike,
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
    ],
  },
];