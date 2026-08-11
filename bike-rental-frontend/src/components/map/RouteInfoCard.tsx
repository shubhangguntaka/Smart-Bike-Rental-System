import { Clock3, MapPinned } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";

export default function RouteInfoCard() {
  const { route } = useLocation();

  if (!route) return null;

  return (
    <div
      className="
        absolute
        bottom-4
        right-4
        z-[1000]
        w-[170px]
        rounded-xl
        bg-card
        shadow-lg
        border
        border-border
        p-3
      "
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">
          🏍️
        </span>

        <h2 className="text-sm font-bold text-foreground">
          Route Details
        </h2>
      </div>

      {/* Distance */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <MapPinned
            size={17}
            className="text-primary"
          />
        </div>

        <div>
          <p className="text-[11px] text-muted-foreground">
            Distance
          </p>

          <p className="text-sm font-semibold text-foreground">
            {route.distance.toFixed(2)} km
          </p>
        </div>
      </div>

      {/* Estimated Time */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <Clock3
            size={17}
            className="text-primary"
          />
        </div>

        <div>
          <p className="text-[11px] text-muted-foreground">
            Estimated Time
          </p>

          <p className="text-sm font-semibold text-foreground">
            {route.duration}
          </p>
        </div>
      </div>
    </div>
  );
}