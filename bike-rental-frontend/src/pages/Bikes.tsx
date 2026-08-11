import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import type { FilterField } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { Star, Shield, Battery, Navigation, BadgeAlert, Award, Loader2, FileText, CheckCircle2, ShieldCheck, Upload, Sparkles, ArrowRight, Clock } from "lucide-react";
import toast from "react-hot-toast";
import bikeService from "@/services/bikeService";
import { verifyAadhaar, verifyDrivingLicense } from "@/services/verificationService";
import { BookingService } from "@/services/bookingService";
import api from "@/api/axios";
import useAuth from "@/hooks/useAuth";
import type { Bike } from "@/types/bike";
import { format12Hour, isBikeAvailableNow } from "@/utils/timeUtils";
import { ROUTES } from "@/constants/routes";
import DocumentScanner from "@/components/verification/DocumentScanner";

// Fallback mock bikes if database has zero bikes
const INITIAL_MOCK_BIKES = [
  { id: 101, name: "VoltPulse Electric S1", type: "electric", price: 200, rating: 4.8, range: "60 km", battery: "95%", location: "Indiranagar", image: "https://images.unsplash.com/photo-1571068316344-75bc76f77891?auto=format&fit=crop&q=80&w=400" },
  { id: 102, name: "AeroRoad Elite Carbon", type: "road", price: 150, rating: 4.6, range: "N/A", battery: "N/A", location: "Koramangala", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400" },
  { id: 103, name: "SummitCrusher Trail XT", type: "mountain", price: 180, rating: 4.7, range: "N/A", battery: "N/A", location: "Whitefield", image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80&w=400" },
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
      { label: "Petrol Bike", value: "petrol" },
    ],
  },
  {
    id: "location",
    label: "Location",
    type: "checkbox",
    options: [
      { label: "Hyderabad", value: "Hyderabad" },
      { label: "Indiranagar", value: "Indiranagar" },
      { label: "Koramangala", value: "Koramangala" },
      { label: "Whitefield", value: "Whitefield" },
    ],
  },
  {
    id: "price",
    label: "Price / hr",
    type: "range",
    min: 50,
    max: 500,
    step: 10,
  },
];

