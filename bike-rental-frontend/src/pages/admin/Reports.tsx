import React from "react";

export default function AdminReports() {
  return (
    <div className="space-y-6 max-w-8xl text-foreground min-h-screen pb-10">
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Reports</h2>
        <p className="text-xs text-muted-foreground mt-1">System usage, financial metrics, and user growth analysis.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
        <p className="text-sm font-medium">Reports module is under development and will be available soon.</p>
      </div>
    </div>
  );
}
