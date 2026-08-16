import { useState } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  Navigation,
  Route,
} from "lucide-react";

import type { NearbyBike } from "@/types/location";
import RentBikeModal from "@/components/bike/RentBikeModal";

interface NearbyBikeMarkerProps {
  bike: NearbyBike;
  bikeIcon?: L.Icon;
  onSelect?: () => void;
  onShowRoute?: () => void;
}

const defaultBikeIcon = new L.Icon({
  iconUrl: "/icons/motorbike.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

export default function NearbyBikeMarker({
  bike,
  bikeIcon = defaultBikeIcon,
  onSelect,
  onShowRoute,
}: NearbyBikeMarkerProps) {
  const navigate = useNavigate();
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);

  const lat = Number(bike?.latitude);
  const lng = Number(bike?.longitude);

  if (!bike || isNaN(lat) || isNaN(lng) || bike.latitude === null || bike.longitude === null || lat === 0 || lng === 0) {
    return null;
  }

  return (
    <>
      <Marker
        position={[lat, lng]}
        icon={bikeIcon}
        eventHandlers={{
          click: () => {
            onSelect?.();
          },
        }}
      >
        <Popup
          maxWidth={240}
          minWidth={240}
          className="bike-popup"
        >
          <div className="w-[250px]">
            {/* Image */}
            <img
              src={bike.imageUrl}
              alt={bike.bikeName}
              className="h-[90px] w-full rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "/images/bikes/default-bike.jpg";
              }}
            />

            {/* Content */}
            <div className="mt-2 space-y-1">
              <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
                {bike.bikeName}
              </h3>

              <p className="text-xs text-muted-foreground">
                {bike.brand}
              </p>
            </div>

            {/* Price & Distance */}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-primary">
                  ₹{bike.rentalPrice}
                  <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
                    /day
                  </span>
                </span>
              </div>

              <div className="h-4 w-px bg-border" />

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">
                  Distance
                </span>

                <span className="text-sm font-semibold text-foreground">
                  {bike.distance !== undefined && bike.distance !== null && bike.distance >= 0
                    ? `${bike.distance.toFixed(1)} km`
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <button
                type="button"
                disabled={!bike.available}
                onClick={() => setIsRentModalOpen(true)}
                className="flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-2 text-[11px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <CalendarCheck size={13} />
                Book
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelect?.();
                  onShowRoute?.();
                }}
                className="flex h-8 items-center justify-center gap-1 rounded-md bg-secondary px-2 text-[11px] font-medium text-secondary-foreground transition hover:opacity-90 cursor-pointer"
              >
                <Route size={13} />
                Route
              </button>

              <button
                type="button"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${bike.latitude},${bike.longitude}`,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="flex h-8 items-center justify-center gap-1 rounded-md bg-accent px-2 text-[11px] font-medium text-accent-foreground transition hover:opacity-90 cursor-pointer"
              >
                <Navigation size={13} />
                Go
              </button>
            </div>
          </div>
        </Popup>
      </Marker>

      {/* RENT BIKE MODAL */}
      <RentBikeModal
        isOpen={isRentModalOpen}
        onClose={() => setIsRentModalOpen(false)}
        bike={bike}
      />
    </>
  );
}