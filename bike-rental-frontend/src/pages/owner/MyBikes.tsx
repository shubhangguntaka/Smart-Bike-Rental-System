import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Bike as BikeIcon, Plus, Search } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import BikeCard from "@/components/bike/BikeCard";
import bikeService from "@/services/bikeService";
import type { Bike } from "@/types/bike";
import { ROUTES } from "@/constants/routes";
import { isBikeAvailableNow } from "@/utils/timeUtils";

const MyBikes = () => {
  const { user } = useAuth();
  const ownerId = user?.id;

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadBikes = async () => {
    try {
      setLoading(true);
      const targetOwnerId = ownerId || 0;
      const data = await bikeService.getOwnerBikes(targetOwnerId);
      const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");

      const serverBikes = data || [];
      const mergedMap = new Map<string, Bike>();

      // Local newly added bikes first so they take priority
      localCached.forEach((b) => {
        const key = (b.registrationNumber || String(b.bikeId || b.id)).toUpperCase();
        if (key) mergedMap.set(key, b);
      });

      // Server bikes second
      serverBikes.forEach((b) => {
        const key = (b.registrationNumber || String(b.bikeId || b.id)).toUpperCase();
        if (key) mergedMap.set(key, b);
      });

      setBikes(Array.from(mergedMap.values()));
    } catch (err) {
      console.error("Failed to load bikes from server:", err);
      const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
      setBikes(localCached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBikes();
    // Auto-refresh fleet every 30 seconds for live updates
    const timer = setInterval(() => {
      loadBikes();
    }, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bikes;
    return bikes.filter(
      (b) =>
        b.bikeName?.toLowerCase().includes(q) ||
        b.brand?.toLowerCase().includes(q) ||
        b.registrationNumber?.toLowerCase().includes(q) ||
        b.location?.toLowerCase().includes(q)
    );
  }, [bikes, search]);

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
        const isActive = isBikeAvailableNow(b.availableStartTime, b.availableEndTime);
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
          : "Bike marked Available!"
      );
      setBikes((prev) =>
        prev.map((b) => ((b.bikeId || b.id) === bikeId ? { ...b, bikeStatus: newStatus as any } : b))
      );
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update bike status");
    }
  };

  const handleDelete = async (bikeId: number) => {
    const ok = window.confirm("Delete this bike from your fleet?");
    if (!ok) return;

    try {
      await bikeService.deleteBike(bikeId);
      toast.success("Bike Deleted Successfully!");
      await loadBikes();
    } catch {
      toast.error("Unable to delete bike");
    }
  };

  if (!ownerId) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Sign in as a bike owner to manage your fleet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Real-Time Fleet Management
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">
            My Bikes
          </h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Monitor live shifts, toggle maintenance, and manage your rental fleet in real time.
          </p>
        </div>
        <Link
          to={ROUTES.OWNER.ADD_BIKE}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add bike
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: "Total Fleet", value: stats.total, color: "text-foreground" },
          { label: "Active Now 🟢", value: stats.activeNow, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Shift Closed 🟠", value: stats.shiftClosed, color: "text-amber-600 dark:text-amber-400" },
          { label: "Booked 🔴", value: stats.booked, color: "text-rose-600 dark:text-rose-400" },
          { label: "Maintenance 🟡", value: stats.maintenance, color: "text-slate-600 dark:text-slate-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-card px-4 py-4 shadow-xs"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {item.label}
            </p>
            <p className={`mt-1 font-serif text-2xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="relative max-w-lg">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, brand, registration..."
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BikeIcon className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {bikes.length === 0 ? "No bikes yet" : "No matches"}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {bikes.length === 0
              ? "Add your first bike to start earning from your fleet."
              : "Try a different search term."}
          </p>
          {bikes.length === 0 && (
            <Link
              to={ROUTES.OWNER.ADD_BIKE}
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"
            >
              Add your first bike
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((bike) => (
            <BikeCard
              key={bike.bikeId || bike.id}
              bike={bike}
              showOwnerActions
              onDelete={handleDelete}
              onStatusToggle={handleStatusToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBikes;