export default function Bikes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allBikes, setAllBikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);

  // Booking & Verification Modals
  const [bookingBike, setBookingBike] = useState<any | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);

  const getTodayDateTimeString = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  const getReturnDateTimeString = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 3);
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  const timeSlots: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const padHour = String(displayHour).padStart(2, "0");
      const padMin = String(m).padStart(2, "0");
      const val = `${String(h).padStart(2, "0")}:${padMin}`;
      const label = `${padHour}:${padMin} ${period}`;
      timeSlots.push({ value: val, label });
    }
  }

  const [pickupDate, setPickupDate] = useState(getTodayDateTimeString());
  const [returnDate, setReturnDate] = useState(getReturnDateTimeString());

  const getTimeString = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    const parts = dateTimeStr.split(/[T ]/);
    return parts[1] ? parts[1].slice(0, 5) : "";
  };

  const updateTimeInDateTimeString = (dateTimeStr: string, timeStr: string) => {
    if (!dateTimeStr) return "";
    const parts = dateTimeStr.split(/[T ]/);
    const separator = dateTimeStr.includes("T") ? "T" : " ";
    return `${parts[0]}${separator}${timeStr}`;
  };

  // Document Scan / Verification Modal States
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStep, setScanStep] = useState<"aadhaar" | "dl">("aadhaar");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [scanningDoc, setScanningDoc] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const apiBikes = await bikeService.getAllBikes();
        if (!active) return;

        const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
        const combinedRaw = [...(apiBikes || [])];

        localCached.forEach((b) => {
          if (!combinedRaw.some((cb) => cb.registrationNumber === b.registrationNumber)) {
            combinedRaw.unshift(b);
          }
        });

        const mappedRealBikes = combinedRaw.map((b: Bike, index: number) => ({
          id: b.bikeId || b.id || index + 1,
          name: b.bikeName || `${b.brand} ${b.model}`.trim() || "Rental Bike",
          type: (b.fuelType || "petrol").toLowerCase(),
          price: b.hourlyRate || Math.round((b.rentalPrice || 500) / 8),
          rentalPrice: b.rentalPrice || 500,
          rating: 4.9,
          range: b.mileage || "45 km/l",
          battery: b.fuelType?.toUpperCase() === "ELECTRIC" ? "98%" : "N/A",
          location: b.location || "Hyderabad",
          image: b.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400",
          brand: b.brand,
          model: b.model,
          registrationNumber: b.registrationNumber,
          availableStartTime: b.availableStartTime,
          availableEndTime: b.availableEndTime,
        }));

        // Display real DB bikes prominently, fallback to mock bikes if DB is empty
        const combined = mappedRealBikes.length > 0 ? mappedRealBikes : INITIAL_MOCK_BIKES;
        setAllBikes(combined);
      } catch (err) {
        console.error("Could not fetch bikes:", err);
        setAllBikes(INITIAL_MOCK_BIKES);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user || allBikes.length === 0) return;

    const restorePendingBooking = async () => {
      const pendingStr = localStorage.getItem("pending_booking");
      if (!pendingStr) return;

      try {
        const pending = JSON.parse(pendingStr);
        if (pending && pending.bikeId) {
          const isVerified = await BookingService.checkVerificationStatus(Number(user.id));
          if (isVerified) {
            const bike = allBikes.find((b) => Number(b.id) === Number(pending.bikeId));
            if (bike) {
              setPickupDate(getTodayDateTimeString());
              setReturnDate(getReturnDateTimeString());
              setBookingBike(bike);
              setIsBookingOpen(true);
              toast.success("Identity verified! Continuing your booking for " + bike.name);
            }
            localStorage.removeItem("pending_booking");
          }
        }
      } catch (err) {
        console.error("Error restoring pending booking:", err);
      }
    };

    restorePendingBooking();
  }, [allBikes, user]);



  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = (val: Record<string, any>) => {
    setFilters(val);
    setPage(1);
  };

  // Filter client-side
  const filteredBikes = allBikes.filter((bike) => {

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

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredBikes.length / itemsPerPage);
  const paginatedBikes = filteredBikes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleBookClick = async (bike: any) => {
    if (!user) {
      toast.error("Please login to book a bike.");
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!isBikeAvailableNow(bike.availableStartTime, bike.availableEndTime)) {
      toast.error(
        `This bike is outside its operational shift (${format12Hour(
          bike.availableStartTime || "09:00"
        )} – ${format12Hour(bike.availableEndTime || "21:00")}). Bookings resume during shift hours!`
      );
      return;
    }

    try {
      const freshPickup = getTodayDateTimeString();
      const freshReturn = getReturnDateTimeString();
      setPickupDate(freshPickup);
      setReturnDate(freshReturn);

      // 0. Check bike availability for selected time
      const isAvailable = await BookingService.checkAvailability(
        bike.id,
        freshPickup,
        freshReturn
      );

      if (!isAvailable) {
        setIsUnavailableModalOpen(true);
        return;
      }

      setBookingBike(bike);
      const customerId = Number(user.id);

      // 1. Check overall verification status from backend
      const isVerified = await BookingService.checkVerificationStatus(customerId);

      if (isVerified) {
        // Both documents verified -> open booking confirmation modal directly
        setIsBookingOpen(true);
        return;
      }

      // If either Aadhaar or DL is not verified, save pending booking and redirect to Verification Module
      toast.error("You need to complete identity verification to rent a bike.");
      localStorage.setItem(
        "pending_booking",
        JSON.stringify({
          bikeId: bike.id,
          returnRoute: window.location.pathname,
        })
      );
      navigate("/verification");
    } catch (err) {
      console.error("Verification check failed:", err);
      toast.error("Could not verify listing status. Please try again.");
    }
  };

  // Handle Document File Selection
  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setDocPreview(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  // Handles Aadhaar/DL document upload OCR scanning
  const handleProcessScan = async () => {
    if (!docFile || !user) {
      toast.error("Please select a document image to scan.");
      return;
    }

    try {
      setScanningDoc(true);

      if (scanStep === "aadhaar") {
        const result = await verifyAadhaar(docFile, user.id, "USER");
        if (result.status !== "VERIFIED" && result.status !== "APPROVED") {
          toast.error(result.rejectionReason || "Aadhaar OCR scan failed. Ensure card is clear.");
          setScanningDoc(false);
          return;
        }

        toast.success("Aadhaar Verified! Next: Upload Driving License (DL).");
        setDocFile(null);
        setDocPreview(null);
        setScanningDoc(false);
        setScanStep("dl");
      } else {
        const result = await verifyDrivingLicense(docFile, user.id);
        if (!result.verified) {
          toast.error(result.message || "Driving License OCR scan failed. Ensure DL name matches Aadhaar.");
          setScanningDoc(false);
          return;
        }

        toast.success("Identity & Driving License Verified Successfully!");
        setScanningDoc(false);
        setShowScanModal(false);
        setDocFile(null);
        setDocPreview(null);
        setIsBookingOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Verification service error.");
      setScanningDoc(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingBike || !user) return;
    try {
      setConfirmLoading(true);

      // Check bike availability for selected time
      const isAvailable = await BookingService.checkAvailability(
        Number(bookingBike.id),
        pickupDate,
        returnDate
      );

      if (!isAvailable) {
        setIsBookingOpen(false);
        setIsUnavailableModalOpen(true);
        setConfirmLoading(false);
        return;
      }

      const bookingRequest = {
        bikeId: Number(bookingBike.id),
        startTime: pickupDate,
        returnTime: returnDate,
      };

      await BookingService.createBooking(Number(user.id), bookingRequest);
      toast.success(`Successfully booked ${bookingBike.name}! Redirecting to Bookings...`);
      setIsBookingOpen(false);
      setBookingBike(null);
      navigate("/customer/bookings");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Booking failed.");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen text-foreground space-y-8">
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
            placeholder="Search by ride name, brand, model, or location..."
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
          {paginatedBikes.map((bike) => {
            const isShiftActive = isBikeAvailableNow(bike.availableStartTime, bike.availableEndTime);

            return (
              <div
                key={bike.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {/* Bike Image & Live Shift Badge */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={bike.image}
                    alt={bike.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md ${
                        isShiftActive
                          ? "bg-emerald-500/90 text-white"
                          : "bg-amber-500/90 text-white"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      {isShiftActive ? "Available Now" : "Shift Closed"}
                    </span>
                  </div>
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

                  {/* Tech Specs & Shift Hours */}
                  <div className="space-y-2 border-y border-border py-3 text-xs text-muted-foreground">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5">
                        <Battery className="h-4 w-4 text-primary" />
                        <span>Battery: {bike.battery}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Navigation className="h-4 w-4 text-primary" />
                        <span>Range: {bike.range}</span>
                      </div>
                    </div>
                    {(bike.availableStartTime || bike.availableEndTime) && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-foreground/80 pt-1">
                        <span className="font-bold text-primary">Operating Shift:</span>{" "}
                        {format12Hour(bike.availableStartTime || "09:00")} –{" "}
                        {format12Hour(bike.availableEndTime || "21:00")}
                      </div>
                    )}
                  </div>

                  {/* Footer Pricing & CTA */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-lg font-black text-foreground">₹{bike.price}</span>
                      <span className="text-xs text-muted-foreground">/ hr</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const routePrefix = user?.role === "CUSTOMER" ? "/customer" : "";
                          navigate(`${routePrefix}/bikes/${bike.id}`);
                        }}
                        className="px-3.5 py-2 text-xs font-bold rounded-xl border border-primary text-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                      >
                        View Details
                      </button>
                      {isShiftActive ? (
                        <button
                          type="button"
                          onClick={() => handleBookClick(bike)}
                          className="px-3.5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95 flex items-center gap-1"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Rent Now
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="Outside operating hours"
                          className="px-3.5 py-2 text-xs font-bold rounded-xl bg-muted text-muted-foreground border border-border cursor-not-allowed flex items-center gap-1"
                        >
                          Shift Closed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* DOCUMENT VERIFICATION MODAL (Triggered when customer clicks "Rent Now" if Aadhaar/DL not yet verified) */}
      <Modal
        isOpen={showScanModal}
        onClose={() => !scanningDoc && setShowScanModal(false)}
        size="md"
      >
        <ModalHeader onClose={() => !scanningDoc && setShowScanModal(false)}>
          Identity & DL Scan Required for Rental
        </ModalHeader>
        <ModalBody>
          <div className="space-y-5">
            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>One-Time Scan Before Unlocking Ride</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scan your <strong>{scanStep === "aadhaar" ? "Aadhaar Card" : "Driving License (DL)"}</strong> to complete instant verification. Once scanned, you can book any ride immediately!
              </p>
            </div>

            {/* Document Upload & Preview */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upload {scanStep === "aadhaar" ? "Aadhaar Card" : "Driving License (DL)"} Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleDocFileChange}
                disabled={scanningDoc}
                className="w-full text-xs text-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
              />

              {docPreview && (
                <DocumentScanner
                  imageSrc={docPreview}
                  scanning={scanningDoc}
                  steps={
                    scanStep === "aadhaar"
                      ? ["Reading Aadhaar Image", "Extracting Name & DOB", "Validating Identity"]
                      : ["Reading License Photo", "Extracting DL Number", "Fuzzy Name Match"]
                  }
                />
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            disabled={scanningDoc}
            onClick={() => setShowScanModal(false)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={scanningDoc || !docFile}
            onClick={handleProcessScan}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {scanningDoc ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Scanning Document...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                Verify {scanStep === "aadhaar" ? "Aadhaar" : "Driving License"} & Proceed
              </>
            )}
          </button>
        </ModalFooter>
      </Modal>

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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pickup Date</label>
                  <input
                    type="date"
                    value={pickupDate.split(/[T ]/)[0]}
                    onChange={(e) => setPickupDate(e.target.value + "T" + getTimeString(pickupDate))}
                    className="w-full rounded-xl border border-border bg-card px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pickup Time</label>
                  <div className="relative flex items-center">
                    <select
                      value={getTimeString(pickupDate)}
                      onChange={(e) => setPickupDate(pickupDate.split(/[T ]/)[0] + "T" + e.target.value)}
                      className="w-full rounded-xl border border-border bg-card pl-2.5 pr-8 py-2 text-xs text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                    <Clock className="absolute right-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Return Date</label>
                  <input
                    type="date"
                    value={returnDate.split(/[T ]/)[0]}
                    onChange={(e) => setReturnDate(e.target.value + "T" + getTimeString(returnDate))}
                    className="w-full rounded-xl border border-border bg-card px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Return Time</label>
                  <div className="relative flex items-center">
                    <select
                      value={getTimeString(returnDate)}
                      onChange={(e) => setReturnDate(returnDate.split(/[T ]/)[0] + "T" + e.target.value)}
                      className="w-full rounded-xl border border-border bg-card pl-2.5 pr-8 py-2 text-xs text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                    <Clock className="absolute right-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-3.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Rental rate</span>
                  <span className="text-foreground font-semibold">₹{bookingBike.price} / hour</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground font-medium">Daily Rate (Est.)</span>
                  <span className="text-foreground font-semibold">₹{bookingBike.rentalPrice || 500} / day</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground font-medium">Verified Identity</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Aadhaar & DL Approved
                  </span>
                </div>
                <div className="border-t border-border pt-3.5 flex justify-between text-sm font-bold">
                  <span>Estimated Total</span>
                  <span className="text-primary font-black">
                    ₹{(() => {
                      const start = new Date(pickupDate);
                      const end = new Date(returnDate);
                      const diffTime = Math.abs(end.getTime() - start.getTime());
                      const diffHours = diffTime / (1000 * 60 * 60);
                      return Math.round(diffHours * bookingBike.price);
                    })()}
                  </span>
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
            {/* if valid user with aadhar and drivving license then it should show rent now otherwise it should show verify */}
            
          </button>
        </ModalFooter>
      </Modal>

      {/* Unavailable Bike Modal */}
      <Modal
        isOpen={isUnavailableModalOpen}
        onClose={() => setIsUnavailableModalOpen(false)}
        size="sm"
      >
        <ModalHeader onClose={() => setIsUnavailableModalOpen(false)}>
          Bike Unavailable
        </ModalHeader>
        <ModalBody>
          <div className="p-5 text-center">
            <p className="text-sm font-semibold text-foreground">Bike is already booked.</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={() => setIsUnavailableModalOpen(false)}
            className="w-full px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center cursor-pointer"
          >
            OK
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
