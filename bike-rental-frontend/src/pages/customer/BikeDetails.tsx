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
  Navigation,
  Sparkles,
  User,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

import bikeService from "@/services/bikeService";
import type { Bike } from "@/types/bike";
import BikeAvailability from "@/components/bike/BikeAvailability";
import DistanceCard from "@/components/map/DistanceCard";
import ReviewList from "@/components/review/ReviewList";
import { format12Hour } from "@/utils/timeUtils";
import useAuth from "@/hooks/useAuth";
import { BookingService } from "@/services/bookingService";

export default function CustomerBikeDetails() {
  const { bikeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    if (!bikeId) return;

    (async () => {
      try {
        setLoading(true);
        const numericId = Number(bikeId);
        if (!isNaN(numericId) && numericId > 0) {
          const data = await bikeService.getBikeById(numericId);
          if (data) {
            setBike((data as any)?.data || data);
            return;
          }
        }
        toast.error("Unable to load bike details.");
        navigate("/customer/nearby-bikes");
      } catch (err) {
        console.error("Error loading bike details:", err);
        toast.error("Could not load bike details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [bikeId, navigate]);

  const handleBookNow = async () => {
    if (!bike) return;
    if (!user) {
      toast.error("Please login to book a bike.");
      navigate("/login");
      return;
    }

    try {
      const customerId = Number(user.id);
      localStorage.setItem(
        "pending_booking",
        JSON.stringify({
          bikeId: bike.bikeId || bike.id,
          returnRoute: window.location.pathname,
        })
      );

      const isVerified = await BookingService.checkVerificationStatus(customerId);
      const targetBikeId = bike.bikeId || bike.id || bikeId;
      if (isVerified) {
        navigate(`/customer/book/${targetBikeId}`);
      } else {
        toast.error("You need to complete identity verification to rent a bike.");
        navigate("/customer/verification");
      }
    } catch (err) {
      console.error("Verification check failed:", err);
      toast.error("Could not verify status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
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

  if (!bike) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold text-foreground">Bike Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90"
        >
          Go Back
        </button>
      </div>
    );
  }

  const images = (bike.imageUrls && bike.imageUrls.length > 0
    ? bike.imageUrls
    : [bike.imageUrl]
  ).filter(Boolean);

  const primaryPhoto = images[activeImageIdx] || bike.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";
  const rcVerified = Boolean(bike.rcVerified || bike.rcVerificationStatus);
  const targetId = Number(bike.bikeId || bike.id || bikeId);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 text-foreground">
      {/* Header Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${bike.latitude || 17.4483},${bike.longitude || 78.3915}`,
                "_blank"
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition hover:bg-muted cursor-pointer shadow-xs"
          >
            <Navigation className="h-3.5 w-3.5 text-primary" />
            Maps Navigation
          </button>

          <button
            type="button"
            onClick={handleBookNow}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-extrabold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Book This Bike
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Image Gallery & Description */}
        <div className="space-y-6 lg:col-span-7">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg">
            <img
              src={primaryPhoto}
              alt={bike.bikeName}
              className="h-full w-full object-cover transition duration-300"
            />
            <div className="absolute left-4 top-4 flex gap-2 z-10">
              <BikeAvailability
                status={bike.bikeStatus}
                availableStartTime={bike.availableStartTime}
                availableEndTime={bike.availableEndTime}
                availableDate={bike.availableDate}
              />
            </div>
            <div className="absolute right-4 top-4 z-10">
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

          {/* Image Thumbnails */}
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

          {/* Description Card */}
          {bike.description && (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Vehicle Description
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90">
                {bike.description}
              </p>
            </div>
          )}

          {/* Distance & Mini Map */}
          <DistanceCard
            bikeId={targetId}
            latitude={bike.latitude && bike.latitude !== 0 ? bike.latitude : undefined}
            longitude={bike.longitude && bike.longitude !== 0 ? bike.longitude : undefined}
            locationName={bike.location}
            showMiniMap={!!bike.latitude && !!bike.longitude && bike.latitude !== 0 && bike.longitude !== 0}
          />
        </div>

        {/* Right Column: Detailed Specs & Owner/Verification Info */}
        <div className="space-y-6 lg:col-span-5">
          {/* Overview & Pricing Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                {bike.brand}
              </span>
              <h1 className="font-serif text-2xl font-bold text-foreground mt-2">
                {bike.bikeName}
              </h1>
              {bike.model && (
                <p className="mt-1 text-xs font-semibold text-muted-foreground">Model: {bike.model}</p>
              )}
            </div>

            <div className="flex items-baseline justify-between border-t border-border/60 pt-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Hourly Rental Rate</p>
                <p className="text-3xl font-extrabold text-foreground">
                  ₹{(bike.hourlyRate || bike.rentalPrice || 80).toLocaleString("en-IN")}{" "}
                  <span className="text-sm font-semibold text-muted-foreground">/ hr</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Estimated 8h Shift</p>
                <p className="text-lg font-bold text-foreground">
                  ₹{((bike.hourlyRate || bike.rentalPrice || 80) * 8).toLocaleString("en-IN")}
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
                    Operating Shift: {format12Hour(bike.availableStartTime || "09:00")} –{" "}
                    {format12Hour(bike.availableEndTime || "21:00")}
                  </span>
                </div>
              )}
            </div>

            {/* Rent Button Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBookNow}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-extrabold shadow-md hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Rent This Vehicle Now
              </button>
            </div>
          </div>

          {/* Bike Specifications Grid Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Technical Specifications
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

          {/* Document & RC Verification Status */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                RC & Document Status
              </h3>
              {rcVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                  <AlertCircle className="h-4 w-4" /> Pending
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
                <span className="text-muted-foreground">RC Document Number:</span>
                <span className="font-mono font-bold text-foreground">
                  {bike.rcNumber || bike.registrationNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verification Status:</span>
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
        <h2 className="text-lg font-bold text-foreground mb-4">Reviews & Customer Feedback</h2>
        <ReviewList bikeId={targetId} />
      </div>
    </div>
  );
}

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