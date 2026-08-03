import React, { useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import type { FilterField } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { Star, Shield, Battery, Navigation, BadgeAlert, Award } from "lucide-react";
import toast from "react-hot-toast";

// Mock bikes data
const MOCK_BIKES = [
  { id: 1, name: "VoltPulse Electric S1", type: "electric", price: 200, rating: 4.8, range: "60 km", battery: "95%", location: "Indiranagar", image: "https://images.unsplash.com/photo-1571068316344-75bc76f77891?auto=format&fit=crop&q=80&w=400" },
  { id: 2, name: "AeroRoad Elite Carbon", type: "road", price: 150, rating: 4.6, range: "N/A", battery: "N/A", location: "Koramangala", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400" },
  { id: 3, name: "SummitCrusher Trail XT", type: "mountain", price: 180, rating: 4.7, range: "N/A", battery: "N/A", location: "Whitefield", image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80&w=400" },
  { id: 4, name: "CityGlide Hybrid V2", type: "hybrid", price: 120, rating: 4.4, range: "45 km", battery: "80%", location: "Jayanagar", image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&q=80&w=400" },
  { id: 5, name: "HyperVolt Cruiser Pro", type: "electric", price: 250, rating: 4.9, range: "80 km", battery: "100%", location: "Indiranagar", image: "https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&q=80&w=400" },
  { id: 6, name: "RockyPeak Hardtail", type: "mountain", price: 140, rating: 4.3, range: "N/A", battery: "N/A", location: "Koramangala", image: "https://images.unsplash.com/photo-1576435469652-f2009a5aa81f?auto=format&fit=crop&q=80&w=400" },
];

const FILTER_CONFIGS: FilterField[] = [
  {
    id: "type",
    label: "Bike Type",
    type: "select",
    options: [
      { label: "Electric Bike", value: "electric" },
      { label: "Road Bike", value: "road" },
      { label: "Mountain Bike", value: "mountain" },
      { label: "Hybrid Bike", value: "hybrid" },
    ],
  },
  {
    id: "location",
    label: "Location",
    type: "checkbox",
    options: [
      { label: "Indiranagar", value: "Indiranagar" },
      { label: "Koramangala", value: "Koramangala" },
      { label: "Whitefield", value: "Whitefield" },
      { label: "Jayanagar", value: "Jayanagar" },
    ],
  },
  {
    id: "price",
    label: "Price / hr",
    type: "range",
    min: 100,
    max: 300,
    step: 10,
  },
];

export default function Bikes() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [bookingBike, setBookingBike] = useState<typeof MOCK_BIKES[0] | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = (val: Record<string, any>) => {
    setFilters(val);
    setPage(1);
  };

  // Filter client-side
  const filteredBikes = MOCK_BIKES.filter((bike) => {
    // Search filter
    if (search && !bike.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // Type filter
    if (filters.type && bike.type !== filters.type) {
      return false;
    }
    // Location checkboxes
    if (filters.location && filters.location.length > 0) {
      if (!filters.location.includes(bike.location)) {
        return false;
      }
    }
    // Price range
    if (filters.price) {
      const [min, max] = filters.price;
      if (bike.price < min || bike.price > max) {
        return false;
      }
    }
    return true;
  });

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredBikes.length / itemsPerPage);
  const paginatedBikes = filteredBikes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleBookClick = (bike: typeof MOCK_BIKES[0]) => {
    setBookingBike(bike);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = async () => {
    setConfirmLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConfirmLoading(false);
    setIsBookingOpen(false);
    toast.success(`Successfully booked ${bookingBike?.name}! Your ride is ready.`);
    setBookingBike(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-background min-h-screen text-foreground space-y-8">
      {/* Header Info */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
          Explore Our Smart Fleet
        </h1>
        <p className="text-base text-muted-foreground">
          Premium rides equipped with Live GPS tracking, smart locks, battery levels display, and instantaneous booking. Select your perfect match below.
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search bike models, keywords..."
            width="w-full sm:max-w-md"
          />
        </div>
        <FilterBar
          filters={FILTER_CONFIGS}
          value={filters}
          onChange={handleFilterChange}
          onClearAll={() => setFilters({})}
          label="Refine Fleet"
        />
      </div>

      {/* Grid List */}
      {paginatedBikes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedBikes.map((bike) => (
            <div
              key={bike.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {/* Bike Image */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 rounded-xl bg-card/90 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-foreground border border-border shadow-sm">
                  {bike.location}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {bike.type}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      <span>{bike.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-foreground leading-tight truncate">
                    {bike.name}
                  </h3>
                </div>

                {/* Tech Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-y border-border py-3">
                  <div className="flex items-center gap-1.5">
                    <Battery className="h-4 w-4 text-primary" />
                    <span>Battery: {bike.battery}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Navigation className="h-4 w-4 text-primary" />
                    <span>Range: {bike.range}</span>
                  </div>
                </div>

                {/* Footer Pricing & CTA */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-lg font-black text-foreground">₹{bike.price}</span>
                    <span className="text-xs text-muted-foreground">/ hr</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookClick(bike)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95"
                  >
                    Rent Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border border-dashed border-border rounded-2xl bg-card">
          <BadgeAlert className="h-12 w-12 text-muted-foreground/60" />
          <h3 className="text-lg font-bold text-foreground">No Rides Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try adjusting your search criteria or resetting filters to check for available bikes in our fleet.
          </p>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showJumpToPage={false}
          />
        </div>
      )}

      {/* Booking Confirmation Dialog Modal */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => !confirmLoading && setIsBookingOpen(false)}
        size="md"
      >
        <ModalHeader onClose={() => !confirmLoading && setIsBookingOpen(false)}>
          Confirm Ride Booking
        </ModalHeader>
        <ModalBody>
          {bookingBike && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <img
                  src={bookingBike.image}
                  alt={bookingBike.name}
                  className="h-16 w-20 rounded-xl object-cover border border-border"
                />
                <div>
                  <h4 className="font-bold text-sm text-foreground">{bookingBike.name}</h4>
                  <p className="text-xs text-muted-foreground capitalize">
                    {bookingBike.type} fleet • {bookingBike.location}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-3.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Rental rate</span>
                  <span className="text-foreground font-semibold">₹{bookingBike.price} / hour</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Security Deposit</span>
                  <span className="text-foreground font-semibold">₹500 (Fully Refundable)</span>
                </div>
                <div className="border-t border-border pt-3.5 flex justify-between text-sm font-bold">
                  <span>Estimated Total</span>
                  <span className="text-primary">₹{bookingBike.price + 500}</span>
                </div>
              </div>

              <div className="flex gap-2 items-start text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  By confirming, you agree to our Terms of Rental, speed limits, helmet requirements, and verification protocols. Live GPS tracking will be enabled on this ride.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            disabled={confirmLoading}
            onClick={() => setIsBookingOpen(false)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmLoading}
            onClick={handleConfirmBooking}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {confirmLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            )}
            {confirmLoading ? "Processing..." : "Confirm & Pay"}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
