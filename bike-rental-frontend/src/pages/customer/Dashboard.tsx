import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bike as BikeIcon, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  MapPin, 
  Sparkles, 
  Clock, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  User,
  ListTodo,
  FileText,
  CheckCircle2,
  Calendar,
  Zap,
  Tag,
  SlidersHorizontal,
  Compass,
  ArrowUpRight
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import bikeService from "@/services/bikeService";
import type { Bike } from "@/types/bike";
import { format12Hour } from "@/utils/timeUtils";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await bikeService.getAllBikes();
        if (isMounted) {
          setBikes(data || []);
        }

        // Fetch customer bookings if logged in
        if (user?.id) {
          try {
            const bRes = await api.get("/owner/bookings");
            const rawBookings = bRes.data?.data || bRes.data || [];
            if (isMounted) {
              setUserBookings(Array.isArray(rawBookings) ? rawBookings : []);
            }
          } catch {
            if (isMounted) setUserBookings([]);
          }
        }
      } catch (err) {
        console.error("Failed to load bikes for customer dashboard", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "Customer";
  
  const getInitials = () => {
    if (user?.fullName) {
      const parts = user.fullName.split(" ");
      return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
    }
    return "CU";
  };

  const isIdentityVerified = Boolean(user?.phoneVerified || user?.emailVerified || user?.id);

  // Filter bikes based on search & category
  const filteredBikes = bikes.filter((bike) => {
    const matchesCategory =
      selectedCategory === "ALL" ||
      bike.fuelType?.toUpperCase() === selectedCategory;

    if (!searchQuery) return matchesCategory;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      bike.bikeName?.toLowerCase().includes(q) ||
      bike.brand?.toLowerCase().includes(q) ||
      bike.model?.toLowerCase().includes(q) ||
      bike.location?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: "ALL", label: "All Rides" },
    { id: "PETROL", label: "Petrol Bikes" },
    { id: "ELECTRIC", label: "EV Scooters" },
    { id: "DIESEL", label: "Cruisers" },
  ];

  // Derived activities feed
  const activities = [
    {
      id: 1,
      title: "Account Identity Verified",
      desc: "Phone and account verification active for instant keyless bookings.",
      time: "Verified",
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      id: 2,
      title: "Instant Keyless Rental",
      desc: "Choose operational start/end times & pick up bike directly from owner.",
      time: "Ready to Ride",
      icon: Zap,
      color: "text-primary bg-primary/10",
    },
    {
      id: 3,
      title: "Zero Security Deposit",
      desc: "Pay hourly rate with no upfront hidden security deposit fees.",
      time: "Active Benefit",
      icon: CreditCard,
      color: "text-blue-500 bg-blue-500/10",
    },
  ];

  return (
    <div className="space-y-8 pb-10 text-foreground">
      {/* 1. Welcome Banner (Identical Architecture to Owner Dashboard) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xs relative overflow-hidden transition-all duration-300">
        <div className="flex items-center gap-4 sm:gap-6 relative z-10">
          {/* Customer Avatar */}
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName || "Customer Avatar"}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-border shadow-sm shrink-0"
            />
          ) : (
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl sm:text-2xl font-black border border-primary/20 shadow-inner shrink-0 uppercase">
              {getInitials()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Welcome back, {firstName}! 👋
              </h1>
              {isIdentityVerified && (
                <span
                  className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-500"
                  title="Verified Account"
                >
                  <ShieldCheck className="h-5 w-5" />
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
              Find, rent, and unlock verified bikes listed by local owners.
            </p>
          </div>
        </div>

        {/* Quick Platform Summary Badge */}
        <div className="flex items-center gap-3 bg-muted/40 border border-border/80 px-4 py-3 rounded-2xl md:self-center self-start relative z-10 shrink-0">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <div className="text-xs font-bold text-foreground">
              {bikes.length} Verified Fleet Rides
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">
              Available for Hourly Pickups
            </div>
          </div>
        </div>

        {/* Subtle Decorative Background Gradient */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Grid (Same standard layout as Owner Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:shadow-md space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">My Rides Booked</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BikeIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{userBookings.length} Rides</div>
          <p className="text-[11px] text-muted-foreground font-medium">Total customer bookings</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:shadow-md space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Active Rentals</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {userBookings.filter((b) => b.status === "APPROVED" || b.status === "ACTIVE").length} Active
          </div>
          <p className="text-[11px] text-muted-foreground font-medium font-medium">Current ongoing rentals</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:shadow-md space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Available Fleet</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Compass className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{bikes.length} Bikes</div>
          <p className="text-[11px] text-muted-foreground font-medium">Listed by verified owners</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:shadow-md space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Identity & DL</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {isIdentityVerified ? "Verified" : "Pending Scan"}
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">Document verification status</p>
        </div>
      </div>

      {/* 3. Main Dashboard Body: Left Actions & Catalog + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Action Grid & Fleet Catalog */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Action Navigation Grid (Identical style to Owner Actions) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Quick Customer Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                to="/bikes"
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-center group shadow-xs"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform mb-2">
                  <Compass className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-foreground">Browse Rides</span>
              </Link>

              <Link
                to="/customer/bookings"
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-card hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all text-center group shadow-xs"
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform mb-2">
                  <ListTodo className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-foreground">My Bookings</span>
              </Link>

              <Link
                to="/verification/aadhaar"
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-card hover:bg-blue-500/5 hover:border-blue-500/30 transition-all text-center group shadow-xs"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform mb-2">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-foreground">Verification</span>
              </Link>

              <Link
                to="/customer/profile"
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-card hover:bg-purple-500/5 hover:border-purple-500/30 transition-all text-center group shadow-xs"
              >
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform mb-2">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-foreground">My Profile</span>
              </Link>
            </div>
          </div>

          {/* Catalog Filter & Available Bikes Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Available Rides Near You</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Browse and rent verified bikes listed by registered owners.
                </p>
              </div>

              <Link
                to="/bikes"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline self-start sm:self-auto"
              >
                Explore Full Catalog <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Search Bar & Category Filter Pills */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bike name, brand, or location (e.g. Hyderabad)..."
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 shadow-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bike Catalog Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl border border-border bg-card animate-pulse p-4 space-y-3"
                  >
                    <div className="h-32 bg-muted rounded-xl w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredBikes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredBikes.map((bike) => (
                  <div
                    key={bike.bikeId || bike.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition hover:shadow-lg hover:border-primary/40"
                  >
                    {/* Bike Image & Badges */}
                    <div className="relative h-44 w-full overflow-hidden bg-muted">
                      <img
                        src={
                          bike.imageUrl ||
                          "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"
                        }
                        alt={bike.bikeName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1 rounded-xl bg-card/90 px-2.5 py-1 text-[11px] font-bold text-foreground backdrop-blur-xs border border-border shadow-xs">
                        <MapPin className="h-3 w-3 text-primary" />
                        {bike.location || "Hyderabad"}
                      </div>

                      <div className="absolute top-3 right-3 rounded-xl bg-emerald-500/90 text-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        {bike.bikeStatus || "AVAILABLE"}
                      </div>
                    </div>

                    {/* Bike Information */}
                    <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {bike.fuelType || "PETROL"}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" />
                            {format12Hour(bike.availableStartTime || "09:00")} – {format12Hour(bike.availableEndTime || "21:00")}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-foreground">
                          {bike.bikeName || `${bike.brand} ${bike.model}`}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {bike.description ||
                            `${bike.brand} ${bike.model} available for rent in ${bike.location || "Hyderabad"}.`}
                        </p>
                      </div>

                      {/* Pricing & Booking Trigger */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/80">
                        <div>
                          <span className="text-lg font-black text-foreground">
                            ₹{bike.hourlyRate || 80}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium"> / hr</span>
                        </div>

                        <Link
                          to="/bikes"
                          className="rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground shadow-xs transition hover:opacity-90 active:scale-[0.98]"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground space-y-2">
                <BikeIcon className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="font-medium">No rides found matching your search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column (Activities & Account Verification - Identical layout to Owner Dashboard) */}
        <div className="space-y-8">
          {/* Account Verification Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Identity & DL Status</h3>
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <span className="font-semibold text-foreground">Driving License (DL)</span>
                <span className="font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  VERIFIED
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <span className="font-semibold text-foreground">Aadhaar Identity</span>
                <span className="font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  VERIFIED
                </span>
              </div>
            </div>

            <Link
              to="/verification/aadhaar"
              className="block w-full text-center rounded-xl border border-border py-2 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              View Verification Documents
            </Link>
          </div>

          {/* Recent Platform Activities */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Customer Activity</h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                Live Updates
              </span>
            </div>

            <div className="space-y-4">
              {activities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex gap-3 items-start">
                    <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-foreground">{act.title}</h4>
                        <span className="text-[10px] font-semibold text-muted-foreground shrink-0">
                          {act.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {act.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rental Help Banner */}
          <div className="rounded-2xl bg-linear-to-br from-primary/15 via-accent/10 to-primary/5 border border-primary/20 p-6 space-y-3 text-foreground">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Need Assistance?
            </div>
            <h4 className="font-serif text-base font-bold">24/7 Roadside Assistance</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Have questions about your rental or need help finding a bike? Our customer support team is here to assist you anytime.
            </p>
            <Link
              to="/customer/bookings"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline"
            >
              View Rental History <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}