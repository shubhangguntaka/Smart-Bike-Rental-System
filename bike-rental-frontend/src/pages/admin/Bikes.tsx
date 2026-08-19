import React, { useState, useEffect } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { BadgeAlert, MapPin, Battery, Star } from "lucide-react";
import bikeService from "@/services/bikeService";

export default function AdminBikes() {
  const [bikes, setBikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadBikes = async () => {
    try {
      setLoading(true);
      const res = await bikeService.getAllBikes();
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      setBikes(data.map((b: any) => ({
        id: b.bikeId || b.id,
        name: b.bikeName || b.name || `${b.brand || ''} ${b.model || ''}`.trim() || "Bike",
        type: b.fuelType || b.type || "PETROL",
        price: b.hourlyRate || b.price || (b.rentalPrice ? Math.round(Number(b.rentalPrice) / 8) : 80),
        location: b.location || "Central Hub",
        owner: b.ownerName || b.owner?.ownerName || (b.ownerId ? `Owner #${b.ownerId}` : "Registered Owner"),
        battery: (b.fuelType || b.type || "").toLowerCase() === "electric" ? "95%" : "N/A",
        range: b.range || b.mileage || "45 km/l",
      })));
    } catch (err) {
      console.error("Failed to load admin bikes:", err);
      setBikes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBikes();
    const handleUpdate = () => loadBikes();
    window.addEventListener("custom_bikes_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const timer = setInterval(loadBikes, 5000);
    return () => {
      window.removeEventListener("custom_bikes_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(timer);
    };
  }, []);

  const filtered = bikes.filter((b) =>
    (b.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.owner || "").toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * 5, page * 5);

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Global Fleet Control</h2>
        <p className="text-xs text-muted-foreground mt-1">Monitor and supervise all rental bicycles and ownership parameters.</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search listed bikes, owners..."
          width="max-w-md w-full"
        />
      </div>

      {/* Table list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
                <th className="p-4">Bike Model</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Category</th>
                <th className="p-4">Location Hub</th>
                <th className="p-4">Telemetry Specs</th>
                <th className="p-4 text-right">Rent/hr</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((bike) => (
                  <tr key={bike.id} className="border-b border-border hover:bg-muted/10 last:border-0">
                    <td className="p-4 font-bold text-foreground">{bike.name}</td>
                    <td className="p-4 text-muted-foreground font-medium">{bike.owner}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {bike.type}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">{bike.location}</td>
                    <td className="p-4">
                      {bike.type === "electric" ? (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1"><Battery className="h-3.5 w-3.5 text-primary" /> {bike.battery}</span>
                          <span>Range: {bike.range}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-black text-foreground">₹{bike.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No bikes matched query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > 5 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filtered.length / 5)}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}
    </div>
  );
}
