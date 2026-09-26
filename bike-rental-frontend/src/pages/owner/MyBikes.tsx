import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bike as BikeIcon,
  Plus,
  Search,
  Clock,
  Sparkles,
  Pencil,
  X,
  MapPin,
  ShieldCheck,
  Activity,
  CalendarCheck,
  Filter,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import useAuth from "@/hooks/useAuth";
import BikeCard from "@/components/bike/BikeCard";
import bikeService from "@/services/bikeService";
import type { Bike } from "@/types/bike";
import { ROUTES } from "@/constants/routes";
import { isBikeAvailableNow, format12Hour, parse12HourTo24 } from "@/utils/timeUtils";
import { notifyBikeUpdated } from "@/utils/syncUtils";

interface TimePicker12hProps {
  label: string;
  value: string;
  onChange: (val24: string) => void;
}

const TimePicker12h = ({ label, value, onChange }: TimePicker12hProps) => {
  const parts = (value || "09:00").split(":");
  const h24 = parseInt(parts[0] || "9", 10);
  const minute = parts[1] ? parts[1].slice(0, 2) : "00";

  const period = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  const handleHourChange = (newH12: number) => {
    let newH24 = newH12 % 12;
    if (period === "PM") newH24 += 12;
    const val24 = `${String(newH24).padStart(2, "0")}:${minute}`;
    onChange(val24);
  };

  const handleMinuteChange = (newM: string) => {
    const val24 = `${String(h24).padStart(2, "0")}:${newM}`;
    onChange(val24);
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    let newH24 = h12 % 12;
    if (newPeriod === "PM") newH24 += 12;
    const val24 = `${String(newH24).padStart(2, "0")}:${minute}`;
    onChange(val24);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <Clock className="h-3 w-3 text-primary" /> {label}
      </label>
      <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-card p-1.5 shadow-xs">
        <select
          value={h12}
          onChange={(e) => handleHourChange(Number(e.target.value))}
          className="rounded-xl border border-border/80 bg-background px-2.5 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer hover:border-primary/50"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="font-bold text-muted-foreground text-xs">:</span>
        <select
          value={minute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className="rounded-xl border border-border/80 bg-background px-2.5 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer hover:border-primary/50"
        >
          {["00", "15", "30", "45"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <div className="ml-auto flex rounded-xl bg-muted/80 p-0.5 border border-border/60">
          <button
            type="button"
            onClick={() => handlePeriodChange("AM")}
            className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer ${
              period === "AM"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handlePeriodChange("PM")}
            className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer ${
              period === "PM"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            PM
          </button>
        </div>
      </div>
      <p className="text-[10px] font-extrabold text-primary pl-1">
        Selected: {format12Hour(value)}
      </p>
    </div>
  );
};

const MyBikes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ownerId = user?.id;

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "CLOSED" | "BOOKED">("ALL");

  // Quick Timing Modal State
  const [timingModalBike, setTimingModalBike] = useState<Bike | null>(null);
  const [modalStartTime, setModalStartTime] = useState("09:00");
  const [modalEndTime, setModalEndTime] = useState("21:00");
  const [modalHourlyRate, setModalHourlyRate] = useState(80);
  const [modalLocation, setModalLocation] = useState("Hyderabad");
  const [savingTiming, setSavingTiming] = useState(false);

  // Bike Delete Modal State
  const [deleteModalBike, setDeleteModalBike] = useState<Bike | null>(null);
  const [deletingBike, setDeletingBike] = useState(false);

  const loadBikes = async () => {
    const targetOwnerId = ownerId || (user as any)?.id || 17;
    if (!targetOwnerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const serverData = await bikeService.getOwnerBikes(targetOwnerId).catch(() => []);
      const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");

      const combinedMap = new Map<string, Bike>();

      // 1. Server bikes FIRST
      (serverData || []).forEach((b: any, idx: number) => {
        const key = (b.registrationNumber || b.bikeId || b.id || `SERVER_${idx}`).toString().toUpperCase();
        combinedMap.set(key, b);
      });

      // 2. Local custom owner bikes SECOND (overwrites server defaults with owner edits)
      (localCached || []).forEach((lb, idx) => {
        const key = (lb.registrationNumber || lb.bikeId || lb.id || lb.bikeName || (lb as any).name || `LOCAL_${idx}`).toString().toUpperCase();
        if (!combinedMap.has(key)) {
          combinedMap.set(key, lb);
        } else {
          const existing = combinedMap.get(key)!;
          combinedMap.set(key, { ...existing, ...lb });
        }
      });

      setBikes(Array.from(combinedMap.values()));
    } catch (err) {
      console.error("Failed to load bikes from server:", err);
      const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
      const ownerBikesOnly = localCached.filter(
        (b) => !b.ownerId || Number(b.ownerId) === Number(targetOwnerId)
      );
      setBikes(ownerBikesOnly);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBikes();
    const handleUpdate = () => loadBikes();
    window.addEventListener("custom_bikes_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const timer = setInterval(() => {
      loadBikes();
    }, 30000);
    return () => {
      window.removeEventListener("custom_bikes_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(timer);
    };
  }, [ownerId]);

  const filtered = useMemo(() => {
    let list = bikes;
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (b) =>
          b.bikeName?.toLowerCase().includes(q) ||
          b.brand?.toLowerCase().includes(q) ||
          b.registrationNumber?.toLowerCase().includes(q) ||
          b.location?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === "ACTIVE") {
      list = list.filter((b) => {
        const st = (b.bikeStatus || "AVAILABLE").toUpperCase();
        return st === "AVAILABLE" && isBikeAvailableNow(b.availableStartTime, b.availableEndTime, b.availableDate);
      });
    } else if (statusFilter === "CLOSED") {
      list = list.filter((b) => {
        const st = (b.bikeStatus || "AVAILABLE").toUpperCase();
        return st === "AVAILABLE" && !isBikeAvailableNow(b.availableStartTime, b.availableEndTime, b.availableDate);
      });
    } else if (statusFilter === "BOOKED") {
      list = list.filter((b) => (b.bikeStatus || "").toUpperCase() === "BOOKED");
    }

    return list;
  }, [bikes, search, statusFilter]);

  const stats = useMemo(() => {
    let activeNow = 0;
    let shiftClosed = 0;
    let booked = 0;
    let maintenance = 0;

    bikes.forEach((b) => {
      const st = (b.bikeStatus || "AVAILABLE").toUpperCase();
      if (st === "BOOKED") {
        booked++;
      } else if (st === "UNDER_MAINTENANCE" || st === "MAINTENANCE") {
        maintenance++;
      } else if (st === "AVAILABLE") {
        const isActive = isBikeAvailableNow(b.availableStartTime, b.availableEndTime, b.availableDate);
        if (isActive) {
          activeNow++;
        } else {
          shiftClosed++;
        }
      }
    });

    const verified = bikes.filter((b) => b.rcVerified || b.rcVerificationStatus).length;
    return { total: bikes.length, activeNow, shiftClosed, booked, maintenance, verified };
  }, [bikes]);

  const handleStatusToggle = async (bikeId: number, newStatus: string) => {
    const targetBike = bikes.find((b) => (b.bikeId || b.id) === bikeId);
    if (!targetBike) return;

    try {
      const updatedBike: Bike = {
        ...targetBike,
        bikeStatus: newStatus as any,
      };

      await bikeService.updateBike(bikeId, updatedBike);
      toast.success(
        newStatus === "UNDER_MAINTENANCE"
          ? "Bike set to Maintenance"
          : "Bike status updated successfully!"
      );
      setBikes((prev) =>
        prev.map((b) => ((b.bikeId || b.id) === bikeId ? { ...b, bikeStatus: newStatus as any } : b))
      );
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update bike status");
    }
  };

  const handleOpenTimingModal = (bike: Bike) => {
    setTimingModalBike(bike);
    setModalStartTime(bike.availableStartTime || "09:00");
    setModalEndTime(bike.availableEndTime || "21:00");
    setModalHourlyRate(bike.hourlyRate || 80);
    setModalLocation(bike.location || "Hyderabad");
  };

  const handleSaveTimingAndPost = async () => {
    if (!timingModalBike) return;
    try {
      setSavingTiming(true);
      const rawId = timingModalBike.bikeId || timingModalBike.id;
      const numId = rawId ? Number(rawId) : NaN;
      const validNumericId = !isNaN(numId) && numId > 0 ? numId : null;

      const updatedBike: Bike = {
        ...timingModalBike,
        availableStartTime: parse12HourTo24(modalStartTime),
        availableEndTime: parse12HourTo24(modalEndTime),
        availableDate: new Date().toISOString().split("T")[0],
        hourlyRate: modalHourlyRate,
        rentalPrice: modalHourlyRate * 8,
        location: modalLocation,
        bikeStatus: "AVAILABLE",
        isShiftPosted: true,
        rcVerified: true,
      };

      if (validNumericId) {
        try {
          await bikeService.updateBike(validNumericId, updatedBike);
        } catch (e) {
          console.error("API update warning:", e);
        }
      }

      const deletedKeys: string[] = JSON.parse(localStorage.getItem("deleted_bike_keys") || "[]");
      const regUpper = (updatedBike.registrationNumber || "").trim().toUpperCase();
      const nameUpper = (updatedBike.bikeName || "").trim().toUpperCase();
      const updatedDeletedKeys = deletedKeys.filter(
        (k) => k.toUpperCase() !== regUpper && k.toUpperCase() !== nameUpper
      );
      localStorage.setItem("deleted_bike_keys", JSON.stringify(updatedDeletedKeys));

      const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");

      const filteredList = localCached.filter((b) => {
        const bReg = (b.registrationNumber || "").trim().toUpperCase();
        const bName = (b.bikeName || "").trim().toUpperCase();
        const bId = b.bikeId || b.id;

        if (regUpper && bReg === regUpper) return false;
        if (nameUpper && bName === nameUpper) return false;
        if (rawId && (bId === rawId || String(bId) === String(rawId))) return false;
        return true;
      });

      filteredList.unshift(updatedBike);
      localStorage.setItem("custom_owner_bikes", JSON.stringify(filteredList));
      localStorage.setItem("local_owner_bikes", JSON.stringify(filteredList));

      notifyBikeUpdated(updatedBike);

      toast.success(`${updatedBike.bikeName || "Bike"} shift timing updated & live on Customer page!`);
      setTimingModalBike(null);
      await loadBikes();
    } catch (err) {
      console.error("Shift timing update error:", err);
      toast.error("Failed to update shift timing.");
    } finally {
      setSavingTiming(false);
    }
  };

  const handleDelete = (bikeId: number | string, bikeObj?: Bike) => {
    const target = bikeObj || bikes.find((b) => (b.bikeId || b.id || b.registrationNumber) === bikeId) || null;
    if (target) {
      setDeleteModalBike(target);
    } else {
      const fallbackBike = bikes.find((b) => String(b.bikeId || b.id) === String(bikeId));
      if (fallbackBike) {
        setDeleteModalBike(fallbackBike);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalBike) return;

    try {
      setDeletingBike(true);
      const rawId = deleteModalBike.bikeId || deleteModalBike.id;
      const numId = rawId ? Number(rawId) : NaN;

      if (!isNaN(numId) && numId > 0) {
        try {
          await bikeService.deleteBike(numId);
        } catch (e: any) {
          console.warn("Backend API delete notice:", e);
          const errMsg = e?.response?.data?.message || e?.message;
          if (errMsg && (errMsg.includes("booking") || errMsg.includes("active"))) {
            toast.error(errMsg);
            setDeletingBike(false);
            return;
          }
        }
      }

      const deletedKeys: string[] = JSON.parse(localStorage.getItem("deleted_bike_keys") || "[]");
      if (deleteModalBike.registrationNumber) {
        deletedKeys.push(deleteModalBike.registrationNumber.trim().toUpperCase());
      }
      if (rawId) {
        deletedKeys.push(String(rawId));
      }
      localStorage.setItem("deleted_bike_keys", JSON.stringify(Array.from(new Set(deletedKeys))));

      const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
      const targetReg = (deleteModalBike.registrationNumber || "").trim().toUpperCase();
      const targetName = (deleteModalBike.bikeName || "").trim().toUpperCase();

      const filteredList = localCached.filter((b) => {
        const bId = b.bikeId || b.id;
        const bReg = (b.registrationNumber || "").trim().toUpperCase();
        const bName = (b.bikeName || "").trim().toUpperCase();

        if (rawId && bId && (bId === rawId || String(bId) === String(rawId))) return false;
        if (targetReg && bReg === targetReg) return false;
        if (targetName && bName === targetName) return false;
        return true;
      });

      localStorage.setItem("custom_owner_bikes", JSON.stringify(filteredList));
      localStorage.setItem("local_owner_bikes", JSON.stringify(filteredList));
      window.dispatchEvent(new Event("custom_bikes_updated"));

      notifyBikeUpdated({
        ...deleteModalBike,
        bikeStatus: "NOT_AVAILABLE" as any,
      });

      toast.success(`${deleteModalBike.bikeName || "Bike"} removed from fleet successfully!`);
      setDeleteModalBike(null);
      await loadBikes();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Unable to delete bike. Please try again.");
    } finally {
      setDeletingBike(false);
    }
  };

  if (!ownerId) {
    return (
      <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-lg">
        <p className="text-sm text-muted-foreground font-medium">
          Sign in as a bike owner to manage your fleet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm transition-all duration-300">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Fleet Control
              </span>
              <span className="text-xs font-bold text-muted-foreground font-mono">
                {stats.total} Vehicles Registered
              </span>
            </div>
            <h1 className="mt-2 font-sans text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              My Fleet Management
            </h1>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Set shift timings, update hourly rental rates, and publish live listings directly to the customer catalog.
            </p>
          </div>

          <Link
            to={ROUTES.OWNER.ADD_BIKE}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-extrabold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.98] shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add New Bike
          </Link>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {[
          {
            label: "Total Fleet",
            value: stats.total,
            icon: BikeIcon,
            color: "text-foreground",
            bg: "bg-muted/40",
            border: "border-border/80",
          },
          {
            label: "Active Now",
            value: stats.activeNow,
            icon: Activity,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
          },
          {
            label: "Shift Closed",
            value: stats.shiftClosed,
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
          },
          {
            label: "Booked",
            value: stats.booked,
            icon: CalendarCheck,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
          },
          {
            label: "Verified RC",
            value: stats.verified,
            icon: ShieldCheck,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
          },
        ].map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.label}
              className={`flex flex-col justify-between rounded-2xl border ${item.border} bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </span>
                <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                  <IconComp className="h-4 w-4" />
                </div>
              </div>
              <p className={`mt-3 font-sans text-2xl font-black ${item.color}`}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/80 bg-card p-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bike name, brand, registration number..."
            className="w-full rounded-xl border border-border/80 bg-background py-2.5 pl-10 pr-4 text-xs font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1 pr-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {[
            { key: "ALL", label: "All Fleet" },
            { key: "ACTIVE", label: "Active Now 🟢" },
            { key: "CLOSED", label: "Shift Closed 🟠" },
            { key: "BOOKED", label: "Booked 🔴" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === f.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bike Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-3xl border border-border/80 bg-card/60"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border/80 bg-card/50 px-6 py-16 text-center shadow-xs">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <BikeIcon className="h-8 w-8" />
          </div>
          <h2 className="font-sans text-xl font-bold text-foreground">
            {bikes.length === 0 ? "No Bikes in Fleet Yet" : "No Matching Vehicles Found"}
          </h2>
          <p className="mt-2 max-w-sm text-xs text-muted-foreground font-medium">
            {bikes.length === 0
              ? "Add your first vehicle to start accepting customer rental bookings."
              : "Try adjusting your search query or filter options."}
          </p>
          {bikes.length === 0 && (
            <Link
              to={ROUTES.OWNER.ADD_BIKE}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-extrabold text-primary-foreground shadow-md transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add Your First Bike
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((bike) => (
            <BikeCard
              key={bike.bikeId || bike.id}
              bike={bike}
              showOwnerActions
              onDelete={handleDelete}
              onStatusToggle={handleStatusToggle}
              onSetTiming={handleOpenTimingModal}
            />
          ))}
        </div>
      )}

      {/* QUICK SHIFT TIMING MODAL */}
      {timingModalBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setTimingModalBike(null)}
              className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary border border-primary/20">
                  <Clock className="h-3 w-3" /> Quick Shift Update
                </span>
                <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">
                  {timingModalBike.registrationNumber}
                </span>
              </div>
              <h3 className="mt-2 font-sans text-lg sm:text-xl font-extrabold text-foreground truncate">
                Set Shift Timing for {timingModalBike.bikeName}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground font-medium">
                Set operating hours and rate to post this ride live to the Customer Catalog immediately.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/80 bg-muted/20 p-3.5 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TimePicker12h
                  label="Shift Start Time"
                  value={modalStartTime}
                  onChange={setModalStartTime}
                />
                <TimePicker12h
                  label="Shift End Time"
                  value={modalEndTime}
                  onChange={setModalEndTime}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Rental Rate (₹/hr)
                  </label>
                  <input
                    type="number"
                    value={modalHourlyRate}
                    onChange={(e) => setModalHourlyRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> Pickup Location
                  </label>
                  <input
                    type="text"
                    value={modalLocation}
                    onChange={(e) => setModalLocation(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                disabled={savingTiming}
                onClick={handleSaveTimingAndPost}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-primary px-5 py-3 text-xs font-extrabold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                {savingTiming ? "Posting Live..." : "Post Bike Live Now →"}
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetId = timingModalBike.bikeId || timingModalBike.id;
                  setTimingModalBike(null);
                  navigate(ROUTES.OWNER.EDIT_BIKE(targetId!));
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BIKE DELETE CONFIRMATION MODAL */}
      {deleteModalBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              disabled={deletingBike}
              onClick={() => setDeleteModalBike(null)}
              className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition cursor-pointer disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header with warning icon */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-inner">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1 pr-6">
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Remove Bike from Fleet?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This action will permanently delete the vehicle from your active fleet and unlist it from customer discovery.
                </p>
              </div>
            </div>

            {/* Bike Preview Card */}
            <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-muted/30 p-3.5">
              {deleteModalBike.imageUrl || (deleteModalBike.imageUrls && deleteModalBike.imageUrls[0]) ? (
                <img
                  src={deleteModalBike.imageUrl || deleteModalBike.imageUrls?.[0]}
                  alt={deleteModalBike.bikeName}
                  className="h-14 w-14 rounded-xl object-cover border border-border/60 shrink-0"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <BikeIcon className="h-7 w-7" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <h4 className="text-sm font-extrabold text-foreground truncate">
                  {deleteModalBike.bikeName}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  {deleteModalBike.brand && (
                    <span className="font-semibold">{deleteModalBike.brand}</span>
                  )}
                  {deleteModalBike.brand && deleteModalBike.registrationNumber && (
                    <span>•</span>
                  )}
                  {deleteModalBike.registrationNumber && (
                    <span className="font-mono font-bold bg-muted px-1.5 py-0.5 rounded border border-border/60 text-foreground">
                      {deleteModalBike.registrationNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-foreground">
                  ₹{deleteModalBike.hourlyRate || 80}
                  <span className="text-[10px] text-muted-foreground font-normal"> / hr</span>
                </p>
              </div>
            </div>

            {/* Warning note */}
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-[11px] text-destructive leading-relaxed font-medium">
              ⚠️ Note: Once deleted, any upcoming unconfirmed reservations will be cancelled. Past completed booking records will remain saved in your earnings history.
            </div>

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                disabled={deletingBike}
                onClick={() => setDeleteModalBike(null)}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-card py-2.5 px-4 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingBike}
                onClick={handleConfirmDelete}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 px-4 text-xs font-extrabold text-destructive-foreground shadow-lg shadow-destructive/25 transition hover:bg-destructive/90 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deletingBike ? "Deleting Bike..." : "Yes, Delete Bike"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBikes;
