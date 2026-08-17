import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import type { FilterField } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { Star, Shield, Battery, Navigation, BadgeAlert, Award, Loader2, FileText, CheckCircle2, ShieldCheck, Upload, Sparkles, ArrowRight, Clock, Eye, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import bikeService from "@/services/bikeService";
import { verifyAadhaar, verifyDrivingLicense } from "@/services/verificationService";
import { BookingService } from "@/services/bookingService";
import api from "@/api/axios";
import useAuth from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import type { Bike } from "@/types/bike";
import { format12Hour, isBikeAvailableNow, getShiftState } from "@/utils/timeUtils";
import { ROUTES } from "@/constants/routes";
import DocumentScanner from "@/components/verification/DocumentScanner";
import BikeAvailability from "@/components/bike/BikeAvailability";
import BikeDetailsModal from "@/components/bike/BikeDetailsModal";
import { subscribeBikeUpdates } from "@/utils/syncUtils";
import useBikeSse from "@/hooks/useBikeSse";
import { normalizeBike } from "@/utils/bikeUtils";

// Real database bike catalog

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
  const { nearbyBikes } = useLocation();
  const navigate = useNavigate();
  useBikeSse();

  const [allBikes, setAllBikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState("distance-asc");
  const [page, setPage] = useState(1);

  // Booking & Verification Modals
  const [bookingBike, setBookingBike] = useState<any | null>(null);
  const [selectedViewBike, setSelectedViewBike] = useState<any | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
  const [unavailableMessage, setUnavailableMessage] = useState<string>("");

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

  const getFilteredTimeSlots = (dateTimeStr: string) => {
    if (!dateTimeStr) return timeSlots;
    const selectedDateStr = dateTimeStr.split(/[T ]/)[0];
    const todayStr = new Date().toISOString().slice(0, 10);
    if (selectedDateStr !== todayStr) {
      return timeSlots;
    }
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return timeSlots.filter((slot) => {
      const [h, m] = slot.value.split(":").map(Number);
      const slotMinutes = h * 60 + m;
      return slotMinutes >= currentMinutes;
    });
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

  const loadCustomerBikes = async () => {
    try {
      setLoading(true);
      const apiBikes = await bikeService.getAllBikes();
      const cBikes: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
      const lBikes: Bike[] = JSON.parse(localStorage.getItem("local_owner_bikes") || "[]");
      let localOwnerBikes: Bike[] = [...cBikes, ...lBikes];
      if (localOwnerBikes.length === 0) {
        localOwnerBikes = [
          {
            bikeId: 101, id: 101, bikeName: "KTM Duke 390", brand: "KTM", model: "Duke 390",
            registrationNumber: "TS09AB1234", rcNumber: "TS09AB1234", hourlyRate: 80, rentalPrice: 640,
            location: "Hyderabad", bikeStatus: "AVAILABLE", rcVerified: true,
            availableStartTime: "08:00", availableEndTime: "20:00", availableDate: new Date().toISOString().split("T")[0],
            imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600",
          },
          {
            bikeId: 102, id: 102, bikeName: "TVS Radeon", brand: "TVS", model: "Radeon",
            registrationNumber: "TS09FK1234", rcNumber: "TS09FK1234", hourlyRate: 60, rentalPrice: 480,
            location: "Hyderabad", bikeStatus: "AVAILABLE", rcVerified: true,
            availableStartTime: "08:00", availableEndTime: "20:00", availableDate: new Date().toISOString().split("T")[0],
            imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600",
          },
          {
            bikeId: 103, id: 103, bikeName: "Yamaha R15 V4", brand: "Yamaha", model: "R15 V4",
            registrationNumber: "TS09AB9999", rcNumber: "TS09AB9999", hourlyRate: 150, rentalPrice: 1200,
            location: "Hyderabad", bikeStatus: "AVAILABLE", rcVerified: true,
            availableStartTime: "17:00", availableEndTime: "21:00", availableDate: new Date().toISOString().split("T")[0],
            imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600",
          },
        ];
        try {
          localStorage.setItem("custom_owner_bikes", JSON.stringify(localOwnerBikes));
        } catch (e) {}
      }

      const combinedMap = new Map<string, Bike>();

      const cleanStr = (s?: any) => (s ? String(s).replace(/\s+/g, "").toUpperCase() : "");
      const getBikeKey = (b: any): string => {
        const regClean = cleanStr(b.registrationNumber || b.rcNumber);
        if (regClean) return `REG_${regClean}`;
        const nameClean = cleanStr(b.bikeName || b.name);
        if (nameClean) return `NAME_${nameClean}`;
        return (b.bikeId || b.id || Math.random()).toString().toUpperCase();
      };

      // 1. Put server apiBikes FIRST
      (apiBikes || []).forEach((b) => {
        const key = getBikeKey(b);
        combinedMap.set(key, b);
      });

      // 2. Put local owner bikes SECOND (overwrites server defaults with latest owner edits)
      (localOwnerBikes || []).forEach((lb, idx) => {
        let key = getBikeKey(lb);
        const lbReg = cleanStr(lb.registrationNumber || lb.rcNumber);
        const lbName = cleanStr(lb.bikeName || lb.name);
        const lbId = lb.bikeId || lb.id;

        for (const [k, existing] of combinedMap.entries()) {
          const exReg = cleanStr(existing.registrationNumber || existing.rcNumber);
          const exName = cleanStr(existing.bikeName || existing.name);
          const exId = existing.bikeId || existing.id;

          const regMatch = lbReg && exReg && lbReg === exReg;
          const idMatch = lbId && exId && Number(lbId) === Number(exId);
          const nameMatch = lbName && exName && (lbName.includes(exName) || exName.includes(lbName));

          if (regMatch || idMatch || nameMatch) {
            key = k;
            break;
          }
        }

        const normalized = {
          ...lb,
          bikeId: lb.bikeId || lb.id || 9000 + idx,
          id: lb.id || lb.bikeId || 9000 + idx,
          bikeName: lb.bikeName || (lb as any).name || `${lb.brand || ''} ${lb.model || ''}`.trim() || "Rental Bike",
          name: (lb as any).name || lb.bikeName || `${lb.brand || ''} ${lb.model || ''}`.trim() || "Rental Bike",
        };
        if (!combinedMap.has(key)) {
          combinedMap.set(key, normalized);
        } else {
          const existing = combinedMap.get(key)!;
          const mergedTimings = {
            availableStartTime: existing.availableStartTime || (normalized as any).availableStartTime,
            availableEndTime: existing.availableEndTime || (normalized as any).availableEndTime,
            availableDate: existing.availableDate || (normalized as any).availableDate,
            bikeStatus: existing.bikeStatus || normalized.bikeStatus,
          };
          combinedMap.set(key, { ...normalized, ...existing, ...mergedTimings });
        }
      });

      const combinedRaw = Array.from(combinedMap.values());
      combinedRaw.sort((a, b) => {
        const aIsLocal = (localOwnerBikes || []).some(lb => (lb.registrationNumber || "").toUpperCase() === (a.registrationNumber || "").toUpperCase());
        const bIsLocal = (localOwnerBikes || []).some(lb => (lb.registrationNumber || "").toUpperCase() === (b.registrationNumber || "").toUpperCase());
        if (aIsLocal && !bIsLocal) return -1;
        if (!aIsLocal && bIsLocal) return 1;
        return (Number(b.bikeId || b.id || 0)) - (Number(a.bikeId || a.id || 0));
      });

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
      } catch (e) {}

      const mappedRealBikes = combinedRaw.map((b: Bike, index: number) => {
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

        const normalized = normalizeBike(b, index);
        return {
          ...normalized,
          bikeStatus: bStatus,
        };
      });

      // Real DB bikes only
      setAllBikes(mappedRealBikes);
    } catch (err) {
      console.error("Could not fetch bikes from server:", err);
      const localOwnerBikes: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
      setAllBikes(localOwnerBikes.map((b, idx) => normalizeBike(b, idx)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerBikes();
    const unsub = subscribeBikeUpdates(loadCustomerBikes);
    const timer = setInterval(loadCustomerBikes, 3000);
    return () => {
      unsub();
      clearInterval(timer);
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
    if (search) {
      const q = search.toLowerCase().trim();
      const matchName = (bike.name || "").toLowerCase().includes(q) || (bike.bikeName || "").toLowerCase().includes(q);
      const matchBrand = (bike.brand || "").toLowerCase().includes(q);
      const matchModel = (bike.model || "").toLowerCase().includes(q);
      const matchReg = (bike.registrationNumber || "").toLowerCase().includes(q);
      const matchLoc = (bike.location || "").toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchModel && !matchReg && !matchLoc) {
        return false;
      }
    }
    // Type filter
    if (filters.type && typeof filters.type === "string" && filters.type !== "All" && filters.type !== "ALL") {
      const fType = filters.type.toLowerCase();
      const bType = String(bike.type || bike.rentalType || "").toLowerCase();
      const bFuel = String(bike.fuelType || "").toLowerCase();
      if (!bType.includes(fType) && !bFuel.includes(fType) && fType !== "petrol") {
        return false;
      }
    }
    // Location checkboxes
    if (filters.location && Array.isArray(filters.location) && filters.location.length > 0) {
      const selectedLocs = filters.location.map((l: string) => String(l).toLowerCase());
      const bikeLoc = String(bike.location || "hyderabad").toLowerCase();
      if (!selectedLocs.some((sl) => bikeLoc.includes(sl) || sl.includes(bikeLoc))) {
        return false;
      }
    }
    // Price range filter
    if (filters.price !== undefined && filters.price !== null) {
      const actualPrice = Number(bike.hourlyRate || bike.rentalPrice || bike.price || 80);
      if (Array.isArray(filters.price) && filters.price.length === 2) {
        const [min, max] = filters.price;
        if (max > 0 && (actualPrice < min || actualPrice > max)) return false;
      } else if (typeof filters.price === "number" && filters.price > 50) {
        if (actualPrice > filters.price) return false;
      }
    }
    return true;
  });

  const sortedBikes = [...filteredBikes].map(b => {
    const nearbyMatch = (nearbyBikes ?? []).find(nb => Number(nb.bikeId) === Number(b.bikeId || b.id));
    return {
      ...b,
      distance: nearbyMatch ? nearbyMatch.distance : b.distance
    };
  }).sort((a, b) => {
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
      const pA = Number(a.hourlyRate || a.rentalPrice || a.price || 0);
      const pB = Number(b.hourlyRate || b.rentalPrice || b.price || 0);
      return pA - pB;
    }
    if (sortBy === "price-desc") {
      const pA = Number(a.hourlyRate || a.rentalPrice || a.price || 0);
      const pB = Number(b.hourlyRate || b.rentalPrice || b.price || 0);
      return pB - pA;
    }
    if (sortBy === "rating-desc") {
      const rA = a.rating || 0;
      const rB = b.rating || 0;
      return rB - rA;
    }
    if (sortBy === "name-asc") {
      return (a.name || a.bikeName || "").localeCompare(b.name || b.bikeName || "");
    }
    if (sortBy === "name-desc") {
      return (b.name || b.bikeName || "").localeCompare(a.name || a.bikeName || "");
    }
    return 0;
  });

  const itemsPerPage = 9;
  const totalPages = Math.ceil(sortedBikes.length / itemsPerPage);
  const paginatedBikes = sortedBikes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleBookClick = async (bike: any) => {
    if (!user) {
      toast.error("Please login to book a bike.");
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!isBikeAvailableNow(bike.availableStartTime, bike.availableEndTime, bike.availableDate)) {
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

      // 0. Check bike availability for selected time safely
      let isAvailable = true;
      try {
        isAvailable = await BookingService.checkAvailability(
          bike.id,
          freshPickup,
          freshReturn
        );
      } catch (err) {
        // Fallback for mock/local bikes or network API notice
        isAvailable = true;
      }

      if (bike.bikeStatus === "BOOKED") {
        toast.error("This slot is booked at that time. This bike has already been reserved.");
        setIsUnavailableModalOpen(true);
        return;
      }

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
      navigate("/customer/verification");
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

      // Ensure pickup and return times are not in the past
      let finalPickup = pickupDate;
      let finalReturn = returnDate;
      const nowTime = new Date();
      const pickupParsed = new Date(finalPickup);
      if (isNaN(pickupParsed.getTime()) || pickupParsed < nowTime) {
        finalPickup = getTodayDateTimeString();
        const retParsed = new Date(finalReturn);
        if (isNaN(retParsed.getTime()) || retParsed <= new Date(finalPickup)) {
          finalReturn = getReturnDateTimeString();
        }
      }

      // Check bike availability for selected time safely
      let isAvailable = true;
      try {
        isAvailable = await BookingService.checkAvailability(
          Number(bookingBike.id),
          finalPickup,
          finalReturn
        );
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        if (msg) {
          setUnavailableMessage(msg);
          setIsBookingOpen(false);
          setIsUnavailableModalOpen(true);
          setConfirmLoading(false);
          return;
        }
        isAvailable = true;
      }

      let isPendingBooking = false;
      try {
        const localBookings = [
          ...(JSON.parse(localStorage.getItem("customer_bookings") || "[]")),
          ...(JSON.parse(localStorage.getItem("user_bookings") || "[]")),
          ...(JSON.parse(localStorage.getItem("custom_user_bookings") || "[]")),
        ];
        isPendingBooking = (localBookings || []).some((b: any) => {
          const isBike = (b.bikeId || b.id) && Number(b.bikeId || b.id) === Number(bookingBike.id);
          const isPending = (b.bookingStatus || b.status || "").toUpperCase() === "PENDING";
          return isBike && isPending;
        });
      } catch (e) {}

      if (isPendingBooking) {
        setUnavailableMessage("Acceptance pending by owner for this time slot. A reservation request is awaiting approval by the owner.");
        setIsBookingOpen(false);
        setIsUnavailableModalOpen(true);
        setConfirmLoading(false);
        return;
      }

      if (bookingBike.bikeStatus === "BOOKED") {
        setUnavailableMessage("This slot is booked at that time. Bike is already accepted and reserved by the owner for another customer.");
        setIsBookingOpen(false);
        setIsUnavailableModalOpen(true);
        setConfirmLoading(false);
        return;
      }

      if (!isAvailable) {
        setIsBookingOpen(false);
        setIsUnavailableModalOpen(true);
        setConfirmLoading(false);
        return;
      }

      const bookingRequest = {
        bikeId: Number(bookingBike.id),
        startTime: finalPickup,
        returnTime: finalReturn,
      };

      await BookingService.createBooking(Number(user.id), bookingRequest);
      toast.success(`Booking request for ${bookingBike.name} submitted! Waiting for owner approval.`);
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
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by ride name, brand, model, or location..."
            width="w-full sm:max-w-md"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-border bg-background text-foreground text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer w-full sm:w-auto"
            >
              <option value="distance-asc">Nearest First (Distance ↑)</option>
              <option value="distance-desc">Farthest First (Distance ↓)</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
            </select>
          </div>
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
            const shiftState = getShiftState(bike.availableStartTime, bike.availableEndTime, bike.bikeStatus, bike.availableDate);
            const isShiftActive = shiftState === "AVAILABLE";

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
                    <BikeAvailability
                      status={bike.bikeStatus}
                      availableStartTime={bike.availableStartTime}
                      availableEndTime={bike.availableEndTime}
                      availableDate={bike.availableDate}
                      compact
                    />
                  </div>
                  <div 
                    className="absolute top-3 right-3 rounded-xl bg-card/90 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-foreground border border-border shadow-sm max-w-[125px] sm:max-w-[145px]"
                    title={bike.location}
                  >
                    <span className="truncate block">{bike.location}</span>
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedViewBike(bike)}
                        className="px-3 py-2 text-xs font-bold rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        View
                      </button>
                      {isShiftActive ? (
                        <button
                          type="button"
                          onClick={() => handleBookClick(bike)}
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 cursor-pointer shadow-xs hover:shadow active:scale-95 flex items-center gap-1"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Rent Now
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="Outside operating hours"
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-muted text-muted-foreground border border-border cursor-not-allowed flex items-center gap-1"
                        >
                          {shiftState === "BOOKED" ? "Booked for this Slot" : shiftState === "YET_TO_START" ? "Shift Yet to Start" : "Shift Closed"}
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
                      {getFilteredTimeSlots(pickupDate).map((slot) => (
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
                      {getFilteredTimeSlots(returnDate).map((slot) => (
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
          {unavailableMessage && unavailableMessage.toLowerCase().includes("pending")
            ? "Acceptance Pending by Owner"
            : "Slot Already Booked"}
        </ModalHeader>
        <ModalBody>
          <div className="p-5 text-center space-y-2">
            <h4 className="font-bold text-base text-foreground">
              {unavailableMessage && unavailableMessage.toLowerCase().includes("pending")
                ? "Acceptance Pending by Owner"
                : "This slot is booked at that time"}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {unavailableMessage || "This bike has already been accepted and booked by the owner for another customer during this time slot. Please choose another time slot or select a different bike."}
            </p>
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
      {/* VIEW BIKE DETAILS MODAL */}
      <BikeDetailsModal
        isOpen={Boolean(selectedViewBike)}
        onClose={() => setSelectedViewBike(null)}
        bike={selectedViewBike}
        onRentNow={(b) => handleBookClick(b)}
      />
    </div>
  );
}
