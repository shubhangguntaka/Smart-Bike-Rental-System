import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Gauge,
  Fuel,
  Settings2,
  Users,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import bikeService from "@/services/bikeService";
import type { Bike } from "@/types/bike";
import BikeAvailability from "@/components/bike/BikeAvailability";
import DistanceCard from "@/components/map/DistanceCard";
import ReviewList from "@/components/review/ReviewList";
import { ROUTES } from "@/constants/routes";
import { format12Hour } from "@/utils/timeUtils";

const BikeDetails = () => {
  const { bikeId } = useParams();
  const navigate = useNavigate();

  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    if (!bikeId) return;

    (async () => {
      try {
        setLoading(true);

        const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
        const foundLocal = localCached.find(
          (b) =>
            String(b.bikeId || b.id) === String(bikeId) ||
            (b.registrationNumber &&
              b.registrationNumber.toUpperCase() === String(bikeId).toUpperCase())
        );

        if (foundLocal) {
          setBike(foundLocal);
          setLoading(false);
          return;
        }

        const numericId = Number(bikeId);
        if (!isNaN(numericId) && numericId > 0) {
          const data = await bikeService.getBikeById(numericId);
          if (data) {
            setBike(data);
            return;
          }
        }

        toast.error("Unable to load bike details.");
        navigate(ROUTES.OWNER.BIKES);
      } catch (err) {
        console.error("Error loading bike details:", err);
        const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
        const foundLocal = localCached.find(
          (b) =>
            String(b.bikeId || b.id) === String(bikeId) ||
            (b.registrationNumber &&
              b.registrationNumber.toUpperCase() === String(bikeId).toUpperCase())
        );
        if (foundLocal) {
          setBike(foundLocal);
        } else {
          toast.error("Unable to load bike details.");
          navigate(ROUTES.OWNER.BIKES);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [bikeId, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="h-10 w-32 animate-pulse rounded-xl bg-muted/60" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-muted/60" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-5 w-1/2 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted/60" />
          </div>
        </div>
      </div>
    );
  }

  if (!bike) return null;

  const images = (bike.imageUrls && bike.imageUrls.length > 0
    ? bike.imageUrls
    : [bike.imageUrl]
  ).filter(Boolean);

  const primaryPhoto = images[activeImageIdx] || bike.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";
  const rcVerified = Boolean(bike.rcVerified || bike.rcVerificationStatus);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate(ROUTES.OWNER.BIKES)}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Fleet
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.OWNER.EDIT_BIKE(bike.bikeId!))}
            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5"
          >
            Edit Bike
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4 lg:col-span-7">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg">
            <img
              src={primaryPhoto}
              alt={bike.bikeName}
              className="h-full w-full object-cover transition duration-300"
            />
            <div className="absolute left-4 top-4 flex gap-2">
              <BikeAvailability
                status={bike.bikeStatus}
                availableStartTime={bike.availableStartTime}
                availableEndTime={bike.availableEndTime}
                availableDate={bike.availableDate}
              />
            </div>
            <div className="absolute right-4 top-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-md ${
                  rcVerified
                    ? "bg-emerald-500/90 text-white backdrop-blur-md"
                    : "bg-amber-500/90 text-white backdrop-blur-md"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                RC {rcVerified ? "Verified" : "Pending"}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImageIdx(i)}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    i === activeImageIdx
                      ? "border-primary shadow-md scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          {bike.description && (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90">
                {bike.description}
              </p>
            </div>
          )}

          {/* Location & Mini Map */}
          <DistanceCard
            bikeId={bike.bikeId}
            latitude={bike.latitude && bike.latitude !== 0 ? bike.latitude : undefined}
            longitude={bike.longitude && bike.longitude !== 0 ? bike.longitude : undefined}
            locationName={bike.location}
            showMiniMap={!!bike.latitude && !!bike.longitude && bike.latitude !== 0 && bike.longitude !== 0}
          />
        </div>

        {/* Right Column: Key Details & Specs */}
        <div className="space-y-6 lg:col-span-5">
          {/* Header Overview Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {bike.brand}
              </p>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                {bike.bikeName}
              </h1>
              {bike.model && (
                <p className="mt-1 text-sm text-muted-foreground">Model: {bike.model}</p>
              )}
            </div>

            <div className="flex items-baseline justify-between border-t border-border/60 pt-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Rental Rate</p>
                <p className="text-3xl font-extrabold text-foreground">
                  ₹{(bike.hourlyRate || 80).toLocaleString("en-IN")}{" "}
                  <span className="text-sm font-semibold text-muted-foreground">/ hr</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Estimated Daily</p>
                <p className="text-lg font-bold text-foreground">
                  ₹{((bike.hourlyRate || 80) * 8).toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-normal text-muted-foreground">/ day (8h)</span>
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              {bike.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">{bike.location}</span>
                </div>
              )}
              {(bike.availableStartTime || bike.availableEndTime) && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Available: {format12Hour(bike.availableStartTime || "09:00")} –{" "}
                    {format12Hour(bike.availableEndTime || "21:00")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Specifications Grid Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Bike Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <SpecItem
                icon={<Gauge className="h-4 w-4 text-primary" />}
                label="Engine Capacity"
                value={bike.engineCapacity || "110cc"}
              />
              <SpecItem
                icon={<Fuel className="h-4 w-4 text-primary" />}
                label="Fuel Type"
                value={bike.fuelType || "Petrol"}
              />
              <SpecItem
                icon={<Settings2 className="h-4 w-4 text-primary" />}
                label="Transmission"
                value={bike.transmission || "Automatic"}
              />
              <SpecItem
                icon={<Users className="h-4 w-4 text-primary" />}
                label="Seating Capacity"
                value={`${bike.seatingCapacity || 2} Persons`}
              />
            </div>
          </div>

          {/* Registration & RC Verification Status */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Document & RC Verification
              </h3>
              {rcVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                  <AlertCircle className="h-4 w-4" /> Unverified
                </span>
              )}
            </div>

            <div className="space-y-3 rounded-2xl bg-muted/40 p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Number:</span>
                <span className="font-mono font-bold text-foreground">
                  {bike.registrationNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">RC Number:</span>
                <span className="font-mono font-bold text-foreground">
                  {bike.rcNumber || bike.registrationNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-bold text-foreground">
                  {rcVerified ? "Verified & Approved" : "Pending Verification"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-6 border-t border-border">
        <h2 className="text-lg font-bold text-foreground mb-4">Customer Reviews & Ratings</h2>
        <ReviewList bikeId={Number(bike.bikeId || bike.id || bikeId)} />
      </div>
    </div>
  );
};

const SpecItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 rounded-2xl bg-muted/30 p-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-xs font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export default BikeDetails;
