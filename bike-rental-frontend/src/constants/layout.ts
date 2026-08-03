import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/* ===========================
   Navigation
=========================== */

export interface NavigationItem {
  label: string;
  path: string;
  icon?: LucideIcon;
}

/* ===========================
   Sidebar
=========================== */

export interface SidebarItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  collapsed?: boolean;
}

/* ===========================
   Header
=========================== */

export interface HeaderProps {
  title?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}

/* ===========================
   Footer
=========================== */

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

/* ===========================
   Layouts
=========================== */

export interface LayoutProps {
  children?: ReactNode;
}

/* ===========================
   Breadcrumb
=========================== */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}