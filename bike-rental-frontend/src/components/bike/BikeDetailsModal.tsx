import React from "react";
import {
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Navigation,
  Battery,
  Zap,
} from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import BikeAvailability from "@/components/bike/BikeAvailability";
import { format12Hour } from "@/utils/timeUtils";
import { normalizeBike } from "@/utils/bikeUtils";

interface BikeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike: any | null;
  onRentNow?: (bike: any) => void;
}

export default function BikeDetailsModal({
  isOpen,
  onClose,
  bike: rawBike,
  onRentNow,
}: BikeDetailsModalProps) {
  if (!rawBike) return null;

  const bike = normalizeBike(rawBike);

  const bikeName = bike.name;
  const regNumber = bike.registrationNumber;
  const fuelType = bike.fuelType;
  const isElectric = fuelType.includes("ELECTRIC") || fuelType.includes("EV");

  const hourlyPrice = bike.hourlyRate;
  const dailyPrice = bike.rentalPrice;

  const ownerName = bike.ownerName;
  const locationName = bike.location;

  const lat = bike.latitude;
  const lng = bike.longitude;

  const distanceKm = bike.distance !== undefined ? Number(bike.distance).toFixed(1) : null;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const isAvailable =
    bike.available !== undefined
      ? bike.available
      : bike.bikeStatus === "AVAILABLE" || !bike.bikeStatus;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-foreground text-lg sm:text-xl">
            {bikeName}
          </span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-5 py-1">
          {/* Banner Image & Top Floating Badges */}
          <div className="relative h-52 sm:h-64 w-full overflow-hidden rounded-2xl bg-muted border border-border/80 shadow-xs group">
            <img
              src={
                bike.image ||
                bike.imageUrl ||
                "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80"
              }
              alt={bikeName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80";
              }}
            />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="rounded-xl bg-card/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-foreground border border-border/80 shadow-sm flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                {distanceKm ? `${distanceKm} km away` : locationName}
              </span>
              <span className="rounded-xl bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground uppercase shadow-sm tracking-wider">
                {isElectric ? "ELECTRIC EV" : fuelType}
              </span>
            </div>

            <div className="absolute top-3 right-3 shadow-sm">
              <BikeAvailability
                status={
                  bike.bikeStatus ||
                  (isAvailable ? "AVAILABLE" : "SHIFT_CLOSED")
                }
                availableStartTime={bike.availableStartTime || "09:00"}
                availableEndTime={bike.availableEndTime || "21:00"}
                isShiftPosted={bike.isShiftPosted}
                availableDate={bike.availableDate}
              />
            </div>

            {/* Bottom Registration Badge */}
            <div className="absolute bottom-3 left-3 right-3 bg-card/90 backdrop-blur-md border border-border/80 p-3 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">
                  Registration Number
                </div>
                <div className="text-xs font-mono font-bold text-foreground mt-0.5">
                  {regNumber}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>RC Verified</span>
              </div>
            </div>
          </div>

          {/* Google Maps Live GPS Navigation Card */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 dark:bg-blue-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-xs tracking-wide">
                <Navigation className="h-4 w-4 animate-bounce shrink-0" />
                <span>Live Location & Google Maps Navigation</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {distanceKm ? (
                  <>
                    Vehicle is located approximately{" "}
                    <strong className="text-foreground">{distanceKm} km</strong>{" "}
                    from your current position in {locationName}.
                  </>
                ) : (
                  <>
                    Parked in {locationName}. Open Google Maps for turn-by-turn
                    directions.
                  </>
                )}
              </p>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto shrink-0 px-4 py-2.5 text-xs font-extrabold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Navigate in Google Maps
            </a>
          </div>

          {/* Owner Information Card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-4.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-base shadow-sm shrink-0 uppercase">
                {ownerName[0]}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-foreground">
                    {ownerName}
                  </h4>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Verified Owner
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  Verified partner • Direct pickup & keyless handover support
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Shift Time Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                Hourly Rental Rate
              </span>
              <div className="text-lg font-black text-foreground">
                ₹{hourlyPrice}{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  / hr
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                Daily Rental Rate
              </span>
              <div className="text-lg font-black text-foreground">
                ₹{dailyPrice}{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  / day
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1 col-span-2 sm:col-span-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                Operating Shift
              </span>
              <div className="text-xs font-bold text-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                {format12Hour(bike.availableStartTime || "09:00")} –{" "}
                {format12Hour(bike.availableEndTime || "21:00")}
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Vehicle Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <div className="text-[10px] font-bold uppercase text-muted-foreground">
                  Engine / Motor
                </div>
                <div className="text-xs font-bold text-foreground mt-1">
                  {bike.engineCapacity || (isElectric ? "250W EV" : "150 cc")}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <div className="text-[10px] font-bold uppercase text-muted-foreground">
                  Mileage / Range
                </div>
                <div className="text-xs font-bold text-foreground mt-1">
                  {bike.range ||
                    bike.mileage ||
                    (isElectric ? "60 km/charge" : "50 km/l")}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <div className="text-[10px] font-bold uppercase text-muted-foreground">
                  Transmission
                </div>
                <div className="text-xs font-bold text-foreground mt-1">
                  {bike.transmission || (isElectric ? "Automatic" : "Manual")}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <div className="text-[10px] font-bold uppercase text-muted-foreground">
                  Seating Capacity
                </div>
                <div className="text-xs font-bold text-foreground mt-1">
                  {bike.seatingCapacity || 2} Persons
                </div>
              </div>
            </div>
          </div>

          {/* Bike Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              About This Bike
            </h4>
            <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 border border-border p-3.5 rounded-xl font-medium">
              {bike.description ||
                `${bikeName} is fully serviced, RC-verified, and maintained in top operational condition for reliable rides.`}
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
        >
          Close Details
        </button>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-extrabold rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Google Maps
        </a>
        {isAvailable && onRentNow && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onRentNow(bike);
            }}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-extrabold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all text-center shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" /> Rent Now
          </button>
        )}
      </ModalFooter>
    </Modal>
  );
}
