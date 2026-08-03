import React, { useState } from "react";
import toast from "react-hot-toast";

export default function OwnerSettings() {
  const [payoutEmail, setPayoutEmail] = useState("owner@example.com");
  const [bikeAlerts, setBikeAlerts] = useState(true);
  const [payoutAlerts, setPayoutAlerts] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully!");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Owner Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">Configure payout preferences, notifications, and account settings.</p>
      </div>

      {/* Payout Settings */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold border-b border-border pb-3">Payout Configuration</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Payout Notification Email</label>
          <input
            type="email"
            value={payoutEmail}
            onChange={(e) => setPayoutEmail(e.target.value)}
            className="w-full text-xs px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold border-b border-border pb-3">Notification Preferences</h3>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-semibold">Bike Status Alerts</p>
            <p className="text-xs text-muted-foreground">Receive SMS when your bike is rented, returned, or locked.</p>
          </div>
          <input
            type="checkbox"
            checked={bikeAlerts}
            onChange={() => setBikeAlerts(!bikeAlerts)}
            className="rounded h-4 w-4 text-primary border-border bg-background focus:ring-ring"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-semibold">Payout Alerts</p>
            <p className="text-xs text-muted-foreground">Get notified when revenue is transferred to your bank account.</p>
          </div>
          <input
            type="checkbox"
            checked={payoutAlerts}
            onChange={() => setPayoutAlerts(!payoutAlerts)}
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
