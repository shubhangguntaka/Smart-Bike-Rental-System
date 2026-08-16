import { Clock3, MapPinned } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";

export default function RouteInfoCard() {
  const { route } = useLocation();

  if (!route) return null;

  const distanceNum = typeof route.distance === "number" ? route.distance : (route.distance ? parseFloat(String(route.distance)) : NaN);
  const displayDistance = !isNaN(distanceNum) ? `${distanceNum.toFixed(2)} km` : "Distance calculated";

  return (
    <div
      className="
        absolute
        bottom-4
        right-4
        z-[1000]
        w-[180px]
        rounded-2xl
        bg-card/95
        backdrop-blur-md
        shadow-xl
        border
        border-border
        p-3.5
        space-y-3
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <span className="text-base">🏍️</span>
        <h2 className="text-xs font-bold text-foreground">Route Details</h2>
      </div>

      {/* Distance */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MapPinned size={15} />
        </div>
        <div>
          <p className="text-[10px] font-medium text-muted-foreground">Distance</p>
          <p className="text-xs font-bold text-foreground">{displayDistance}</p>
        </div>
      </div>

      {/* Estimated Time */}
      {route.duration && (
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock3 size={15} />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground">Estimated Time</p>
            <p className="text-xs font-bold text-foreground">{route.duration}</p>
          </div>
        </div>
      )}
    </div>
  );
}