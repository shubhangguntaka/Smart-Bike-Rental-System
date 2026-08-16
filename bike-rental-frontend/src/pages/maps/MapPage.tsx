import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MapComponent from "@/components/map/MapComponent";
import { FilterBar } from "@/components/common/FilterBar";
import type { FilterField } from "@/components/common/FilterBar";
import SearchBar from "@/components/map/SearchBar";
import BikeCard from "@/components/map/BikeCard";
import RouteInfoCard from "@/components/map/RouteInfoCard";
import MapControls from "./MapControls";
import { useLocation } from "@/hooks/useLocation";
import { Compass, RefreshCw } from "lucide-react";

const MAP_FILTERS: FilterField[] = [
  {
    id: "maxPrice",
    label: "Price Range (₹)",
    type: "range",
    min: 0,
    max: 5000,
    step: 50,
  },
  {
    id: "maxDistance",
    label: "Distance (km)",
    type: "range",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    id: "brand",
    label: "Brand",
    type: "select",
    placeholder: "All Brands",
    options: [
      { label: "Royal Enfield", value: "Royal Enfield" },
      { label: "Yamaha", value: "Yamaha" },
      { label: "Honda", value: "Honda" },
      { label: "Hero", value: "Hero" },
      { label: "Ather", value: "Ather" },
      { label: "KTM", value: "KTM" },
    ],
  },
];

