import { useState } from "react";
import {
  Star,
  Battery,
  Navigation,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { NearbyBike } from "@/types/location";
import { useLocation } from "@/hooks/useLocation";
import useAuth from "@/hooks/useAuth";
import BikeDetailsModal from "@/components/bike/BikeDetailsModal";
import RentBikeModal from "@/components/bike/RentBikeModal";

interface BikeCardProps {
  bike: NearbyBike;
}

export default function BikeCard({
  bike,
}: BikeCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);

  const {
    selectedBikeId,
    setSelectedBikeId,
    getRoute,
  } = useLocation();

  const handleSelectBike = () => {
    setSelectedBikeId(bike.bikeId);
    getRoute(bike.bikeId);
  };

  const isElectric =
    bike.brand?.toLowerCase() === "ather" ||
    bike.bikeName?.toLowerCase().includes("electric") ||
    bike.bikeName?.toLowerCase().includes("ev");

  const hourlyPrice = Math.round((bike.rentalPrice || 500) / 8);

  return (
    <>
      <div
        onClick={handleSelectBike}
        className={`
          flex
          flex-col
          overflow-hidden
          rounded-2xl
          border
          transition-all
          duration-300
          group
          cursor-pointer
          ${
            selectedBikeId === bike.bikeId
              ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xl"
              : "border-border bg-card shadow-lg hover:shadow-xl hover:border-primary/40"
          }
        `}
      >
        {/* Bike Image & Distance Badge */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img
            src={bike.imageUrl}
            alt={bike.bikeName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80";
            }}
          />
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md ${
                bike.available
                  ? "bg-emerald-500/90 text-white"
                  : "bg-amber-500/90 text-white"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              {bike.available ? "Available Now" : "Shift Closed"}
            </span>
          </div>
          <div className="absolute top-3 right-3 rounded-xl bg-card/90 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-foreground border border-border shadow-sm">
            {bike.distance !== undefined && bike.distance !== null && bike.distance >= 0
              ? `${bike.distance.toFixed(1)} km`
              : "Distance unavailable"}
          </div>
        </div>

        {/* Card Body */}
        <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {bike.fuelType || (isElectric ? "electric" : "petrol")}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                <span>{bike.rating ? bike.rating.toFixed(1) : "N/A"}</span>
              </div>
            </div>
            <h3 className="font-bold text-base text-foreground leading-tight truncate">
              {bike.bikeName}
            </h3>
          </div>

          {/* Tech Specs */}
          <div className="space-y-2 border-y border-border py-3 text-xs text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <Navigation className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Location: {bike.location || "Available"}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Owner: {bike.ownerName || "Bike Owner"}</span>
              </div>
            </div>
          </div>

          {/* Footer Pricing & CTA */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-lg font-black text-foreground">₹{hourlyPrice}</span>
              <span className="text-xs text-muted-foreground">/ hr</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDetailsModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-primary text-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer shadow-xs"
              >
                View Details
              </button>
              {bike.available ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRentModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95 flex items-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Rent Now
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Outside operating hours"
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-muted text-muted-foreground border border-border cursor-not-allowed flex items-center gap-1"
                >
                  Shift Closed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SHARED VIEW BIKE DETAILS MODAL */}
      <BikeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        bike={bike}
        onRentNow={() => {
          setIsDetailsModalOpen(false);
          setIsRentModalOpen(true);
        }}
      />

      {/* SHARED RENT BIKE MODAL */}
      <RentBikeModal
        isOpen={isRentModalOpen}
        onClose={() => setIsRentModalOpen(false)}
        bike={bike}
      />
    </>
  );
}