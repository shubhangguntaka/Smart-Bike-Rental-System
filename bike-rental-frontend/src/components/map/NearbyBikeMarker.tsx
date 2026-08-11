import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  Navigation,
  Route,
} from "lucide-react";

import type { NearbyBike } from "@/types/location";

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

  return (
    <Marker
      position={[bike.latitude, bike.longitude]}
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

          {/* Name + Brand */}
          <div className="mt-2">

            <h3 className="text-base font-bold leading-tight text-foreground">
              {bike.bikeName}
            </h3>

            <p className="text-xs text-muted-foreground">
              {bike.brand}
            </p>

          </div>

          {/* Price + Distance */}
          <div className="mt-2 flex items-center justify-between px-1">

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">
                Price
              </span>

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
                {bike.distance?.toFixed(1) ?? "0"} km
              </span>
            </div>

          </div>

          {/* Buttons */}
          <div className="mt-2 grid grid-cols-3 gap-1.5">

            <button
              type="button"
              disabled={!bike.available}
              onClick={() =>
                navigate(
                  `/customer/book/${bike.bikeId}`
                )
              }
              className="flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-2 text-[11px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
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
              className="flex h-8 items-center justify-center gap-1 rounded-md bg-secondary px-2 text-[11px] font-medium text-secondary-foreground transition hover:opacity-90"
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
              className="flex h-8 items-center justify-center gap-1 rounded-md bg-accent px-2 text-[11px] font-medium text-accent-foreground transition hover:opacity-90"
            >
              <Navigation size={13} />
              Go
            </button>

          </div>

        </div>
      </Popup>
    </Marker>
  );
}