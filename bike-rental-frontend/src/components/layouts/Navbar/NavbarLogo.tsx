import { Bike } from "lucide-react";
import { Link } from "react-router-dom";

export default function NavbarLogo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3.5 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl group"
      aria-label="Smart Bike Rental Home"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20">
        <Bike className="h-6 w-6 animate-pulse" />
      </div>

      <div className="flex flex-col">
        <span className="text-base font-bold tracking-tight text-foreground sm:text-lg group-hover:text-primary transition-colors duration-300">
          Smart Bike Rental
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Live GPS Tracking
        </span>
      </div>
    </Link>
  );
}