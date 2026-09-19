import { Bike } from "lucide-react";
import { Link } from "react-router-dom";

export default function NavbarLogo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 sm:gap-3.5 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl group min-w-0"
      aria-label="Smart Bike Rental Home"
    >
      <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20">
        <Bike className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-sm sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 truncate">
          Smart Bike Rental
        </span>
        <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate hidden xs:block">
          Live GPS Tracking
        </span>
      </div>
    </Link>
  );
}