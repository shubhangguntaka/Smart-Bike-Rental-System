import ThemeToggle from "@/components/common/ThemeToggle";
import HeaderNotification from "./HeaderNotification";
import HeaderProfile from "./HeaderProfile";

export default function HeaderActions() {
  return (
    <div className="flex items-center gap-1 sm:gap-2.5 md:gap-3.5">
      {/* Theme toggle control widget */}
      <div className="flex items-center">
        <ThemeToggle />
      </div>

      <HeaderNotification />

      <HeaderProfile />
    </div>
  );
}