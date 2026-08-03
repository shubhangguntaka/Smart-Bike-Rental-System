import ThemeToggle from "@/components/common/ThemeToggle";
import MobileMenu from "./MobileMenu";
import NavbarNotification from "./NavbarNotification";
import NavbarProfile from "./NavbarProfile";

export default function NavbarActions() {
  return (
    <div className="flex items-center gap-2 sm:gap-3.5">
      {/* Search is positioned inside Navbar on Desktop, but let's keep Actions clean */}
      <div className="hidden md:block">
        <ThemeToggle />
      </div>

      <NavbarNotification />

      <NavbarProfile />

      <MobileMenu />
    </div>
  );
}