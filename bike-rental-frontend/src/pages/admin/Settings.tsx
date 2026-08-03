import React, { useState } from "react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [commission, setCommission] = useState(10);
  const [supportEmail, setSupportEmail] = useState("admin@smartbike.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Global system settings saved successfully!");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">System Administration Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">Configure global platform configurations, commissions, and network parameters.</p>
      </div>

      {/* Global Config */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold border-b border-border pb-3">Financial Variables</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Admin Commission Fee (%)</label>
          <input
            type="number"
            value={commission}
            onChange={(e) => setCommission(Number(e.target.value))}
            min="0"
            max="100"
            className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>
      </div>

      {/* Network config */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold border-b border-border pb-3">Platform Operations</h3>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Global Support Contact Email</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>

        <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-border mt-3">
          <div>
            <p className="text-sm font-semibold">Maintenance Mode</p>
            <p className="text-xs text-muted-foreground">Puts the public portal into offline maintenance mode.</p>
          </div>
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={() => setMaintenanceMode(!maintenanceMode)}
            className="rounded h-4 w-4 text-primary border-border bg-background focus:ring-ring"
          />
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
