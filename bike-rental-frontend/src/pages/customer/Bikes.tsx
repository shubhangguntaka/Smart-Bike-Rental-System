import React from "react";
import Bikes from "../Bikes";

export default function CustomerBikes() {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Browse Bike Fleet</h2>
        <p className="text-xs text-muted-foreground mt-1">Select and book high-quality electric or manual rental rides.</p>
      </div>
      <Bikes />
    </div>
  );
}
