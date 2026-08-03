import { Bike } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarLogoProps {
  collapsed: boolean;
}

export default function SidebarLogo({ collapsed }: SidebarLogoProps) {
  return (
    <div className="flex h-16 items-center border-b border-border px-6 transition-all duration-300">
      <Link
        to="/"
        className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl group"
        aria-label="Smart Bike Rental Home"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-all duration-300 group-hover:scale-105">
          <Bike className="h-5 w-5" />
        </div>

        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary leading-none">
              Smart Bike
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5 leading-none">
              Dashboard
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
