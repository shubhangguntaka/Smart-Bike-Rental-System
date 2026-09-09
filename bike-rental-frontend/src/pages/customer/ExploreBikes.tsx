import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bike as BikeIcon,
  Zap,
  Flame,
  ArrowUpDown,
  X,
  Eye,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Compass,
  Gauge,
  Fuel,
  ArrowRight,
  Tag,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import bikeService from "@/services/bikeService";
import { normalizeBike, type NormalizedBike } from "@/utils/bikeUtils";
import { format12Hour, getShiftState } from "@/utils/timeUtils";
import BikeAvailability from "@/components/bike/BikeAvailability";
import BikeDetailsModal from "@/components/bike/BikeDetailsModal";
import RentBikeModal from "@/components/bike/RentBikeModal";
import { subscribeBikeUpdates } from "@/utils/syncUtils";
import useBikeSse from "@/hooks/useBikeSse";
import useAuth from "@/hooks/useAuth";

export default function ExploreBikes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useBikeSse();

  const [bikes, setBikes] = useState<NormalizedBike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [onlyAvailableNow, setOnlyAvailableNow] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [sortBy, setSortBy] = useState<"PRICE_ASC" | "PRICE_DESC" | "RATING" | "NAME">("PRICE_ASC");

  // Selected Bike for Modals
  const [viewBike, setViewBike] = useState<NormalizedBike | null>(null);
  const [bookingBike, setBookingBike] = useState<NormalizedBike | null>(null);

  // Fetch Bikes from backend & sync with local store
  const loadBikes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all bikes using existing bikeService logic
      const rawBikes = await bikeService.getAllBikes();

      // Fetch active bookings to filter out already booked bikes
      const approvedBookings: any[] = [];
      try {
        ["custom_user_bookings", "user_bookings", "customer_bookings"].forEach((key) => {
          const list = JSON.parse(localStorage.getItem(key) || "[]");
          (list || []).forEach((b: any) => {
            const s = (b.bookingStatus || b.status || "").toUpperCase();
            if (s === "APPROVED" || s === "CONFIRMED" || s === "ACTIVE") {
              approvedBookings.push(b);
            }
          });
        });
      } catch (e) {
        // ignore JSON parse error
      }

      // Check local owner override updates
      const localOwnerBikes: any[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");

      const normalizedList = (rawBikes || []).map((b, index) => {
        let bStatus = b.bikeStatus || "AVAILABLE";

        const isApprovedBooked = approvedBookings.some((ab: any) => {
          const nameMatch = ab.bikeName && b.bikeName && ab.bikeName.trim().toLowerCase() === b.bikeName.trim().toLowerCase();
          const idMatch = (ab.bikeId || ab.id) && (Number(ab.bikeId || ab.id) === Number(b.bikeId || b.id));
          return nameMatch || idMatch;
        });

        const localMatch = localOwnerBikes.find((lb: any) => {
          const nameMatch = lb.bikeName && b.bikeName && lb.bikeName.trim().toLowerCase() === b.bikeName.trim().toLowerCase();
          const idMatch = (lb.id || lb.bikeId) && (Number(lb.id || lb.bikeId) === Number(b.bikeId || b.id));
          return nameMatch || idMatch;
        });

        if (isApprovedBooked || (localMatch && localMatch.bikeStatus === "BOOKED")) {
          bStatus = "BOOKED";
        }

        const norm = normalizeBike(b, index);
        return {
          ...norm,
          bikeStatus: bStatus,
        };
      });

      setBikes(normalizedList);
    } catch (err: any) {
      console.error("Failed to load bikes:", err);
      setError("Unable to connect to bike rental server. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBikes();
  }, []);

  // Extract unique locations for the dropdown
  const uniqueLocations = useMemo(() => {
    const locSet = new Set<string>();
    bikes.forEach((b) => {
      if (b.location && b.location.trim()) {
        locSet.add(b.location.trim());
      }
    });
    return Array.from(locSet);
  }, [bikes]);

  // Compute filtered & sorted bikes
  const filteredBikes = useMemo(() => {
    return bikes
      .filter((bike) => {
        // 1. Search Query Match
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          const nameMatch = bike.name.toLowerCase().includes(query);
          const brandMatch = bike.brand.toLowerCase().includes(query);
          const modelMatch = bike.model.toLowerCase().includes(query);
          const locMatch = bike.location.toLowerCase().includes(query);
          const regMatch = bike.registrationNumber.toLowerCase().includes(query);
          if (!nameMatch && !brandMatch && !modelMatch && !locMatch && !regMatch) {
            return false;
          }
        }

        // 2. Category Match
        if (selectedCategory !== "ALL") {
          const isEv = bike.fuelType.includes("ELECTRIC") || bike.type === "electric";
          if (selectedCategory === "ELECTRIC" && !isEv) return false;
          if (selectedCategory === "PETROL" && isEv) return false;
          if (selectedCategory === "SPORTS" && !bike.name.toLowerCase().includes("r15") && !bike.name.toLowerCase().includes("duke") && !bike.name.toLowerCase().includes("ninja") && !bike.name.toLowerCase().includes("pulsar") && !bike.name.toLowerCase().includes("rc")) return false;
          if (selectedCategory === "SCOOTER" && !bike.name.toLowerCase().includes("activa") && !bike.name.toLowerCase().includes("jupiter") && !bike.name.toLowerCase().includes("scooter") && !bike.name.toLowerCase().includes("vespa") && !bike.name.toLowerCase().includes("ather")) return false;
        }

        // 3. Location Match
        if (selectedLocation !== "ALL") {
          if (bike.location.toLowerCase() !== selectedLocation.toLowerCase()) {
            return false;
          }
        }

        // 4. Max Hourly Rate Match
        if (bike.hourlyRate > maxPrice) {
          return false;
        }

        // 5. Availability Status Filter
        if (onlyAvailableNow) {
          const shiftState = getShiftState(
            bike.availableStartTime,
            bike.availableEndTime,
            bike.bikeStatus,
            bike.availableDate
          );
          if (shiftState !== "AVAILABLE") {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "PRICE_ASC") return a.hourlyRate - b.hourlyRate;
        if (sortBy === "PRICE_DESC") return b.hourlyRate - a.hourlyRate;
        if (sortBy === "RATING") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "NAME") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [bikes, searchTerm, selectedCategory, selectedLocation, onlyAvailableNow, maxPrice, sortBy]);

  const availableCount = useMemo(() => {
    return bikes.filter((b) => {
      const state = getShiftState(b.availableStartTime, b.availableEndTime, b.bikeStatus, b.availableDate);
      return state === "AVAILABLE";
    }).length;
  }, [bikes]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setSelectedLocation("ALL");
    setOnlyAvailableNow(false);
    setMaxPrice(500);
    setSortBy("PRICE_ASC");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground min-h-screen pb-16 font-sans">
      {/* Hero Header & Search Banner */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Compass className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Explore Available Bikes
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Discover top-rated motorcycles and scooters ready for instant rental in your city.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{availableCount} Bikes Available Now</span>
            </span>

            <button
              type="button"
              onClick={loadBikes}
              disabled={loading}
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer"
              title="Refresh available bikes"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="pt-6 space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by bike model (Yamaha R15, Royal Enfield, Activa), brand, or city..."
              className="w-full rounded-2xl border border-border bg-background/80 pl-12 pr-10 py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium placeholder:text-muted-foreground shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills & Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Quick Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "ALL", label: "All Categories", icon: BikeIcon },
                { id: "PETROL", label: "Sports & Petrol", icon: Flame },
                { id: "SCOOTER", label: "Scooters", icon: Zap },
                { id: "ELECTRIC", label: "Electric EVs", icon: Zap },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground border border-border/60"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Location, Price, Availability Toggle, Sorting */}
            <div className="flex flex-wrap items-center gap-2.5 ml-auto">
              {/* Location Select */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="ALL">All Locations</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Select */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="PRICE_ASC">Price: Low → High</option>
                  <option value="PRICE_DESC">Price: High → Low</option>
                  <option value="RATING">Highest Rated</option>
                  <option value="NAME">Name: A → Z</option>
                </select>
              </div>

              {/* Available Now Toggle Switch */}
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailableNow}
                  onChange={(e) => setOnlyAvailableNow(e.target.checked)}
                  className="h-4 w-4 rounded text-primary border-border bg-background focus:ring-ring cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground">Available Now Only</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-foreground">{error}</h3>
          <button
            type="button"
            onClick={loadBikes}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* LOADING STATE: Skeleton Grid */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-border/80 bg-card p-4 space-y-4 animate-pulse shadow-2xs"
            >
              <div className="h-48 w-full bg-muted rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 w-2/3 bg-muted rounded-md" />
                <div className="h-3 w-1/2 bg-muted rounded-md" />
              </div>
              <div className="h-10 w-full bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredBikes.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-border/80 rounded-3xl bg-card space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <BikeIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-foreground">No Available Bikes Found</h3>
            <p className="text-xs text-muted-foreground">
              We couldn't find any bikes matching your search query or active filter selections.
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* AVAILABLE BIKES GRID */}
      {!loading && !error && filteredBikes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Showing {filteredBikes.length} {filteredBikes.length === 1 ? "Bike" : "Bikes"}
            </p>
          </div>

          <div className="space-y-4">
            {filteredBikes.map((bike) => {
              const isAvailableNow =
                getShiftState(
                  bike.availableStartTime,
                  bike.availableEndTime,
                  bike.bikeStatus,
                  bike.availableDate
                ) === "AVAILABLE";

              return (
                <div
                  key={bike.id || bike.bikeId || bike.registrationNumber}
                  className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card hover:bg-card/95 p-4 sm:p-5 shadow-xs hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 transition-all duration-300 flex flex-col md:flex-row items-stretch gap-5"
                >
                  {/* LEFT SIDE: PROMINENT BIKE PHOTO FRAME */}
                  <div className="relative w-full md:w-72 lg:w-80 h-56 md:h-auto min-h-[210px] shrink-0 rounded-2xl bg-muted border border-border/70 overflow-hidden shadow-inner group/photo">
                    <img
                      src={bike.imageUrl || bike.image}
                      alt={bike.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80";
                      }}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover/photo:scale-108"
                    />

                    {/* Top Left: Availability Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <BikeAvailability
                        status={bike.bikeStatus}
                        availableStartTime={bike.availableStartTime}
                        availableEndTime={bike.availableEndTime}
                        availableDate={bike.availableDate}
                        compact
                      />
                    </div>

                    {/* Top Right: Fuel Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md border ${
                        bike.fuelType.includes("ELECTRIC")
                          ? "bg-amber-500/90 text-white border-amber-400/30"
                          : "bg-rose-600/90 text-white border-rose-500/30"
                      }`}>
                        {bike.fuelType.includes("ELECTRIC") ? <Zap className="h-3 w-3 fill-current" /> : <Flame className="h-3 w-3 fill-current" />}
                        {bike.fuelType.includes("ELECTRIC") ? "EV" : "PETROL"}
                      </span>
                    </div>

                    {/* Bottom Floating Badges */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      {bike.rcVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-xl px-2.5 py-0.5 text-[9px] font-black bg-emerald-500 text-white shadow-xs backdrop-blur-md pointer-events-auto">
                          <ShieldCheck className="h-3 w-3" />
                          RC VERIFIED
                        </span>
                      ) : (
                        <span />
                      )}

                      <span className="inline-flex items-center gap-1 rounded-xl px-2 py-0.5 text-[9px] font-bold bg-background/80 text-foreground border border-border/60 shadow-2xs backdrop-blur-md pointer-events-auto">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Helmet Included
                      </span>
                    </div>
                  </div>

                  {/* MIDDLE SECTION: RICH DETAILS & SPECS */}
                  <div className="flex-1 space-y-3.5 flex flex-col justify-between py-1">
                    <div className="space-y-2.5">
                      {/* Badge bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
                          {bike.brand}
                        </span>

                        {bike.engineCapacity && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-lg border border-border/50">
                            <Gauge className="h-3 w-3 text-primary/70" />
                            {bike.engineCapacity}
                          </span>
                        )}

                        {bike.mileage && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-lg border border-border/50">
                            <Fuel className="h-3 w-3 text-emerald-500/80" />
                            {bike.mileage}
                          </span>
                        )}

                        {bike.rating > 0 && (
                          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 ml-auto bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{bike.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Bike Name & Model Info */}
                      <div>
                        <h3 className="font-black text-xl text-foreground group-hover:text-primary transition-colors tracking-tight leading-snug">
                          {bike.name}
                        </h3>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-3 font-medium">
                          <span className="inline-flex items-center gap-1">
                            Model: <strong className="text-foreground font-semibold">{bike.model || bike.brand}</strong>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            Reg: <strong className="font-mono text-foreground">{bike.registrationNumber || "N/A"}</strong>
                          </span>
                          {bike.ownerName && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                Host: <strong className="text-foreground">{bike.ownerName}</strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Specs Pills Grid */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/60">
                      <div className="bg-muted/40 p-2 rounded-xl border border-border/40 text-center">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Transmission</p>
                        <p className="text-xs font-black text-foreground mt-0.5">{bike.transmission || "Manual"}</p>
                      </div>

                      <div className="bg-muted/40 p-2 rounded-xl border border-border/40 text-center">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Seating</p>
                        <p className="text-xs font-black text-foreground mt-0.5">{bike.seatingCapacity || 2} Persons</p>
                      </div>

                      <div className="bg-muted/40 p-2 rounded-xl border border-border/40 text-center">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Deposit</p>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">₹1,000</p>
                      </div>
                    </div>

                    {/* Location & Shift Details Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-foreground truncate bg-muted/30 p-2.5 rounded-xl border border-border/50">
                        <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate">{bike.location}</span>
                      </div>

                      <div className="flex items-center gap-2 font-bold text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50">
                        <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate text-foreground">Shift: {format12Hour(bike.availableStartTime)} – {format12Hour(bike.availableEndTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE: PRICE & CTAS */}
                  <div className="w-full md:w-64 shrink-0 flex flex-col justify-between p-4 rounded-2xl bg-linear-to-b from-primary/5 via-muted/30 to-muted/10 border border-border/70 shadow-xs group-hover:border-primary/40 transition-colors space-y-3">
                    <div className="text-center md:text-right space-y-1">
                      <div className="inline-block md:block">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Rental Price</span>
                        <div className="flex items-baseline justify-center md:justify-end gap-1">
                          <span className="text-3xl font-black text-foreground tracking-tight">
                            ₹{bike.hourlyRate}
                          </span>
                          <span className="text-xs text-muted-foreground font-extrabold">/ hour</span>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-border/40 flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Full Day Pass</span>
                        <span className="text-primary font-extrabold">₹{bike.rentalPrice}</span>
                      </div>
                    </div>

                    <div className="space-y-2 w-full pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => setBookingBike(bike)}
                        className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-primary via-primary/95 to-primary/80 hover:brightness-110 text-primary-foreground text-xs font-black tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-primary/25 active:scale-98"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Book Now</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-80" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewBike(bike)}
                        className="w-full py-2.5 px-3 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs font-bold text-foreground transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK VIEW DETAILS MODAL */}
      {viewBike && (
        <BikeDetailsModal
          isOpen={Boolean(viewBike)}
          onClose={() => setViewBike(null)}
          bike={viewBike}
          onRentNow={(b) => {
            setViewBike(null);
            setBookingBike(b);
          }}
        />
      )}

      {/* RENT BOOKING MODAL */}
      {bookingBike && (
        <RentBikeModal
          isOpen={Boolean(bookingBike)}
          onClose={() => setBookingBike(null)}
          bike={bookingBike}
          onBookingSuccess={() => {
            setBookingBike(null);
            loadBikes();
            toast.success("Booking created successfully!");
          }}
        />
      )}
    </div>
  );
}

function RotateCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}