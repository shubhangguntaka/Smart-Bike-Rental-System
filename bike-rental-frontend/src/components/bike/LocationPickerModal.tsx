import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Navigation,
  Search,
  X,
  Check,
  RotateCw,
  Compass,
  Sparkles,
  Layers,
  MapPinCheckInside,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Custom  / Uber Style Pulsing Location Pin
const customPin = new L.DivIcon({
  className: "custom-pin",
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 48px; height: 48px; transform: translate(-50%, -100%);">
      <div style="position: absolute; bottom: 0; width: 14px; height: 6px; background: rgba(0, 0, 0, 0.25); border-radius: 50%; filter: blur(2px);"></div>
      <div style="position: relative; width: 40px; height: 40px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 8px 16px rgba(37,99,235,0.4); display: flex; align-items: center; justify-content: center;">
        <div style="width: 14px; height: 14px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

// Map Controller to handle click & pan events
function MapEventsHandler({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
      map.panTo(e.latlng, { animate: true });
    },
    dragend() {
      const center = map.getCenter();
      onLocationChange(center.lat, center.lng);
    },
  });

  return null;
}

// Map InvalidateSize Controller
function MapResizer({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    const t1 = setTimeout(() => {
      try {
        map.invalidateSize();
        map.setView(center, map.getZoom() || 15);
      } catch {
        // Map DOM not yet mounted
      }
    }, 150);

    const t2 = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        // Map DOM not yet mounted
      }
    }, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [center, map]);

  return null;
}

