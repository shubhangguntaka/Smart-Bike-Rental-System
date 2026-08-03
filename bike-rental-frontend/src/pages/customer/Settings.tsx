import React, { useState } from "react";
import toast from "react-hot-toast";

export default function CustomerSettings() {
  const [noti, setNoti] = useState(true);
  const [emailNoti, setEmailNoti] = useState(true);

  const handleSave = () => {
    toast.success("Settings updated successfully!");
  };

  return (
    <div className="space-y-6 max-w-3xl bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">Configure communication toggles and platform values.</p>
      </div>

      {/* Account Settings */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
        <h3 className="text-base font-bold border-b border-border pb-3">Notification Preferences</h3>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold">SMS Ride Alerts</p>
              <p className="text-xs text-muted-foreground">Receive OTPs and smart lock status updates via SMS.</p>
            </div>
            <input
              type="checkbox"
              checked={noti}
              onChange={() => setNoti(!noti)}
              className="rounded h-4 w-4 text-primary border-border bg-background focus:ring-ring"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold">Email Billing Invoices</p>
              <p className="text-xs text-muted-foreground">Receive transaction summary invoices on ride completion.</p>
            </div>
            <input
              type="checkbox"
              checked={emailNoti}
              onChange={() => setEmailNoti(!emailNoti)}
              className="rounded h-4 w-4 text-primary border-border bg-background focus:ring-ring"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
