import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex min-w-0 max-w-full overflow-hidden" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-semibold text-muted-foreground min-w-0 overflow-hidden">
        <li className="shrink-0">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1"
          >
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const rawTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          let to = rawTo;
          const lowerVal = value.toLowerCase();
          if (lowerVal === "customer") to = "/customer/dashboard";
          else if (lowerVal === "owner") to = "/owner/dashboard";
          else if (lowerVal === "admin") to = "/admin/dashboard";

          const isLast = index === pathnames.length - 1;
          const formattedValue = value
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

          return (
            <li key={rawTo} className="flex items-center min-w-0">
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60 shrink-0" />
              {isLast ? (
                <span className="ml-1 sm:ml-2 font-bold text-foreground truncate max-w-[85px] xs:max-w-[130px] sm:max-w-[200px]">
                  {formattedValue}
                </span>
              ) : (
                <Link
                  to={to}
                  className="ml-1 sm:ml-2 hover:text-foreground transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md truncate max-w-[65px] xs:max-w-[95px] sm:max-w-[160px]"
                >
                  {formattedValue}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
