import React, { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Navigation,
  MapPin,
  RotateCw,
  Compass,
  Bike as BikeIcon,
  X,
  Clock,
  ShieldCheck,
  Radio,
  AlertCircle,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Custom Leaflet Markers
const customerPinIcon = new L.DivIcon({
  className: "custom-customer-pin",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
      <div style="position: absolute; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.25); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 24px; height: 24px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const bikePinIcon = new L.DivIcon({
  className: "custom-bike-pin",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
      <div style="width: 36px; height: 36px; background: #10b981; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

// Map View Bounds Auto-fitter & Container Sizing Controller
function MapBoundsFitter({
  customerPos,
  bikePos,
  routeCoordinates,
}: {
  customerPos: [number, number] | null;
  bikePos: [number, number];
  routeCoordinates: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    // Invalidate map size once container DOM finishes rendering
    const t1 = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 100);

    const t2 = setTimeout(() => {
      try {
        map.invalidateSize();
        if (routeCoordinates.length > 1) {
          const bounds = L.latLngBounds(routeCoordinates);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        } else if (customerPos) {
          const bounds = L.latLngBounds([customerPos, bikePos]);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        } else {
          map.setView(bikePos, 15);
        }
      } catch {}
    }, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [customerPos, bikePos, routeCoordinates, map]);

  return null;
}

import bikeService from "../../services/bikeService";

interface BikeDirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export default function BikeDirectionsModal({
  isOpen,
  onClose,
  booking,
}: BikeDirectionsModalProps) {
  const [customerLocation, setCustomerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [bikeDetails, setBikeDetails] = useState<any>(null);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);

  // 1. Fetch real bike coordinates from backend/localStorage if not on booking object
  useEffect(() => {
    if (!isOpen || !booking) return;

    let isMounted = true;
    const loadBikeCoords = async () => {
      if (booking.latitude && booking.longitude && !isNaN(Number(booking.latitude))) {
        setBikeDetails({
          latitude: Number(booking.latitude),
          longitude: Number(booking.longitude),
          location: booking.location,
          bikeName: booking.bikeName,
          registrationNumber: booking.registrationNumber,
        });
        return;
      }

      const bId = booking.bikeId || booking.bike?.id || booking.id;
      if (bId) {
        try {
          const b = await bikeService.getBikeById(Number(bId));
          if (isMounted && b) {
            setBikeDetails(b);
          }
        } catch {
          // fallback
        }
      }
    };

    loadBikeCoords();
    return () => {
      isMounted = false;
    };
  }, [isOpen, booking]);

  // Determine Bike Destination Coordinates
  const bikeLat =
    Number(bikeDetails?.latitude) && !isNaN(Number(bikeDetails?.latitude))
      ? Number(bikeDetails.latitude)
      : Number(booking?.latitude) && !isNaN(Number(booking?.latitude))
      ? Number(booking.latitude)
      : 17.385044; // Hyderabad central fallback

  const bikeLng =
    Number(bikeDetails?.longitude) && !isNaN(Number(bikeDetails?.longitude))
      ? Number(bikeDetails.longitude)
      : Number(booking?.longitude) && !isNaN(Number(booking?.longitude))
      ? Number(booking.longitude)
      : 78.486671;

  const bikeLocationLabel =
    bikeDetails?.location ||
    booking?.location ||
    booking?.bikeLocation ||
    booking?.pickupAddress ||
    "Designated Owner Pickup Station";

  // 2. Geolocation Retrieval with High Accuracy
  const requestLiveLocation = useCallback(() => {
    setLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation access issue:", err.message);
        // If denied, place at same station as bike so it doesn't show fake 11km away
        setCustomerLocation({
          latitude: bikeLat,
          longitude: bikeLng,
        });
        setLocationError("Please enable location permissions in your browser for live turn-by-turn routing.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [bikeLat, bikeLng]);

  useEffect(() => {
    if (isOpen) {
      requestLiveLocation();
    }
  }, [isOpen, requestLiveLocation]);

  // 3. Calculate Haversine & OSRM Routing
  useEffect(() => {
    if (!customerLocation) return;

    // Haversine exact distance formula
    const R = 6371; // Earth radius in km
    const dLat = ((bikeLat - customerLocation.latitude) * Math.PI) / 180;
    const dLon = ((bikeLng - customerLocation.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((customerLocation.latitude * Math.PI) / 180) *
        Math.cos((bikeLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const directDistKm = R * c;

    // If customer and bike are at the same spot (less than 50 meters)
    if (directDistKm < 0.05) {
      setDistanceKm(0.0);
      setDurationMin(1);
      setRouteCoords([
        [customerLocation.latitude, customerLocation.longitude],
        [bikeLat, bikeLng],
      ]);
      return;
    }

    let isMounted = true;
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${customerLocation.longitude},${customerLocation.latitude};${bikeLng},${bikeLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (isMounted && data?.routes?.[0]) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
          );
          setRouteCoords(coords);
          setDistanceKm(Number((route.distance / 1000).toFixed(1)));
          setDurationMin(Math.max(1, Math.round(route.duration / 60)));
        } else {
          // Fallback straight path
          setRouteCoords([
            [customerLocation.latitude, customerLocation.longitude],
            [bikeLat, bikeLng],
          ]);
          setDistanceKm(Number(directDistKm.toFixed(1)));
          setDurationMin(Math.max(1, Math.round(directDistKm * 3.5)));
        }
      } catch {
        if (isMounted) {
          setRouteCoords([
            [customerLocation.latitude, customerLocation.longitude],
            [bikeLat, bikeLng],
          ]);
          setDistanceKm(Number(directDistKm.toFixed(1)));
          setDurationMin(Math.max(1, Math.round(directDistKm * 3.5)));
        }
      }
    };

    fetchRoute();
    return () => {
      isMounted = false;
    };
  }, [customerLocation, bikeLat, bikeLng]);

  if (!isOpen || !booking) return null;

  const openGoogleMaps = () => {
    const origin = customerLocation
      ? `${customerLocation.latitude},${customerLocation.longitude}`
      : "";
    const destination = `${bikeLat},${bikeLng}`;
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(url, "_blank");
  };

  const customerPos: [number, number] | null = customerLocation
    ? [customerLocation.latitude, customerLocation.longitude]
    : null;
  const bikePos: [number, number] = [bikeLat, bikeLng];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Band */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Directions to Accepted Bike
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                  Accepted
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Path from your current live location to{" "}
                <strong>{booking.bikeName || "your reserved bike"}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Route Summary Pill */}
        <div className="px-6 py-3 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/80 shadow-2xs font-bold text-foreground">
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground font-normal">Distance:</span>
              <span className="text-primary font-extrabold">
                {distanceKm !== null ? `${distanceKm} km` : "Calculating..."}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/80 shadow-2xs font-bold text-foreground">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-muted-foreground font-normal">Est. ETA:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                {durationMin !== null ? `~${durationMin} mins` : "Calculating..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={requestLiveLocation}
              disabled={locating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <RotateCw className={`w-3.5 h-3.5 ${locating ? "animate-spin text-primary" : ""}`} />
              <span>Recenter</span>
            </button>
          </div>
        </div>

        {locationError && (
          <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Leaflet Interactive Map View */}
        <div className="relative w-full h-[420px] sm:h-[460px] min-h-[380px] bg-muted/20 overflow-hidden">
          <MapContainer
            center={customerPos || bikePos}
            zoom={14}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", minHeight: "380px", zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapBoundsFitter
              customerPos={customerPos}
              bikePos={bikePos}
              routeCoordinates={routeCoords}
            />

            {/* Customer Location Pin */}
            {customerPos && (
              <Marker position={customerPos} icon={customerPinIcon}>
                <Popup>
                  <div className="text-xs space-y-1 p-1">
                    <strong className="text-blue-600 block">Your Live Location</strong>
                    <p className="text-muted-foreground">Start point of your pickup journey</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Bike Pickup Location Pin */}
            <Marker position={bikePos} icon={bikePinIcon}>
              <Popup>
                <div className="text-xs space-y-1 p-1">
                  <strong className="text-emerald-600 flex items-center gap-1">
                    <BikeIcon className="w-3.5 h-3.5" />
                    {booking.bikeName || "Accepted Bike"}
                  </strong>
                  {booking.registrationNumber && (
                    <span className="font-mono text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded">
                      {booking.registrationNumber}
                    </span>
                  )}
                  <p className="text-muted-foreground mt-1">{bikeLocationLabel}</p>
                </div>
              </Popup>
            </Marker>

            {/* Path Polyline: Under-glow + Main Navigation Line */}
            {routeCoords.length > 0 && (
              <>
                <Polyline
                  positions={routeCoords}
                  pathOptions={{
                    color: "#059669",
                    weight: 8,
                    opacity: 0.25,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={routeCoords}
                  pathOptions={{
                    color: "#10b981",
                    weight: 5,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              </>
            )}
          </MapContainer>

          {/* Quick Floating Legend on top of map */}
          <div className="absolute bottom-4 left-4 z-[400] bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl p-3 shadow-lg space-y-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-300 shadow-xs" />
              <span className="font-semibold text-foreground">You (Live Location)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 ring-2 ring-emerald-300 shadow-xs" />
              <span className="font-semibold text-foreground">Bike Location ({booking.bikeName || "Bike"})</span>
            </div>
          </div>
        </div>

        {/* Footer Station Details */}
        <div className="p-4 sm:p-5 border-t border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-foreground">
                Pickup Station: <span className="font-normal text-muted-foreground">{bikeLocationLabel}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Upon arrival at the bike location, present your <strong>QR Pass</strong> to the owner for key handover.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openGoogleMaps}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            <span>Start Live Navigation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
