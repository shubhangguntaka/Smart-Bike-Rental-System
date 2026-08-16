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
    getNearbyBikes();
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
          rounded-xl
          border
          border-border
          bg-card
          px-3
          text-xs
          font-bold
          text-foreground
          shadow-md
          transition-all
          duration-200
          hover:bg-muted
          hover:text-primary
          active:scale-[0.98]
          cursor-pointer
        "
      >
        <LocateFixed
          size={16}
          strokeWidth={2}
          className="shrink-0 text-primary"
        />
        <span>Locate Me</span>
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
          rounded-xl
          border
          border-border
          bg-card
          px-3
          text-xs
          font-bold
          text-foreground
          shadow-md
          transition-all
          duration-200
          hover:bg-muted
          hover:text-primary
          active:scale-[0.98]
          cursor-pointer
        "
      >
        <RotateCw
          size={16}
          strokeWidth={2}
          className="shrink-0 text-primary"
        />
        <span>Refresh Bikes</span>
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
          rounded-xl
          border
          border-border
          bg-card
          px-3
          text-xs
          font-bold
          text-foreground
          shadow-md
          transition-all
          duration-200
          hover:bg-destructive/10
          hover:text-destructive
          active:scale-[0.98]
          cursor-pointer
        "
      >
        <XCircle
          size={16}
          strokeWidth={2}
          className="shrink-0 text-destructive"
        />
        <span>Clear Route</span>
      </button>

    </div>
  );
}