import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { Bike } from "../../types/bike";
import BikeAvailability from "./BikeAvailability";
import { ROUTES } from "@/constants/routes";
import { format12Hour } from "@/utils/timeUtils";

interface BikeCardProps {
  bike: Bike;
  showOwnerActions?: boolean;
  onDelete?: (bikeId: number | string, bikeObj?: Bike) => void;
  onStatusToggle?: (bikeId: number, currentStatus: string) => void;
  onSetTiming?: (bike: Bike) => void;
  rating?: number;
}

const BikeCard = ({
  bike,
  showOwnerActions = false,
  onDelete,
  onStatusToggle,
  onSetTiming,
  rating,
}: BikeCardProps) => {
  const rcOk = Boolean(bike.rcVerified || bike.rcVerificationStatus);

  const imagesList = (
    bike.imageUrls && bike.imageUrls.length > 0
      ? bike.imageUrls
      : [bike.imageUrl]
  ).filter(Boolean);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const currentPhotoUrl =
    imagesList[currentIdx] ||
    bike.imageUrl ||
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-md hover:shadow-xl transition-all duration-300 group h-full">
      {/* Bike Image Showcase Header (Matching Customer Card h-48) */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <img
          src={
            currentPhotoUrl ||
            "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80"
          }
          alt={bike.bikeName}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80";
          }}
          onClick={() => setIsZoomOpen(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
        />

        {/* Top Left Live Availability Badge */}
        <div className="absolute top-3 left-3 z-10">
          <BikeAvailability
            status={bike.bikeStatus}
            availableStartTime={bike.availableStartTime}
            availableEndTime={bike.availableEndTime}
            availableDate={bike.availableDate}
            compact
          />
        </div>

        {/* Top Right RC Verification Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-md border border-border ${
              rcOk
                ? "bg-emerald-500/90 text-white"
                : "bg-amber-500/90 text-white"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {rcOk ? "RC Verified" : "RC Pending"}
          </span>
        </div>

        {/* Image Carousel Controls */}
        {imagesList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-md transition hover:bg-black/80 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-md transition hover:bg-black/80 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-md">
              {imagesList.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIdx ? "w-3 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-card p-3 shadow-2xl flex flex-col items-center border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhotoUrl}
              alt={bike.bikeName}
              className="max-h-[75vh] w-auto rounded-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Card Body (Matching Customer Card padding & layout) */}
      <div className="flex-1 p-5 space-y-3.5 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {bike.brand}
            </span>
            {typeof rating === "number" && (
              <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground leading-tight truncate">
              {bike.bikeName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reg: <span className="font-mono font-bold text-foreground">{bike.registrationNumber}</span>
            </p>
          </div>
        </div>

        {/* Operating Shift & Location Specs */}
        <div className="space-y-2 border-y border-border py-3 text-xs text-muted-foreground">
          {(bike.availableStartTime || bike.availableEndTime) && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                Shift: {format12Hour(bike.availableStartTime || "09:00")} –{" "}
                {format12Hour(bike.availableEndTime || "21:00")}
              </span>
            </div>
          )}

          {bike.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{bike.location}</span>
            </div>
          )}
        </div>

        {/* Footer Rate & Owner Action Buttons */}
        <div className="space-y-3 pt-1">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-extrabold text-foreground">
                ₹{(bike.hourlyRate || 80).toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-muted-foreground"> / hr</span>
            </div>
          </div>

          {showOwnerActions ? (
            <div className="flex items-center gap-1.5 pt-1">
              <Link
                to={ROUTES.OWNER.BIKE_DETAILS(bike.bikeId || bike.id!)}
                title="View details"
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                <Eye className="h-3.5 w-3.5 text-primary" />
                View
              </Link>

              <Link
                to={ROUTES.OWNER.EDIT_BIKE(bike.bikeId || bike.id!)}
                title="Edit bike"
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                <Pencil className="h-3.5 w-3.5 text-primary" />
                Edit
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (onSetTiming) {
                    onSetTiming(bike);
                  } else {
                    const targetId = Number(bike.bikeId || bike.id);
                    if (targetId) onStatusToggle?.(targetId, "AVAILABLE");
                  }
                }}
                title="Set shift timing"
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                <Clock className="h-3.5 w-3.5 text-primary" />
                Set Timing
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const targetId = bike.bikeId || bike.id || bike.registrationNumber || "temp_id";
                  onDelete?.(targetId, bike);
                }}
                title="Delete bike"
                className="inline-flex items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to={`/bikes/${bike.bikeId || bike.id}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
            >
              View details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BikeCard;
