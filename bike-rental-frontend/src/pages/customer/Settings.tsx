import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import {
  Settings as SettingsIcon,
  Bell,
  CreditCard,
  Bike,
  ShieldCheck,
  Lock,
  Smartphone,
  Mail,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Download,
  Volume2,
  VolumeX,
  FileJson,
  Sliders,
  X,
  MapPin,
  Flame,
  Zap,
  Globe,
  Sun,
  Moon,
  Tv,
  Layout,
  Layers,
  FileText,
  ShieldAlert,
  Headphones,
  Compass,
} from "lucide-react";
import toast from "react-hot-toast";

type SettingsTab = "RENTAL" | "PAYMENTS" | "NOTIFICATIONS" | "APPEARANCE" | "SECURITY";

export interface CustomerSettingsConfig {
  // Rental & Ride Defaults
  preferredHelmetOption: "single" | "dual" | "none";
  preferredBikeCategory: "all" | "sports" | "scooter" | "ev" | "cruiser";
  preferredCity: string;
  autoInstantBooking: boolean;
  maxSpeedWarningAlert: number; // km/h
  lowBatteryThreshold: number; // %

  // Payments & Billing
  defaultPaymentMethod: "upi" | "card" | "wallet" | "netbanking";
  savedUpiId: string;
  autoDebitOvertime: boolean;
  emailInvoicesOnCompletion: boolean;
  requireGstInvoice: boolean;
  gstin: string;

  // Notifications & Alerts
  smsRideAlerts: boolean;
  emailDailyDigest: boolean;
  whatsappAlerts: boolean;
  promoAlerts: boolean;
  soundAlertsEnabled: boolean;
  emergencyContactSms: boolean;

  // Display & UI Appearance
  themePreference: "light" | "dark" | "system";
  compactTables: boolean;
  pageSize: number;
  timezone: string;
  currency: string;
  timeFormat: "12h" | "24h";

  // Security & Privacy
  liveGpsSharingEnabled: boolean;
  shareTripWithEmergencyContact: boolean;
  twoFactorEnabled: boolean;
  sessionTimeoutMinutes: number;
}

const DEFAULT_CUSTOMER_SETTINGS: CustomerSettingsConfig = {
  preferredHelmetOption: "single",
  preferredBikeCategory: "all",
  preferredCity: "Hyderabad",
  autoInstantBooking: true,
  maxSpeedWarningAlert: 80,
  lowBatteryThreshold: 20,

  defaultPaymentMethod: "upi",
  savedUpiId: "",
  autoDebitOvertime: true,
  emailInvoicesOnCompletion: true,
  requireGstInvoice: false,
  gstin: "",

  smsRideAlerts: true,
  emailDailyDigest: true,
  whatsappAlerts: true,
  promoAlerts: false,
  soundAlertsEnabled: true,
  emergencyContactSms: true,

  themePreference: "system",
  compactTables: false,
  pageSize: 8,
  timezone: "Asia/Kolkata",
  currency: "INR",
  timeFormat: "12h",

  liveGpsSharingEnabled: true,
  shareTripWithEmergencyContact: true,
  twoFactorEnabled: true,
  sessionTimeoutMinutes: 60,
};

const STORAGE_KEY = "smartbike_customer_settings_config";

