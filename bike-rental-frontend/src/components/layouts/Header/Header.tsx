import { Menu } from "lucide-react";
import HeaderActions from "./HeaderActions";
import Breadcrumb from "./Breadcrumb";
import HeaderSearch from "./HeaderSearch";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 sm:bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="flex h-14 sm:h-16 items-center justify-between gap-1.5 sm:gap-4 px-2.5 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu Trigger + Title & Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial overflow-hidden">
          {/* Hamburger button visible only on mobile/tablet (< lg) */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-xl p-2 sm:p-2.5 shrink-0 hover:bg-accent text-muted-foreground hover:text-foreground lg:hidden transition-colors duration-200 outline-none focus:ring-2 focus:ring-ring"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex flex-col text-left min-w-0 flex-1 overflow-hidden">
            <h1 className="text-sm sm:text-base font-bold text-foreground leading-tight hidden sm:block truncate">
              {title}
            </h1>
            <div className="sm:mt-0.5 min-w-0 overflow-hidden">
              <Breadcrumb />
            </div>
          </div>
        </div>

        {/* Center: Search Box - hidden on mobile/tablet */}
        <div className="hidden md:flex flex-1 justify-center max-w-xs lg:max-w-sm px-2">
          <HeaderSearch />
        </div>

        {/* Right Side: Quick Actions (Theme, Notification, Profile) */}
        <div className="shrink-0">
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}