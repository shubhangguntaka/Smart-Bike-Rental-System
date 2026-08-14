import { useMemo, useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import BikeCard from "./BikeCard";
import SearchBar from "./SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import type { FilterField } from "@/components/common/FilterBar";
import useBikeSse from "@/hooks/useBikeSse";

const SIDEBAR_FILTERS: FilterField[] = [
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
      { label: "Bajaj", value: "Bajaj" },
      { label: "TVS", value: "TVS" },
      { label: "Ather", value: "Ather" },
      { label: "KTM", value: "KTM" },
    ],
  },
];

export default function NearbyBikeSidebar() {
  useBikeSse();
  const { nearbyBikes, loading } = useLocation();
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const filteredBikes = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return (nearbyBikes ?? []).filter((bike) => {
      const matchesSearch =
        !keyword ||
        bike.bikeName?.toLowerCase().includes(keyword) ||
        bike.brand?.toLowerCase().includes(keyword);

      let matchesPrice = true;
      if (Array.isArray(filterValues.maxPrice)) {
        const [minP, maxP] = filterValues.maxPrice;
        const price = bike.rentalPrice ?? 0;
        matchesPrice = price >= minP && price <= maxP;
      }

      let matchesDistance = true;
      if (Array.isArray(filterValues.maxDistance)) {
        const [minD, maxD] = filterValues.maxDistance;
        const dist = bike.distance ?? 0;
        matchesDistance = dist >= minD && dist <= maxD;
      }

      let matchesBrand = true;
      if (filterValues.brand) {
        matchesBrand =
          bike.brand?.toLowerCase() === filterValues.brand.toLowerCase();
      }

      return matchesSearch && matchesPrice && matchesDistance && matchesBrand;
    });
  }, [nearbyBikes, search, filterValues]);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="sticky top-0 z-10 bg-card border-b border-border p-5 space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Nearby Bikes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Searching..." : `${filteredBikes.length} bikes found`}
          </p>
        </div>

        

        {/* Integrated Reusable FilterBar Component */}
        <FilterBar
          filters={SIDEBAR_FILTERS}
          value={filterValues}
          onChange={setFilterValues}
          onClearAll={() => setFilterValues({})}
          label="Filter Bikes"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading nearby bikes...
          </div>
        ) : filteredBikes.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">
              No bikes match your filters
            </p>
            <button
              onClick={() => {
                setSearch("");
                setFilterValues({});
              }}
              className="text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          filteredBikes.map((bike) => (
            <BikeCard key={bike.bikeId} bike={bike} />
          ))
        )}
      </div>
    </div>
  );
}