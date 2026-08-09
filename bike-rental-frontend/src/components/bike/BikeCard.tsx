import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Pencil, Star, Trash2, ChevronLeft, ChevronRight, Eye, Wrench, CheckCircle2 } from "lucide-react";
import type { Bike } from "../../types/bike";
import BikeAvailability from "./BikeAvailability";
import { ROUTES } from "@/constants/routes";
import { format12Hour } from "@/utils/timeUtils";

interface BikeCardProps {
  bike: Bike;
  showOwnerActions?: boolean;
  onDelete?: (bikeId: number) => void;
  onStatusToggle?: (bikeId: number, currentStatus: string) => void;
  rating?: number;
}

const BikeCard = ({
  bike,
  showOwnerActions = false,
  onDelete,
  rating,
}: BikeCardProps) => {
  const rcOk = Boolean(bike.rcVerified || bike.rcVerificationStatus);

  const imagesList = (bike.imageUrls && bike.imageUrls.length > 0
    ? bike.imageUrls
    : [bike.imageUrl]).filter(Boolean);

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

  const currentPhotoUrl = imagesList[currentIdx] || bike.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";

  const formattedDate = bike.createdAt
    ? new Date(bike.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      {/* Image Gallery Showcase */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={currentPhotoUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80"}
          alt={bike.bikeName}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80";
          }}
          onClick={() => setIsZoomOpen(true)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105 cursor-zoom-in"
        />

        {/* Carousel Navigation */}
        {imagesList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-md transition hover:bg-black/80 group-hover:opacity-100"
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

            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur-md">
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

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <BikeAvailability
            status={bike.bikeStatus}
            availableStartTime={bike.availableStartTime}
            availableEndTime={bike.availableEndTime}
            compact
          />
        </div>
        <div className="absolute right-3 top-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md ${
              rcOk
                ? "bg-emerald-500/90 text-white"
                : "bg-amber-500/90 text-white"
            }`}
          >
            RC {rcOk ? "Verified" : "Pending"}
          </span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-card p-3 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={currentPhotoUrl} alt={bike.bikeName} className="max-h-[75vh] w-auto rounded-2xl object-contain" />
            {imagesList.length > 1 && (
              <div className="flex gap-2 pt-3">
                {imagesList.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Thumbnail ${i}`}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-12 w-16 rounded-xl object-cover cursor-pointer border-2 transition ${
                      i === currentIdx ? "border-primary scale-105" : "border-transparent opacity-60"
                    }`}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                {bike.brand}
              </p>
              <h3 className="font-serif text-lg font-bold leading-snug text-foreground">
                {bike.bikeName}
              </h3>
            </div>
            {typeof rating === "number" && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Reg: <span className="font-mono font-bold text-foreground">{bike.registrationNumber}</span>
          </p>
        </div>

        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-extrabold text-foreground">
              ₹{(bike.hourlyRate || 80).toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-muted-foreground">/ hr</span>
            </p>
            {formattedDate && (
              <p className="text-[11px] text-muted-foreground">
                Listed: {formattedDate}
              </p>
            )}
          </div>

          {(bike.availableStartTime || bike.availableEndTime) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                {format12Hour(bike.availableStartTime || "09:00")} – {format12Hour(bike.availableEndTime || "21:00")}
              </span>
            </div>
          )}

          {bike.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{bike.location}</span>
            </div>
          )}
        </div>

        {/* Action Buttons: View, Edit, Delete */}
        <div className="mt-auto flex gap-2 pt-2">
          {showOwnerActions ? (
            <>
              <Link
                to={ROUTES.OWNER.BIKE_DETAILS(bike.bikeId!)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5"
              >
                <Eye className="h-3.5 w-3.5 text-primary" />
                View
              </Link>
              <Link
                to={ROUTES.OWNER.EDIT_BIKE(bike.bikeId!)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
              <button
                type="button"
                onClick={() =>
                  bike.bikeId &&
                  onStatusToggle?.(
                    bike.bikeId,
                    bike.bikeStatus === "UNDER_MAINTENANCE" || bike.bikeStatus === "MAINTENANCE"
                      ? "AVAILABLE"
                      : "UNDER_MAINTENANCE"
                  )
                }
                title={
                  bike.bikeStatus === "UNDER_MAINTENANCE" || bike.bikeStatus === "MAINTENANCE"
                    ? "Set status to Available"
                    : "Set status to Maintenance"
                }
                className={`inline-flex items-center justify-center gap-1 rounded-2xl border px-2.5 py-2.5 text-xs font-bold transition ${
                  bike.bikeStatus === "UNDER_MAINTENANCE" || bike.bikeStatus === "MAINTENANCE"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                }`}
              >
                {bike.bikeStatus === "UNDER_MAINTENANCE" || bike.bikeStatus === "MAINTENANCE" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Available
                  </>
                ) : (
                  <>
                    <Wrench className="h-3.5 w-3.5" />
                    Maintenance
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => bike.bikeId && onDelete?.(bike.bikeId)}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs font-bold text-destructive transition hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <Link
              to={`/bikes/${bike.bikeId}`}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90"
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