export default function MapPage() {
  const { nearbyBikes, loading, refreshLocation, getNearbyBikes } = useLocation();
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState("distance-asc");

  // Location search state
  const [searchedLocation, setSearchedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleLocationSearch = async (query: string) => {
    const cleanedQuery = query.trim();
    if (!cleanedQuery) return;

    try {
      setGeocodingLoading(true);
      setLocationError("");
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanedQuery)}&format=json&limit=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Geocoding service unavailable.");
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const newLoc = { latitude: lat, longitude: lon };
        setSearchedLocation(newLoc);
        getNearbyBikes(newLoc);
      } else {
        setLocationError("No results found for location.");
      }
    } catch (err: any) {
      console.error("Geocoding failed:", err);
      setLocationError("Failed to search location.");
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleResetToMyLocation = () => {
    setSearchedLocation(null);
    refreshLocation();
  };

  const filteredBikes = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    const list = (nearbyBikes ?? []).filter((bike) => {
      if (bike.latitude == null || bike.longitude == null) return false;

      // Only display rentable/available bikes
      if (!bike.available || bike.bikeStatus !== "AVAILABLE") {
        return false;
      }

      const matchesSearch =
        !keyword ||
        bike.bikeName?.toLowerCase().includes(keyword) ||
        bike.name?.toLowerCase().includes(keyword) ||
        bike.brand?.toLowerCase().includes(keyword) ||
        bike.model?.toLowerCase().includes(keyword) ||
        bike.location?.toLowerCase().includes(keyword);

      let matchesPrice = true;
      if (Array.isArray(filterValues.maxPrice) && filterValues.maxPrice.length === 2 && filterValues.maxPrice[1] > 0) {
        const [minP, maxP] = filterValues.maxPrice;
        const price = bike.rentalPrice || bike.hourlyRate || bike.price || 0;
        matchesPrice = price >= minP && price <= maxP;
      } else if (typeof filterValues.maxPrice === "number" && filterValues.maxPrice > 0) {
        const price = bike.rentalPrice || bike.hourlyRate || bike.price || 0;
        matchesPrice = price <= filterValues.maxPrice;
      }

      let matchesDistance = true;
      if (Array.isArray(filterValues.maxDistance) && filterValues.maxDistance.length === 2 && filterValues.maxDistance[1] > 0) {
        const [minD, maxD] = filterValues.maxDistance;
        const dist = bike.distance ?? 0;
        matchesDistance = dist >= minD && dist <= maxD;
      } else if (typeof filterValues.maxDistance === "number" && filterValues.maxDistance > 0) {
        const dist = bike.distance ?? 0;
        matchesDistance = dist <= filterValues.maxDistance;
      }

      let matchesBrand = true;
      if (filterValues.brand && filterValues.brand !== "ALL") {
        matchesBrand =
          bike.brand?.toLowerCase() === filterValues.brand.toLowerCase() ||
          bike.bikeName?.toLowerCase().includes(filterValues.brand.toLowerCase());
      }

      return matchesSearch && matchesPrice && matchesDistance && matchesBrand;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "distance-asc") {
        const dA = a.distance ?? 99999;
        const dB = b.distance ?? 99999;
        return dA - dB;
      }
      if (sortBy === "distance-desc") {
        const dA = a.distance ?? 0;
        const dB = b.distance ?? 0;
        return dB - dA;
      }
      if (sortBy === "price-asc") {
        const pA = a.rentalPrice || a.hourlyRate || 0;
        const pB = b.rentalPrice || b.hourlyRate || 0;
        return pA - pB;
      }
      if (sortBy === "price-desc") {
        const pA = a.rentalPrice || a.hourlyRate || 0;
        const pB = b.rentalPrice || b.hourlyRate || 0;
        return pB - pA;
      }
      if (sortBy === "rating-desc") {
        const rA = a.rating || 0;
        const rB = b.rating || 0;
        return rB - rA;
      }
      if (sortBy === "name-asc") {
        return (a.bikeName || "").localeCompare(b.bikeName || "");
      }
      if (sortBy === "name-desc") {
        return (b.bikeName || "").localeCompare(a.bikeName || "");
      }
      return 0;
    });
  }, [nearbyBikes, search, filterValues, sortBy]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section with refresh button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Compass className="text-primary h-8 w-8 animate-pulse" />
            Explore Map
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time interactive bike mapping and GPS distance tracking
          </p>
        </div>

        <button
          onClick={refreshLocation}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-bold text-foreground hover:bg-muted shadow-sm transition cursor-pointer"
        >
          <RefreshCw size={16} />
          Refresh Location
        </button>
      </div>

      {/* Horizontal Filter Bar & Search Container */}
      <div className="relative z-30 flex flex-col gap-4 bg-card/70 backdrop-blur-md p-5 rounded-3xl border border-border shadow-md">
        {/* Unified Search */}
        <div className="w-full relative">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              if (locationError) setLocationError("");
            }}
            onLocationSearch={handleLocationSearch}
          />
          {geocodingLoading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse font-medium">
              Searching location...
            </span>
          )}
          {locationError && (
            <p className="absolute -bottom-5 left-1 text-[10px] text-destructive font-semibold">
              {locationError}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="w-full">
          <FilterBar
            filters={MAP_FILTERS}
            value={filterValues}
            onChange={setFilterValues}
            onClearAll={() => setFilterValues({})}
            label="Filter Bikes"
          />
        </div>
      </div>

      {/* Interactive Map Wrapper with borders & shadow */}
      <div className="relative h-[420px] md:h-[500px] lg:h-[600px] w-full rounded-3xl overflow-hidden shadow-xl border border-border bg-background">
        <MapComponent bikes={filteredBikes} searchedLocation={searchedLocation} />
        <MapControls />
        <RouteInfoCard />
      </div>

      {/* Nearby Bikes Grid Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">
              Available Bikes Nearby ({filteredBikes.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Default sorted by distance (Nearest → Farthest).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 shadow-xs cursor-pointer"
            >
              <option value="distance-asc">Nearest First (Distance ↑)</option>
              <option value="distance-desc">Farthest First (Distance ↓)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>

            {filteredBikes.length === 0 && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterValues({});
                  setSortBy("distance-asc");
                }}
                className="text-xs text-primary font-bold hover:underline cursor-pointer ml-2"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading nearby bikes...
            </div>
          ) : filteredBikes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-16 bg-card rounded-3xl border border-border text-muted-foreground"
            >
              No bikes found matching your current filter selections.
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredBikes.map((bike) => (
                <motion.div
                  key={bike.bikeId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <BikeCard bike={bike} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}