export default function CustomerSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const initialTab = useMemo<SettingsTab>(() => {
    const tabParam = searchParams.get("tab")?.toUpperCase();
    if (
      tabParam === "RENTAL" ||
      tabParam === "PAYMENTS" ||
      tabParam === "NOTIFICATIONS" ||
      tabParam === "APPEARANCE" ||
      tabParam === "SECURITY"
    ) {
      return tabParam as SettingsTab;
    }
    const stateTab = (location.state as any)?.tab?.toUpperCase();
    if (
      stateTab === "RENTAL" ||
      stateTab === "PAYMENTS" ||
      stateTab === "NOTIFICATIONS" ||
      stateTab === "APPEARANCE" ||
      stateTab === "SECURITY"
    ) {
      return stateTab as SettingsTab;
    }
    return "RENTAL";
  }, [searchParams, location.state]);

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [saving, setSaving] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Settings State
  const [config, setConfig] = useState<CustomerSettingsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CUSTOMER_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore error
    }
    return DEFAULT_CUSTOMER_SETTINGS;
  });

  // Keep theme synced with configuration change
  useEffect(() => {
    if (config.themePreference && config.themePreference !== theme) {
      setTheme(config.themePreference);
    }
  }, [config.themePreference]);

  const updateConfig = <K extends keyof CustomerSettingsConfig>(key: K, value: CustomerSettingsConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    try {
      setSaving(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      toast.success("Customer settings saved successfully!");
    } catch {
      toast.error("Failed to save settings to local storage.");
    } finally {
      setTimeout(() => setSaving(false), 400);
    }
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_CUSTOMER_SETTINGS);
    setTheme(DEFAULT_CUSTOMER_SETTINGS.themePreference);
    localStorage.removeItem(STORAGE_KEY);
    setIsResetConfirmOpen(false);
    toast.success("All customer settings reset to factory defaults.");
  };

  const handleExportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `customer_settings_${user?.id || "config"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Settings exported as JSON file.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground min-h-screen pb-20 font-sans">
      {/* Header Banner */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <SettingsIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Customer Preferences & Control</h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Customize your rental defaults, payment rules, notification alerts, theme appearance, and privacy locks.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-muted/60 hover:bg-muted text-foreground border border-border/80 transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleExportConfig}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-muted/60 hover:bg-muted text-foreground border border-border/80 transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="p-3.5 rounded-2xl border border-border/60 bg-background/50 flex items-center gap-3">
            <Bike className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Bike Category</p>
              <p className="text-xs font-bold text-foreground uppercase">{config.preferredBikeCategory}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-border/60 bg-background/50 flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Payment Mode</p>
              <p className="text-xs font-bold text-foreground uppercase">{config.defaultPaymentMethod}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-border/60 bg-background/50 flex items-center gap-3">
            <Bell className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">SMS & WhatsApp</p>
              <p className="text-xs font-bold text-foreground">
                {config.smsRideAlerts && config.whatsappAlerts ? "Enabled" : "Partial"}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-border/60 bg-background/50 flex items-center gap-3">
            <Sun className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Theme Mode</p>
              <p className="text-xs font-bold text-foreground capitalize">{config.themePreference}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {[
          { id: "APPEARANCE" as SettingsTab, label: "Theme & Display", icon: Sun },
          { id: "RENTAL" as SettingsTab, label: "Ride & Booking Defaults", icon: Bike },
          { id: "PAYMENTS" as SettingsTab, label: "Payment & Billing", icon: CreditCard },
          { id: "NOTIFICATIONS" as SettingsTab, label: "Notifications & SMS", icon: Bell },
          { id: "SECURITY" as SettingsTab, label: "Privacy & Account", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: RIDE & BOOKING DEFAULTS */}
      {activeTab === "RENTAL" && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-border/60 pb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Bike className="h-5 w-5 text-primary" />
              <span>Rental & Ride Preferences</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set your default helmet add-ons, preferred bike types, and speed alert thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferred Helmet Option */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 space-y-3">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Default Helmet Requirement
              </label>
              <select
                value={config.preferredHelmetOption}
                onChange={(e) => updateConfig("preferredHelmetOption", e.target.value as any)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
              >
                <option value="single">Single Helmet Included (Rider)</option>
                <option value="dual">Dual Helmets Included (Rider + Pillion)</option>
                <option value="none">No Helmet (Bring Own Helmet)</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Selected helmet option will be pre-filled automatically on booking checkouts.
              </p>
            </div>

            {/* Preferred Bike Category */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 space-y-3">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Default Filtered Category
              </label>
              <select
                value={config.preferredBikeCategory}
                onChange={(e) => updateConfig("preferredBikeCategory", e.target.value as any)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
              >
                <option value="all">All Bike Categories</option>
                <option value="sports">Sports & Performance Bikes</option>
                <option value="scooter">Commuter Scooters & Gearless</option>
                <option value="ev">Electric Vehicles (EVs)</option>
                <option value="cruiser">Cruisers & Royal Enfield</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Explore bikes search will default to your favorite riding category.
              </p>
            </div>

            {/* Preferred City */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 space-y-3">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Default Rental City / Station
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={config.preferredCity}
                  onChange={(e) => updateConfig("preferredCity", e.target.value)}
                  placeholder="e.g. Hyderabad, Telangana"
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                />
              </div>
            </div>

            {/* Instant Booking Toggle */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">Auto Instant Bookings</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Skip confirmation dialogs on instant-available bikes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.autoInstantBooking}
                onChange={(e) => updateConfig("autoInstantBooking", e.target.checked)}
                className="h-5 w-5 rounded text-primary border-border bg-background focus:ring-ring cursor-pointer"
              />
            </div>

            {/* Speed Warning Alert Limit */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Max Speed Warning Threshold
                </label>
                <span className="text-xs font-bold text-primary">{config.maxSpeedWarningAlert} km/h</span>
              </div>
              <input
                type="range"
                min="60"
                max="140"
                step="10"
                value={config.maxSpeedWarningAlert}
                onChange={(e) => updateConfig("maxSpeedWarningAlert", Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground">
                App alerts will notify you if live telemetry detects speed exceeding this limit.
              </p>
            </div>

            {/* Low Battery / Fuel Threshold */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  EV Battery Warning Alert
                </label>
                <span className="text-xs font-bold text-amber-500">{config.lowBatteryThreshold}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={config.lowBatteryThreshold}
                onChange={(e) => updateConfig("lowBatteryThreshold", Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground">
                Triggers notification to locate nearest charging station when EV battery drops.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT & BILLING */}
      {activeTab === "PAYMENTS" && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-border/60 pb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              <span>Payment & Billing Settings</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure default payment handles, invoice receipt preferences, and GST billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferred Payment Method */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 space-y-3">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Default Payment Channel
              </label>
              <select
                value={config.defaultPaymentMethod}
                onChange={(e) => updateConfig("defaultPaymentMethod", e.target.value as any)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
              >
                <option value="upi">UPI / QR Payment (Google Pay, PhonePe, Paytm)</option>
                <option value="card">Credit or Debit Card</option>
                <option value="wallet">SmartBike Wallet / Prepaid Credits</option>
                <option value="netbanking">Net Banking (All Indian Banks)</option>
              </select>
            </div>

            {/* Saved UPI ID */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 space-y-3">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Default UPI Virtual Handle
              </label>
              <input
                type="text"
                value={config.savedUpiId}
                onChange={(e) => updateConfig("savedUpiId", e.target.value)}
                placeholder="e.g. yourname@okhdfcbank"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono font-semibold"
              />
              <p className="text-[11px] text-muted-foreground">Used to auto-populate payment screen for instant 1-tap checkout.</p>
            </div>

            {/* Auto-debit Overtime */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">Auto-Debit Overtime Charges</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Allow system to process minor hourly delay extension fees automatically.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.autoDebitOvertime}
                onChange={(e) => updateConfig("autoDebitOvertime", e.target.checked)}
                className="h-5 w-5 rounded text-primary border-border bg-background focus:ring-ring cursor-pointer"
              />
            </div>

            {/* Email Invoices */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">Email PDF Tax Invoices</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Send PDF transaction invoices immediately upon trip end.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.emailInvoicesOnCompletion}
                onChange={(e) => updateConfig("emailInvoicesOnCompletion", e.target.checked)}
                className="h-5 w-5 rounded text-primary border-border bg-background focus:ring-ring cursor-pointer"
              />
            </div>

            {/* GST Invoice Toggle & Input */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Business GST Invoice Requirement</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Generate B2B tax invoices with GST input tax credit for company expenses.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.requireGstInvoice}
                  onChange={(e) => updateConfig("requireGstInvoice", e.target.checked)}
                  className="h-5 w-5 rounded text-primary border-border bg-background focus:ring-ring cursor-pointer"
                />
              </div>

              {config.requireGstInvoice && (
                <div className="pt-2 border-t border-border/60 max-w-md">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    GSTIN Number (15 Digits)
                  </label>
                  <input
                    type="text"
                    value={config.gstin}
                    onChange={(e) => updateConfig("gstin", e.target.value.toUpperCase())}
                    placeholder="e.g. 36AAAAA0000A1Z5"
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono uppercase font-bold"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS & SMS */}
      {activeTab === "NOTIFICATIONS" && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-border/60 pb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              <span>Notification Preferences</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control SMS alerts, WhatsApp trip updates, email digests, and sound effects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                key: "smsRideAlerts" as keyof CustomerSettingsConfig,
                title: "SMS Ride Alerts & OTPs",
                desc: "Receive unlock PINs, trip start OTPs, and return verification via SMS.",
                icon: Smartphone,
              },
              {
                key: "whatsappAlerts" as keyof CustomerSettingsConfig,
                title: "WhatsApp Live Trip Updates",
                desc: "Get GPS tracking links, host directions, and booking reminders on WhatsApp.",
                icon: Mail,
              },
              {
                key: "emailDailyDigest" as keyof CustomerSettingsConfig,
                title: "Email Summary Receipts",
                desc: "Receive weekly trip activity logs and detailed rental charge breakdown.",
                icon: FileText,
              },
              {
                key: "emergencyContactSms" as keyof CustomerSettingsConfig,
                title: "Emergency Contact SMS Notifications",
                desc: "Send automated trip start and destination arrival SMS to emergency contact.",
                icon: ShieldAlert,
              },
              {
                key: "promoAlerts" as keyof CustomerSettingsConfig,
                title: "Promotional Offers & Weekend Discounts",
                desc: "Receive coupon codes and special festival rental discount notifications.",
                icon: Sparkles,
              },
              {
                key: "soundAlertsEnabled" as keyof CustomerSettingsConfig,
                title: "In-App Audio Alert Tones",
                desc: "Play sound alerts for speed warnings and smart lock lock/unlock state.",
                icon: Volume2,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isChecked = Boolean(config[item.key]);
              return (
                <div
                  key={item.key}
                  className="p-5 rounded-2xl border border-border/70 bg-background/50 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-muted text-foreground mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => updateConfig(item.key as any, e.target.checked)}
                    className="h-5 w-5 rounded text-primary border-border bg-background focus:ring-ring cursor-pointer shrink-0 mt-1"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: THEME & DISPLAY */}
      {activeTab === "APPEARANCE" && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-border/60 pb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sun className="h-5 w-5 text-indigo-500" />
              <span>Theme & Interface Customization</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personalize application color scheme, timezone, table row density, and time format.
            </p>
          </div>

          <div className="space-y-6">
            {/* Theme Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Select Theme Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { mode: "light" as const, label: "Light Mode", icon: Sun, desc: "Clean bright theme" },
                  { mode: "dark" as const, label: "Dark Mode", icon: Moon, desc: "Sleek dark theme" },
                  { mode: "system" as const, label: "System Sync", icon: Tv, desc: "Sync with OS theme" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = config.themePreference === item.mode;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => {
                        updateConfig("themePreference", item.mode);
                        setTheme(item.mode);
                      }}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20"
                          : "border-border/80 bg-background/50 text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
              {/* Timezone */}
              <div className="p-4 rounded-2xl border border-border/70 bg-background/50 space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  System Timezone
                </label>
                <select
                  value={config.timezone}
                  onChange={(e) => updateConfig("timezone", e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground font-semibold"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>

              {/* Time Format */}
              <div className="p-4 rounded-2xl border border-border/70 bg-background/50 space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Time Format
                </label>
                <select
                  value={config.timeFormat}
                  onChange={(e) => updateConfig("timeFormat", e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground font-semibold"
                >
                  <option value="12h">12-Hour Clock (09:30 AM)</option>
                  <option value="24h">24-Hour Clock (21:30)</option>
                </select>
              </div>

              {/* Currency */}
              <div className="p-4 rounded-2xl border border-border/70 bg-background/50 space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Display Currency
                </label>
                <select
                  value={config.currency}
                  onChange={(e) => updateConfig("currency", e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground font-semibold"
                >
                  <option value="INR">Indian Rupee (INR ₹)</option>
                  <option value="USD">US Dollar (USD $)</option>
                  <option value="EUR">Euro (EUR €)</option>
                </select>
              </div>
            </div>

            {/* Table Density */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">Compact Data Layout</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Reduce vertical padding in booking history and payment tables for higher screen density.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.compactTables}
                onChange={(e) => updateConfig("compactTables", e.target.checked)}
                className="h-5 w-5 rounded text-primary border-border bg-background focus:ring-ring cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY & ACCOUNT */}
      {activeTab === "SECURITY" && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-border/60 pb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Privacy Controls & Account Safety</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage live GPS sharing during rides, active session timers, and account security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live GPS Sharing */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-primary" />
                  Live Ride Telemetry Sharing
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Allow bike host partner to track live GPS telemetry during active rental period for safety.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.liveGpsSharingEnabled}
                onChange={(e) => updateConfig("liveGpsSharingEnabled", e.target.checked)}
                className="h-5 w-5 rounded text-primary border-border bg-background focus:ring-ring cursor-pointer mt-1"
              />
            </div>

            {/* Emergency Contact Trip Share */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-emerald-500" />
                  Auto Emergency Share
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Automatically send trip tracking web link to registered emergency contact when booking starts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.shareTripWithEmergencyContact}
                onChange={(e) => updateConfig("shareTripWithEmergencyContact", e.target.checked)}
                className="h-5 w-5 rounded text-primary border-border bg-background focus:ring-ring cursor-pointer mt-1"
              />
            </div>

            {/* Session Timeout */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 space-y-3">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Idle Session Timeout
              </label>
              <select
                value={config.sessionTimeoutMinutes}
                onChange={(e) => updateConfig("sessionTimeoutMinutes", Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
              >
                <option value={15}>15 Minutes Inactivity</option>
                <option value={30}>30 Minutes Inactivity</option>
                <option value={60}>60 Minutes (Default)</option>
                <option value={120}>120 Minutes Inactivity</option>
              </select>
              <p className="text-[11px] text-muted-foreground">Auto log-out timer when app remains untouched.</p>
            </div>

            {/* 2FA Toggle */}
            <div className="p-5 rounded-2xl border border-border/70 bg-background/50 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-indigo-500" />
                  Two-Factor Authentication (2FA)
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Require SMS OTP verification when logging in from new devices or web browsers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.twoFactorEnabled}
                onChange={(e) => updateConfig("twoFactorEnabled", e.target.checked)}
                className="h-5 w-5 rounded text-primary border-border bg-background focus:ring-ring cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Footer Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-card/90 backdrop-blur-md border border-border shadow-xl rounded-2xl px-6 py-3 flex items-center gap-4">
        <span className="text-xs font-bold text-muted-foreground hidden sm:inline">
          Customer preference updates pending save
        </span>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
        </button>
      </div>

      {/* Reset Confirm Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Reset Settings to Defaults?</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This action will reset all your rental options, payment rules, notification toggles, theme preferences, and speed alert thresholds to system factory defaults.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

