import React, { useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { Plus, Bike, Navigation, Battery, CheckCircle, Eye } from "lucide-react";
import toast from "react-hot-toast";

const MOCK_OWNER_BIKES = [
  { id: 1, name: "VoltPulse Electric S1", type: "electric", price: 200, rating: 4.8, range: "60 km", battery: "95%", status: "Active" },
  { id: 5, name: "HyperVolt Cruiser Pro", type: "electric", price: 250, rating: 4.9, range: "80 km", battery: "100%", status: "Rented" },
  { id: 6, name: "AeroRoad Elite Carbon", type: "road", price: 150, rating: 4.6, range: "N/A", battery: "N/A", status: "Active" },
];

export default function OwnerBikes() {
  const [bikes, setBikes] = useState(MOCK_OWNER_BIKES);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBike, setNewBike] = useState({ name: "", type: "electric", price: 100, range: "50 km", battery: "100%" });
  const [loading, setLoading] = useState(false);

  const filtered = bikes.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBike.name.trim()) {
      toast.error("Please provide a bike model name.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBikes([
        ...bikes,
        {
          id: bikes.length + 1,
          name: newBike.name,
          type: newBike.type,
          price: Number(newBike.price),
          rating: 5.0,
          range: newBike.type === "electric" ? newBike.range : "N/A",
          battery: newBike.type === "electric" ? newBike.battery : "N/A",
          status: "Active",
        },
      ]);
      setIsAddOpen(false);
      setNewBike({ name: "", type: "electric", price: 100, range: "50 km", battery: "100%" });
      toast.success("New bike successfully added to your fleet catalog!");
    }, 1000);
  };

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen">
      {/* Title block */}
      <div className="bg-card border border-border p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">My Bikes Fleet</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage and monetize your fleet listed on Smart Bike Rental.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Bike</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search listed bikes..."
          width="max-w-md w-full"
        />
      </div>

      {/* Fleet List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((bike) => (
            <div
              key={bike.id}
              className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {bike.type}
                  </span>
                  <h3 className="font-bold text-base text-foreground truncate max-w-[180px]">{bike.name}</h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    bike.status === "Active"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-orange-500/10 text-orange-500"
                  }`}
                >
                  {bike.status}
                </span>
              </div>

              {bike.type === "electric" && (
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
              )}

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-base font-black text-foreground">₹{bike.price}</span>
                  <span className="text-xs text-muted-foreground">/ hr</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Rating: ⭐{bike.rating}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 border border-dashed border-border rounded-2xl bg-card text-muted-foreground text-sm">
            No bikes listed in your fleet match your search.
          </div>
        )}
      </div>

      {/* Add Bike Modal */}
      <Modal isOpen={isAddOpen} onClose={() => !loading && setIsAddOpen(false)} size="md">
        <ModalHeader onClose={() => !loading && setIsAddOpen(false)}>List Vehicle for Rental</ModalHeader>
        <form onSubmit={handleAddSubmit}>
          <ModalBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Bike Model Name *</label>
              <input
                type="text"
                placeholder="e.g. AeroRoad Pro E-6"
                value={newBike.name}
                onChange={(e) => setNewBike({ ...newBike, name: e.target.value })}
                className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Fleet Category</label>
                <select
                  value={newBike.type}
                  onChange={(e) => setNewBike({ ...newBike, type: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
                >
                  <option value="electric">Electric</option>
                  <option value="road">Road</option>
                  <option value="mountain">Mountain</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Price / Hour (₹) *</label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={newBike.price}
                  onChange={(e) => setNewBike({ ...newBike, price: Number(e.target.value) })}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
                  required
                />
              </div>
            </div>

            {newBike.type === "electric" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Battery Range (km)</label>
                  <input
                    type="text"
                    value={newBike.range}
                    onChange={(e) => setNewBike({ ...newBike, range: e.target.value })}
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Charge Capacity (%)</label>
                  <input
                    type="text"
                    value={newBike.battery}
                    onChange={(e) => setNewBike({ ...newBike, battery: e.target.value })}
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none"
                  />
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsAddOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />}
              <span>{loading ? "Registering..." : "Add to Catalog"}</span>
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
