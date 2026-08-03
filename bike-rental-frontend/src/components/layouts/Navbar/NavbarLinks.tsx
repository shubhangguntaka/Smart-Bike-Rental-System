import { NavLink } from "react-router-dom";
import { PUBLIC_NAVIGATION } from "@/constants/navigation";

export default function NavbarLinks() {
  return (
    <nav className="flex items-center gap-1.5" aria-label="Public Navigation">
      {PUBLIC_NAVIGATION.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${
              isActive
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`
          }
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
