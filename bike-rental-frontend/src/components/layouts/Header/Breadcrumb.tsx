import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-semibold text-muted-foreground">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const formattedValue = value
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

          return (
            <li key={to} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
              {isLast ? (
                <span className="ml-1.5 sm:ml-2 font-bold text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                  {formattedValue}
                </span>
              ) : (
                <Link
                  to={to}
                  className="ml-1.5 sm:ml-2 hover:text-foreground transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
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
