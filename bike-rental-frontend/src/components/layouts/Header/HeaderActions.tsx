import ThemeToggle from "@/components/common/ThemeToggle";
import HeaderNotification from "./HeaderNotification";
import HeaderProfile from "./HeaderProfile";

export default function HeaderActions() {
  return (
    <div className="flex items-center gap-2 sm:gap-3.5">
      {/* Hide full theme toggle control widget in tiny space but make it accessible */}
      <div className="scale-90 sm:scale-100">
        <ThemeToggle />
      </div>

      <HeaderNotification />

      <HeaderProfile />
    </div>
  );
}