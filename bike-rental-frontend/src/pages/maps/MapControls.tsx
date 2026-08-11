import {
  LocateFixed,
  RotateCw,
  XCircle,
} from "lucide-react";

import { useLocation } from "@/hooks/useLocation";

export default function MapControls() {
  const {
    getCurrentLocation,
    getNearbyBikes,
    setRoute,
  } = useLocation();

  const handleRefresh = async () => {
    getCurrentLocation();
    
    setTimeout(() => {
      getNearbyBikes();
    }, 500);
  };

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">

      {/* Locate Me */}
      <button
        type="button"
        onClick={getCurrentLocation}
        className="
          flex
          h-10
          w-[150px]
          items-center
          gap-2.5
          rounded-lg
          border
          border-border
          bg-card
          px-3
          text-sm
          font-medium
          text-foreground
          shadow-md
          transition-all
          duration-200
          hover:bg-primary
          hover:text-white
          hover:shadow-lg
          active:scale-[0.98]
          cursor-pointer
        "
      >
        <LocateFixed
          size={18}
          strokeWidth={2}
          className="shrink-0"
        />

        <span>
          Locate Me
        </span>
      </button>

      {/* Refresh Bikes */}
      <button
        type="button"
        onClick={handleRefresh}
        className="
          flex
          h-10
          w-[150px]
          items-center
          gap-2.5
          rounded-lg
          border
          border-border
          bg-card
          px-3
          text-sm
          font-medium
          text-foreground
          shadow-md
          transition-all
          duration-200
          hover:bg-primary
          hover:text-white
          hover:text-primary
          hover:shadow-lg
          active:scale-[0.98]
          cursor-pointer
        "
      >
        <RotateCw
          size={18}
          strokeWidth={2}
          className="shrink-0"
        />

        <span>
          Refresh Bikes
        </span>
      </button>

      {/* Clear Route */}
      <button
        type="button"
        onClick={() => setRoute(null)}
        className="
          flex
          h-10
          w-[150px]
          items-center
          gap-2.5
          rounded-lg
          border
          border-border
          bg-card
          px-3
          text-sm
          font-medium
          text-foreground
          shadow-md
          transition-all
          duration-200
          hover:bg-destructive
          hover:text-white
          hover:text-destructive
          hover:shadow-lg
          active:scale-[0.98]
          cursor-pointer
        "
      >
        <XCircle
          size={18}
          strokeWidth={2}
          className="shrink-0"
        />

        <span>
          Clear Route
        </span>
      </button>

    </div>
  );
}