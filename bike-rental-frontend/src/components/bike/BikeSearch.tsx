import { useState } from "react";
import type { Bike } from "../../types/bike";
import bikeService from "../../services/bikeService";

interface BikeSearchProps {
  onResults?: (bikes: Bike[]) => void;
  onSearch?: (location: string, brand: string, bikeStatus: string) => void;
}

const BikeSearch = ({ onResults, onSearch }: BikeSearchProps) => {
  const [location, setLocation] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bikeStatus, setBikeStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const field =
    "rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15";

  const runSearch = async () => {
    onSearch?.(location, brand, bikeStatus);
    if (!onResults) return;

    try {
      setLoading(true);
      let bikes = await bikeService.searchBike({
        location: location || undefined,
        brand: brand || undefined,
        bikeStatus: bikeStatus || undefined,
      });

      if (category.trim()) {
        const c = category.toLowerCase();
        bikes = bikes.filter(
          (b) =>
            b.fuelType?.toLowerCase().includes(c) ||
            b.bikeName?.toLowerCase().includes(c) ||
            b.brand?.toLowerCase().includes(c)
        );
      }
      if (minPrice) bikes = bikes.filter((b) => b.rentalPrice >= Number(minPrice));
      if (maxPrice) bikes = bikes.filter((b) => b.rentalPrice <= Number(maxPrice));
      onResults(bikes);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLocation("");
    setBrand("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setBikeStatus("");
    onSearch?.("", "", "");
    void (async () => {
      if (!onResults) return;
      onResults(await bikeService.getAllBikes());
    })();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-serif text-lg font-semibold text-foreground">
        Find a bike
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Filter by place, brand, price, and availability
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runSearch();
        }}
        className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6"
      >
        <input className={field} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className={field} placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
        <input className={field} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input className={field} type="number" placeholder="Min ₹" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input className={field} type="number" placeholder="Max ₹" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <select className={field} value={bikeStatus} onChange={(e) => setBikeStatus(e.target.value)}>
          <option value="">All status</option>
          <option value="AVAILABLE">Available</option>
          <option value="BOOKED">Booked</option>
          <option value="UNDER_MAINTENANCE">Under maintenance</option>
          <option value="NOT_AVAILABLE">Not available</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground md:col-span-2 lg:col-span-3"
        >
          {loading ? "Searching..." : "Search"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold md:col-span-1 lg:col-span-3"
        >
          Reset
        </button>
      </form>
    </div>
  );
};

export default BikeSearch;
