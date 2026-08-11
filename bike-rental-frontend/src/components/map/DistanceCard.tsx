import { useEffect, useState } from "react";
import { MapPin, Navigation, Clock } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { mapService } from "@/services/mapService";
import "leaflet/dist/leaflet.css";

interface DistanceCardProps {
  bikeId?: number;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  showMiniMap?: boolean;
}

const defaultPinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function DistanceCard({
  bikeId,
  latitude,
  longitude,
  locationName = "Location not specified",
  showMiniMap = true,
}: DistanceCardProps) {
  const [distanceInfo, setDistanceInfo] = useState<{
    distanceKm: number;
    estimatedTime: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation || !bikeId) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(true);
        mapService
          .calculateDistance(
            pos.coords.latitude,
            pos.coords.longitude,
            bikeId
          )
          .then((res) => {
            const data = res.data?.data || res.data;
            if (data?.distanceInKm !== undefined) {
              setDistanceInfo({
                distanceKm: data.distanceInKm,
                estimatedTime: data.estimatedTime || `${Math.round((data.distanceInKm / 30) * 60)} mins drive`,
              });
            }
          })
          .catch(() => {
            if (latitude && longitude) {
              const R = 6371; // km
              const dLat = ((latitude - pos.coords.latitude) * Math.PI) / 180;
              const dLon = ((longitude - pos.coords.longitude) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((pos.coords.latitude * Math.PI) / 180) *
                  Math.cos((latitude * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const dist = R * c;
              setDistanceInfo({
                distanceKm: dist,
                estimatedTime: `${Math.round((dist / 30) * 60)} mins drive`,
              });
            }
          })
          .finally(() => setLoading(false));
      },
      () => {}
    );
  }, [bikeId, latitude, longitude]);

  const hasCoords = latitude !== undefined && longitude !== undefined;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-md text-foreground">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <MapPin size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Location & Distance
          </h3>
          <p className="text-sm text-muted-foreground">{locationName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-background border border-border/40 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Navigation size={14} />
            <span>Distance from you</span>
          </div>
          <p className="mt-1 text-xl font-bold text-primary">
            {loading
              ? "Calculating..."
              : distanceInfo
              ? `${distanceInfo.distanceKm.toFixed(1)} km`
              : "Location required"}
          </p>
        </div>

        <div className="rounded-xl bg-background border border-border/40 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Clock size={14} />
            <span>Estimated Drive</span>
          </div>
          <p className="mt-1 text-xl font-bold text-primary">
            {loading
              ? "Calculating..."
              : distanceInfo
              ? distanceInfo.estimatedTime
              : "-- mins"}
          </p>
        </div>
      </div>

      {showMiniMap && hasCoords && (
        <div className="h-44 w-full rounded-xl overflow-hidden mb-4 border border-border">
          <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]} icon={defaultPinIcon}>
              <Popup>{locationName}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {hasCoords && (
        <button
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
              "_blank"
            )
          }
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 shadow-md transition cursor-pointer"
        >
          <Navigation size={18} />
          Navigate with Google Maps
        </button>
      )}
    </div>
  );
}
