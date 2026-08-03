import NavbarLogo from "./NavbarLogo";
import NavbarSearch from "./NavbarSearch";
import NavbarActions from "./NavbarActions";
import NavbarLinks from "./NavbarLinks";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-45 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-8xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Branding Logo */}
        <div className="flex-shrink-0">
          <NavbarLogo />
        </div>

        {/* Center Public Navigation Links */}
        <div className="hidden lg:flex items-center justify-center">
          <NavbarLinks />
        </div>

        {/* Search Bar - hidden on mobile/tablet */}
        <div className="hidden xl:block w-72">
          <NavbarSearch />
        </div>

        {/* Right Actions Toggles & Buttons */}
        <NavbarActions />
      </div>
    </header>
  );
}