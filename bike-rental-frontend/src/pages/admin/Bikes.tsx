import React, { useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { BadgeAlert, MapPin, Battery, Star } from "lucide-react";

const MOCK_ADMIN_BIKES = [
  { id: 1, name: "VoltPulse Electric S1", type: "electric", price: 200, rating: 4.8, range: "60 km", battery: "95%", location: "Indiranagar Hub", owner: "Amit Kumar" },
  { id: 2, name: "AeroRoad Elite Carbon", type: "road", price: 150, rating: 4.6, range: "N/A", battery: "N/A", location: "Koramangala Hub", owner: "Amit Kumar" },
  { id: 3, name: "SummitCrusher Trail XT", type: "mountain", price: 180, rating: 4.7, range: "N/A", battery: "N/A", location: "Whitefield Hub", owner: "Vikram Singh" },
  { id: 4, name: "CityGlide Hybrid V2", type: "hybrid", price: 120, rating: 4.4, range: "45 km", battery: "80%", location: "Jayanagar Hub", owner: "Vikram Singh" },
];

export default function AdminBikes() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_ADMIN_BIKES.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.owner.toLowerCase().includes(search.toLowerCase())
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