// Popular Hyderabad Area Presets for Quick Selection
const HYDERABAD_PRESETS = [
  { name: "Hitech City", lat: 17.4474, lng: 78.3762 },
  { name: "Madhapur", lat: 17.4483, lng: 78.3915 },
  { name: "Gachibowli", lat: 17.4401, lng: 78.3489 },
  { name: "Kondapur", lat: 17.4699, lng: 78.3578 },
  { name: "Kukatpally", lat: 17.4933, lng: 78.3995 },
  { name: "Banjara Hills", lat: 17.4156, lng: 78.4357 },
  { name: "Jubilee Hills", lat: 17.4319, lng: 78.4073 },
  { name: "Secunderabad", lat: 17.4399, lng: 78.4983 },
  { name: "Ameerpet", lat: 17.4375, lng: 78.4483 },
  { name: "Dilsukhnagar", lat: 17.3688, lng: 78.5247 },
];

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialLocationName?: string;
  onSelectLocation: (data: {
    locationName: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialLocationName,
  onSelectLocation,
}: LocationPickerModalProps) {
  const defaultLat = initialLat && !isNaN(Number(initialLat)) ? Number(initialLat) : 17.440081;
  const defaultLng = initialLng && !isNaN(Number(initialLng)) ? Number(initialLng) : 78.348915;

  const [selectedLat, setSelectedLat] = useState<number>(defaultLat);
  const [selectedLng, setSelectedLng] = useState<number>(defaultLng);
  const [selectedAddress, setSelectedAddress] = useState<string>(
    initialLocationName || "Hyderabad"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [geocoding, setGeocoding] = useState<boolean>(false);

  const searchTimerRef = useRef<any>(null);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      const lat = initialLat && !isNaN(Number(initialLat)) ? Number(initialLat) : 17.440081;
      const lng = initialLng && !isNaN(Number(initialLng)) ? Number(initialLng) : 78.348915;
      setSelectedLat(lat);
      setSelectedLng(lng);
      setSelectedAddress(initialLocationName || "Hyderabad");
    }
  }, [isOpen, initialLat, initialLng, initialLocationName]);

  // Reverse Geocode when coordinates change
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        const neighbourhood =
          addr.suburb ||
          addr.neighbourhood ||
          addr.commercial ||
          addr.residential ||
          addr.road ||
          addr.village ||
          addr.city_district;
        const city = addr.city || addr.town || addr.state_district || "Hyderabad";

        let formatted = "";
        if (neighbourhood && neighbourhood !== city) {
          formatted = `${neighbourhood}, ${city}`;
        } else {
          formatted = data.display_name.split(",").slice(0, 3).join(",").trim();
        }

        setSelectedAddress(formatted);
      }
    } catch {
      // safe fallback
    } finally {
      setGeocoding(false);
    }
  }, []);

  const handleCoordinatesChange = (lat: number, lng: number) => {
    const fixedLat = parseFloat(lat.toFixed(6));
    const fixedLng = parseFloat(lng.toFixed(6));
    setSelectedLat(fixedLat);
    setSelectedLng(fixedLng);
    reverseGeocode(fixedLat, fixedLng);
  };

  // Live GPS Detect Me
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setSelectedLat(lat);
        setSelectedLng(lng);
        reverseGeocode(lat, lng);
        setLocatingUser(false);
      },
      (err) => {
        console.warn("Location access denied:", err);
        setLocatingUser(false);
        alert("Could not fetch current location. Please allow browser location access.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Search Address Autocomplete
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!val.trim() || val.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const queryWithCity = val.toLowerCase().includes("hyderabad") || val.toLowerCase().includes("telangana")
          ? val
          : `${val}, Hyderabad`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithCity)}&limit=5&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(Number(result.lat).toFixed(6));
    const lng = parseFloat(Number(result.lon).toFixed(6));
    const addr = result.address || {};
    const name =
      addr.suburb ||
      addr.neighbourhood ||
      addr.commercial ||
      result.display_name.split(",").slice(0, 2).join(", ").trim();

    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedAddress(name || "Hyderabad");
    setSearchQuery("");
    setSearchResults([]);
  };

  const handlePresetSelect = (preset: { name: string; lat: number; lng: number }) => {
    setSelectedLat(preset.lat);
    setSelectedLng(preset.lng);
    setSelectedAddress(`${preset.name}, Hyderabad`);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleConfirm = () => {
    onSelectLocation({
      locationName: selectedAddress || "Hyderabad",
      latitude: selectedLat,
      longitude: selectedLng,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden text-foreground">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Set Bike Pickup Station
              </h3>
              <p className="text-xs text-muted-foreground">
                Drag the map, search an area, or click anywhere to set the exact bike location.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Live GPS Action */}
        <div className="p-4 bg-background border-b border-border space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search area (e.g. Hitech City, Madhapur, Gachibowli, Kukatpally)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-border bg-muted/30 text-xs font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-[1000] bg-card border border-border rounded-2xl shadow-xl overflow-hidden divide-y divide-border">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium hover:bg-muted/60 transition flex items-center gap-2.5 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate text-foreground">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleDetectLiveLocation}
              disabled={locatingUser}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition shrink-0 cursor-pointer"
            >
              <Navigation className={`w-4 h-4 ${locatingUser ? "animate-spin text-primary" : ""}`} />
              <span>{locatingUser ? "Locating..." : "Use Current Live GPS"}</span>
            </button>
          </div>

          {/* Quick Preset Location Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <span className="font-bold text-muted-foreground shrink-0 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Popular Hubs:
            </span>
            {HYDERABAD_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1 rounded-xl border text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedAddress.toLowerCase().includes(preset.name.toLowerCase())
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Map Container Area */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[440px] w-full bg-muted/20">
          <MapContainer
            center={[selectedLat, selectedLng]}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", minHeight: "380px", zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapResizer center={[selectedLat, selectedLng]} />

            <MapEventsHandler onLocationChange={handleCoordinatesChange} />

            <Marker position={[selectedLat, selectedLng]} icon={customPin} />
          </MapContainer>

          {/* Floating Instructions Pill */}
          <div className="absolute top-3 left-3 z-[400] bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl px-3 py-1.5 shadow-md flex items-center gap-2 text-xs font-semibold text-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>Click anywhere or drag map to place pickup pin</span>
          </div>
        </div>

        {/* Bottom Station Details & Confirm Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <MapPinCheckInside className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                  Selected Station
                </span>
                <span className="font-mono text-xs text-muted-foreground font-semibold">
                  ({selectedLat}, {selectedLng})
                </span>
              </div>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {geocoding ? "Resolving address..." : selectedAddress}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Customers booking this bike will see this exact station & navigation route.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md cursor-pointer active:scale-95 ring-2 ring-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Set Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
