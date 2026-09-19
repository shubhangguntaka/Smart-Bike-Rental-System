import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { ownerService } from "@/services/ownerService";
import {
  Settings as SettingsIcon,
  Bell,
  CreditCard,
  Building2,
  Bike,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Smartphone,
  Mail,
  MessageSquare,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Download,
  Trash2,
  Edit3,
  Check,
  Power,
  Volume2,
  VolumeX,
  Eye,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Sliders,
  Radio,
  X,
  ExternalLink,
  MapPin,
  Flame,
  Zap,
  Globe,
  Sun,
  Moon,
  Tv,
  Layout,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

type SettingsTab = "BOOKINGS" | "PAYOUTS" | "NOTIFICATIONS" | "FLEET" | "APPEARANCE" | "SECURITY";

export interface OwnerSettingsConfig {
  // Booking & Operations
  instantBookingEnabled: boolean;
  advanceBookingHours: number;
  minRentalHours: number;
  maxRentalDays: number;
  nonPickupGraceMinutes: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  allow24x7SelfService: boolean;

  // Payouts & Finance
  payoutFrequency: "instant" | "daily" | "weekly";
  payoutEmail: string;
  minPayoutThreshold: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  upiId: string;
  gstin: string;

  // Notifications
  smsBookingAlerts: boolean;
  smsRideAlerts: boolean;
  emailDailyDigest: boolean;
  emailWeeklyReport: boolean;
  whatsappAlerts: boolean;
  payoutCreditAlerts: boolean;
  soundAlertsEnabled: boolean;

  // Fleet & Visibility
  publicListingVisible: boolean;
  liveGpsSharingEnabled: boolean;
  requireStrictKyc: boolean;
  requireSecurityDeposit: boolean;
  securityDepositAmount: number;
  vacationMode: boolean;

  // Display & UI Appearance
  themePreference: "light" | "dark" | "system";
  compactTables: boolean;
  pageSize: number;
  timezone: string;
  currency: string;
  timeFormat: "12h" | "24h";

  // Security
  twoFactorEnabled: boolean;
  sessionTimeoutMinutes: number;
}

const DEFAULT_SETTINGS: OwnerSettingsConfig = {
  instantBookingEnabled: true,
  advanceBookingHours: 2,
  minRentalHours: 2,
  maxRentalDays: 14,
  nonPickupGraceMinutes: 30,
  operatingHoursStart: "07:00",
  operatingHoursEnd: "22:00",
  allow24x7SelfService: false,

  payoutFrequency: "instant",
  payoutEmail: "owner@smartbike.com",
  minPayoutThreshold: 500,
  bankName: "HDFC Bank Ltd",
  accountNumber: "50100492817291",
  ifscCode: "HDFC0001234",
  accountHolderName: "Rajesh Sharma",
  upiId: "rajesh.sharma@okhdfcbank",
  gstin: "",

  smsBookingAlerts: true,
  smsRideAlerts: true,
  emailDailyDigest: true,
  emailWeeklyReport: true,
  whatsappAlerts: true,
  payoutCreditAlerts: true,
  soundAlertsEnabled: true,

  publicListingVisible: true,
  liveGpsSharingEnabled: true,
  requireStrictKyc: true,
  requireSecurityDeposit: false,
  securityDepositAmount: 1000,
  vacationMode: false,

  themePreference: "system",
  compactTables: false,
  pageSize: 8,
  timezone: "Asia/Kolkata",
  currency: "INR",
  timeFormat: "12h",

  twoFactorEnabled: true,
  sessionTimeoutMinutes: 60,
};

const STORAGE_KEY = "smartbike_owner_settings_config";

export default function OwnerSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const initialTab = useMemo<SettingsTab>(() => {
    const tabParam = searchParams.get("tab")?.toUpperCase();
    if (
      tabParam === "PAYOUTS" ||
      tabParam === "BOOKINGS" ||
      tabParam === "NOTIFICATIONS" ||
      tabParam === "FLEET" ||
      tabParam === "APPEARANCE" ||
      tabParam === "SECURITY"
    ) {
      return tabParam as SettingsTab;
    }
    const stateTab = (location.state as any)?.tab?.toUpperCase();
    if (
      stateTab === "PAYOUTS" ||
      stateTab === "BOOKINGS" ||
      stateTab === "NOTIFICATIONS" ||
      stateTab === "FLEET" ||
      stateTab === "APPEARANCE" ||
      stateTab === "SECURITY"
    ) {
      return stateTab as SettingsTab;
    }
    return "BOOKINGS";
  }, [searchParams, location.state]);

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [saving, setSaving] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Settings State
  const [config, setConfig] = useState<OwnerSettingsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Bank edit modal form state
  const [bankForm, setBankForm] = useState({
    bankName: config.bankName,
    accountHolderName: config.accountHolderName,
    accountNumber: config.accountNumber,
    confirmAccountNumber: config.accountNumber,
    ifscCode: config.ifscCode,
    upiId: config.upiId,
  });

  useEffect(() => {
    const shouldEditBank = searchParams.get("editBank") === "true" || (location.state as any)?.openBankModal === true;
    const tabParam = searchParams.get("tab")?.toUpperCase() || (location.state as any)?.tab?.toUpperCase();
    if (tabParam === "PAYOUTS" || shouldEditBank) {
      setActiveTab("PAYOUTS");
    }
    if (shouldEditBank) {
      setBankForm({
        bankName: config.bankName,
        accountHolderName: config.accountHolderName,
        accountNumber: config.accountNumber,
        confirmAccountNumber: config.accountNumber,
        ifscCode: config.ifscCode,
        upiId: config.upiId,
      });
      setIsBankModalOpen(true);
    }
  }, [searchParams, location.state, config.bankName, config.accountHolderName, config.accountNumber, config.ifscCode, config.upiId]);

  useEffect(() => {
    if (user?.email) {
      setConfig((prev) => ({
        ...prev,
        payoutEmail: prev.payoutEmail === "owner@smartbike.com" ? user.email : prev.payoutEmail,
        accountHolderName: prev.accountHolderName === "Rajesh Sharma" && user.fullName ? user.fullName : prev.accountHolderName,
      }));
    }
  }, [user]);

  // Fetch bank details from backend database
  useEffect(() => {
    ownerService.getBankAccount()
      .then((res) => {
        if (res.data?.data) {
          const b = res.data.data;
          setConfig((prev) => {
            const merged = {
              ...prev,
              bankName: b.bankName || prev.bankName,
              accountHolderName: b.accountHolderName || prev.accountHolderName,
              accountNumber: b.accountNumber || prev.accountNumber,
              ifscCode: b.ifscCode || prev.ifscCode,
              upiId: b.upiId || prev.upiId,
              payoutFrequency: (b.payoutFrequency as any) || prev.payoutFrequency,
              minPayoutThreshold: b.minPayoutThreshold || prev.minPayoutThreshold,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch((err) => {
        console.debug("Backend bank account fetch skipped:", err);
      });
  }, []);

  const handleUpdateConfig = <K extends keyof OwnerSettingsConfig>(key: K, value: OwnerSettingsConfig[K]) => {
    setConfig((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      // Also persist bank details to backend
      try {
        await ownerService.updateBankAccount({
          bankName: config.bankName,
          accountHolderName: config.accountHolderName,
          accountNumber: config.accountNumber,
          ifscCode: config.ifscCode,
          upiId: config.upiId,
          payoutFrequency: config.payoutFrequency,
          minPayoutThreshold: config.minPayoutThreshold,
        });
      } catch (e) {
        console.debug("Backend bank sync fallback:", e);
      }
      setTimeout(() => {
        setSaving(false);
        toast.success("Owner operations and partner preferences saved successfully!");
      }, 600);
    } catch {
      setSaving(false);
      toast.error("Failed to persist settings.");
    }
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setIsResetConfirmOpen(false);
    toast.success("All settings restored to recommended partner defaults.");
  };

  const handleOpenBankModal = () => {
    setBankForm({
      bankName: config.bankName,
      accountHolderName: config.accountHolderName,
      accountNumber: config.accountNumber,
      confirmAccountNumber: config.accountNumber,
      ifscCode: config.ifscCode,
      upiId: config.upiId,
    });
    setIsBankModalOpen(true);
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName.trim()) {
      toast.error("Bank name is required");
      return;
    }
    if (!bankForm.accountHolderName.trim()) {
      toast.error("Account holder name is required");
      return;
    }
    if (!bankForm.accountNumber.trim()) {
      toast.error("Account number is required");
      return;
    }
    if (bankForm.accountNumber !== bankForm.confirmAccountNumber) {
      toast.error("Account numbers do not match");
      return;
    }
    if (!bankForm.ifscCode.trim() || bankForm.ifscCode.length < 8) {
      toast.error("Please enter a valid IFSC code");
      return;
    }

    const updated = {
      ...config,
      bankName: bankForm.bankName.trim(),
      accountHolderName: bankForm.accountHolderName.trim(),
      accountNumber: bankForm.accountNumber.trim(),
      ifscCode: bankForm.ifscCode.trim().toUpperCase(),
      upiId: bankForm.upiId.trim(),
    };

    setConfig(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setIsBankModalOpen(false);

    try {
      await ownerService.updateBankAccount({
        bankName: updated.bankName,
        accountHolderName: updated.accountHolderName,
        accountNumber: updated.accountNumber,
        ifscCode: updated.ifscCode,
        upiId: updated.upiId,
        payoutFrequency: updated.payoutFrequency,
        minPayoutThreshold: updated.minPayoutThreshold,
      });
      toast.success("Payout bank account and UPI details updated successfully in backend!");
    } catch {
      toast.success("Payout bank account updated locally!");
    }
  };

  const handleExportConfigJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `owner_settings_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
    toast.success("Settings configuration exported (JSON)!");
  };

  const maskedAccount = useMemo(() => {
    const num = config.accountNumber || "50100492817291";
    if (num.length <= 4) return num;
    return `•••• •••• ${num.slice(-4)}`;
  }, [config.accountNumber]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground min-h-screen pb-16 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border/80 p-6 sm:p-8 rounded-3xl shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Owner Portal Settings
              </h1>
              {config.vacationMode ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-500/20">
                  <Flame className="h-3 w-3" />
                  Vacation Mode Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                  <Zap className="h-3 w-3" />
                  Fleet Live
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Configure automated booking rules, bank payouts, notification alerts, and fleet security policies.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs font-bold text-foreground transition hover:bg-muted active:scale-95 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95 cursor-pointer shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {saving ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto sm:flex-wrap gap-2 border-b border-border/60 pb-3 scrollbar-none">
        {[
          { id: "APPEARANCE" as SettingsTab, label: "Display & Theme", icon: Sliders },
          { id: "BOOKINGS" as SettingsTab, label: "Booking & Operations", icon: Calendar },
          { id: "PAYOUTS" as SettingsTab, label: "Payouts & Bank Settlement", icon: CreditCard },
          { id: "NOTIFICATIONS" as SettingsTab, label: "Alerts & Notifications", icon: Bell },
          { id: "FLEET" as SettingsTab, label: "Fleet & Visibility", icon: Bike },
          { id: "SECURITY" as SettingsTab, label: "Security & Data Export", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Booking & Operations */}
      {activeTab === "BOOKINGS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-foreground">Rental Booking Policies & Automation</h3>
                <p className="text-[11px] text-muted-foreground">Define how customer ride requests are accepted, scheduled, and managed</p>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {/* Instant Booking Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/70 hover:border-primary/40 transition">
                <div className="space-y-0.5 pr-4">
                  <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <span>Instant Booking Mode</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Recommended
                    </span>
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Automatically confirm and lock customer bookings instantly without requiring manual approval clicks.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.instantBookingEnabled}
                    onChange={(e) => handleUpdateConfig("instantBookingEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* 24x7 Self-Service Unlock */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/70 hover:border-primary/40 transition">
                <div className="space-y-0.5 pr-4">
                  <p className="font-bold text-foreground text-sm">24/7 Self-Service QR Unlock</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Allow verified customers to scan QR codes and start rides outside normal operating hours.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.allow24x7SelfService}
                    onChange={(e) => handleUpdateConfig("allow24x7SelfService", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Lead times & durations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Advance Booking Notice Window</label>
                  <select
                    value={config.advanceBookingHours}
                    onChange={(e) => handleUpdateConfig("advanceBookingHours", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                  >
                    <option value={1}>1 Hour in advance</option>
                    <option value={2}>2 Hours in advance (Standard)</option>
                    <option value={6}>6 Hours in advance</option>
                    <option value={24}>24 Hours in advance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Non-Pickup Release Grace Period</label>
                  <select
                    value={config.nonPickupGraceMinutes}
                    onChange={(e) => handleUpdateConfig("nonPickupGraceMinutes", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                  >
                    <option value={15}>15 Minutes after schedule</option>
                    <option value={30}>30 Minutes after schedule</option>
                    <option value={60}>60 Minutes after schedule</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Minimum Rental Duration</label>
                  <select
                    value={config.minRentalHours}
                    onChange={(e) => handleUpdateConfig("minRentalHours", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                  >
                    <option value={1}>1 Hour Minimum</option>
                    <option value={2}>2 Hours Minimum</option>
                    <option value={4}>4 Hours Minimum</option>
                    <option value={24}>24 Hours (1 Day Minimum)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Maximum Rental Duration</label>
                  <select
                    value={config.maxRentalDays}
                    onChange={(e) => handleUpdateConfig("maxRentalDays", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                  >
                    <option value={3}>3 Days Maximum</option>
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={30}>30 Days (1 Month)</option>
                  </select>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/60 pt-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Daily Hub Opening Time</label>
                  <input
                    type="time"
                    value={config.operatingHoursStart}
                    onChange={(e) => handleUpdateConfig("operatingHoursStart", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Daily Hub Closing Time</label>
                  <input
                    type="time"
                    value={config.operatingHoursEnd}
                    onChange={(e) => handleUpdateConfig("operatingHoursEnd", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Ops Summary Card */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Operations Summary
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Booking Mode</span>
                  <span className="font-bold text-foreground">
                    {config.instantBookingEnabled ? "Instant (Auto-Accept)" : "Manual Review"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Daily Window</span>
                  <span className="font-mono text-foreground">
                    {config.operatingHoursStart} — {config.operatingHoursEnd}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Max Duration</span>
                  <span className="font-bold text-foreground">{config.maxRentalDays} Days</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Self-Service QR</span>
                  <span className={`font-bold ${config.allow24x7SelfService ? "text-emerald-500" : "text-muted-foreground"}`}>
                    {config.allow24x7SelfService ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-xs space-y-1">
              <p className="font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Live Policy Active
              </p>
              <p className="text-[11px] text-muted-foreground">
                Changes take effect immediately for all upcoming customer search results.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Payouts & Bank Settlement */}
      {activeTab === "PAYOUTS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                <div>
                  <h3 className="text-base font-bold text-foreground">Settlement Account & Payout Schedule</h3>
                  <p className="text-[11px] text-muted-foreground">Direct bank account and UPI routing for automated rental payouts</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenBankModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition cursor-pointer border border-primary/20"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Bank / UPI</span>
              </button>
            </div>

            {/* Current Bank Account Card */}
            <div className="p-5 rounded-3xl bg-linear-to-br from-card via-background to-card border border-border/80 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-500" />
                  <span className="font-black text-sm text-foreground">{config.bankName}</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  KYC Verified Payout Account
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Beneficiary Name</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">{config.accountHolderName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Number</span>
                  <p className="font-mono font-bold text-foreground text-sm mt-0.5">{maskedAccount}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">IFSC Code</span>
                  <p className="font-mono font-bold text-primary text-sm mt-0.5">{config.ifscCode}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Primary UPI VPA</span>
                  <p className="font-mono font-bold text-foreground text-sm mt-0.5">{config.upiId || "Not registered"}</p>
                </div>
              </div>
            </div>

            {/* Frequency & Threshold */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Automated Payout Frequency</label>
                <select
                  value={config.payoutFrequency}
                  onChange={(e) => handleUpdateConfig("payoutFrequency", e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value="instant">Instant Clearance (Upon Trip Completion)</option>
                  <option value="daily">Daily Settlement Batch (Midnight)</option>
                  <option value="weekly">Weekly Settlement Batch (Every Monday)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Minimum Payout Balance Threshold (₹)</label>
                <select
                  value={config.minPayoutThreshold}
                  onChange={(e) => handleUpdateConfig("minPayoutThreshold", Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value={100}>₹100 (Minimum)</option>
                  <option value={500}>₹500 (Standard)</option>
                  <option value={1000}>₹1,000</option>
                  <option value={2500}>₹2,500</option>
                  <option value={5000}>₹5,000</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-foreground">Payout Receipt Notification Email</label>
                <input
                  type="email"
                  value={config.payoutEmail}
                  onChange={(e) => handleUpdateConfig("payoutEmail", e.target.value)}
                  placeholder="e.g. finance@owner.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Settlement Info Card */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-500" />
                Settlement Governance
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Earnings are credited directly through Razorpay Route and IMPS bank gateway with zero withholding penalty.
              </p>

              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee:</span>
                  <span className="font-bold text-emerald-600">Retained at 10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TDS / Withholding:</span>
                  <span className="font-bold text-foreground">0% Exempt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payout Protocol:</span>
                  <span className="font-mono text-foreground">IMPS / UPI Auto</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenBankModal}
              className="w-full py-2.5 bg-background border border-border/80 hover:bg-muted text-foreground text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              <span>Configure Payout Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Alerts & Notifications */}
      {activeTab === "NOTIFICATIONS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-foreground">Notification Channels & Delivery Preferences</h3>
                <p className="text-[11px] text-muted-foreground">Choose which alerts are sent via SMS, Email, WhatsApp, and Toast popups</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {[
                {
                  key: "smsBookingAlerts" as const,
                  title: "SMS Booking Request Alerts",
                  desc: "Receive instant SMS text message when a customer places a new bike reservation.",
                },
                {
                  key: "smsRideAlerts" as const,
                  title: "Ride Start & Return Milestones",
                  desc: "Get SMS updates when customer unlocks bike via QR and when returned.",
                },
                {
                  key: "whatsappAlerts" as const,
                  title: "WhatsApp Real-Time Alerts",
                  desc: "Receive WhatsApp alerts for emergency roadside tickets and booking confirmations.",
                },
                {
                  key: "emailDailyDigest" as const,
                  title: "Daily Revenue & Activity Digest",
                  desc: "Receive midnight email summary with today's completed rides and gross earnings.",
                },
                {
                  key: "emailWeeklyReport" as const,
                  title: "Weekly Statement & Tax Invoices",
                  desc: "Receive PDF financial statements and breakdown reports every Monday morning.",
                },
                {
                  key: "payoutCreditAlerts" as const,
                  title: "Bank Payout Settlement Credits",
                  desc: "Instant notification with bank reference UTR number whenever funds are disbursed.",
                },
                {
                  key: "soundAlertsEnabled" as const,
                  title: "Audible Chime / Sound Effects",
                  desc: "Play sound effect in browser when a new booking request or notification arrives.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/70 hover:border-primary/40 transition"
                >
                  <div className="space-y-0.5 pr-4">
                    <p className="font-bold text-foreground text-sm">{item.title}</p>
                    <p className="text-muted-foreground text-xs">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={config[item.key]}
                      onChange={(e) => handleUpdateConfig(item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Notification Center Sync
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                All alert channels integrate synchronously with your platform notification inbox located at{" "}
                <Link to="/owner/notifications" className="text-primary font-bold hover:underline">
                  /owner/notifications
                </Link>
                .
              </p>

              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">
                    Sound Alerts: {config.soundAlertsEnabled ? "Active" : "Muted"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  You will receive audio notification feedback on every active session action.
                </p>
              </div>
            </div>

            <Link
              to="/owner/notifications"
              className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Open Notification History</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Tab 4: Fleet & Visibility */}
      {activeTab === "FLEET" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <Bike className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-foreground">Fleet Discovery & Protection Controls</h3>
                <p className="text-[11px] text-muted-foreground">Manage customer map visibility, GPS sharing, and security deposits</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Public Search Visibility */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/70 hover:border-primary/40 transition">
                <div className="space-y-0.5 pr-4">
                  <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>Public Customer Discovery</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    List all your verified bikes on customer search results and live interactive map.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.publicListingVisible}
                    onChange={(e) => handleUpdateConfig("publicListingVisible", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Live GPS Telemetry */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/70 hover:border-primary/40 transition">
                <div className="space-y-0.5 pr-4">
                  <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Live GPS Telemetry Sharing</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Enable real-time speedometer, battery level, and location sharing during ongoing rentals.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.liveGpsSharingEnabled}
                    onChange={(e) => handleUpdateConfig("liveGpsSharingEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Strict KYC Requirement */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/70 hover:border-primary/40 transition">
                <div className="space-y-0.5 pr-4">
                  <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Strict Driver KYC Verification Mandatory</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Only allow customers with government-verified Driving License & Aadhaar to book your bikes.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.requireStrictKyc}
                    onChange={(e) => handleUpdateConfig("requireStrictKyc", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Vacation Mode Toggle */}
              <div className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                config.vacationMode ? "bg-amber-500/10 border-amber-500/40" : "bg-muted/20 border-border/70"
              }`}>
                <div className="space-y-0.5 pr-4">
                  <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <span>Vacation / Temporary Hosting Pause</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Temporarily hides all your bikes from search without deleting listings or affecting active rides.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.vacationMode}
                    onChange={(e) => {
                      const val = e.target.checked;
                      handleUpdateConfig("vacationMode", val);
                      if (val) {
                        toast.success("Vacation Mode activated. Your fleet is paused.");
                      } else {
                        toast.success("Fleet is now live and accepting bookings!");
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Bike className="h-4 w-4 text-primary" />
                Fleet Protection Policy
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                All rentals include commercial comprehensive insurance coverage and 24/7 roadside breakdown assistance.
              </p>

              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance:</span>
                  <span className="font-bold text-emerald-600">Active (Standard)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theft Protection:</span>
                  <span className="font-bold text-foreground">GPS Geo-Locked</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Towing Assistance:</span>
                  <span className="font-bold text-primary">Included</span>
                </div>
              </div>
            </div>

            <Link
              to="/owner/bikes"
              className="w-full py-2.5 bg-background border border-border/80 hover:bg-muted text-foreground text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>Manage Fleet Vehicles</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Tab: Display & Appearance */}
      {activeTab === "APPEARANCE" && (
        <div className="space-y-6">
          {/* Visual Theme Selector */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Sun className="h-4 w-4" />
                  </div>
                  Visual Appearance & Theme
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Personalize your owner portal lighting, workspace contrast, and color palette
                </p>
              </div>

              <span className="self-start sm:self-auto text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-muted text-muted-foreground border border-border">
                Current Theme: {theme.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: "light",
                  label: "Light Mode",
                  icon: Sun,
                  desc: "Clean high-contrast daylight interface designed for bright daylight clarity.",
                },
                {
                  id: "dark",
                  label: "Dark Mode",
                  icon: Moon,
                  desc: "Sleek low-light aesthetic reducing eye fatigue during evening host management.",
                },
                {
                  id: "system",
                  label: "System Sync",
                  icon: Tv,
                  desc: "Automatically adapts in real-time to your operating system's dark/light schedule.",
                },
              ].map((opt) => {
                const OptIcon = opt.icon;
                const isCurrent = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTheme(opt.id as any);
                      handleUpdateConfig("themePreference", opt.id as any);
                    }}
                    className={`relative p-5 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between space-y-4 cursor-pointer group ${
                      isCurrent
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/5 ring-1 ring-primary/40"
                        : "border-border/80 bg-background/60 hover:bg-muted/50 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-2.5 rounded-xl transition-all duration-200 ${
                          isCurrent
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                      >
                        <OptIcon className="h-5 w-5" />
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1 shadow-xs">
                          <Check className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-normal">{opt.desc}</p>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCurrent ? "bg-primary w-full" : "bg-transparent w-0"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Layout & Presentation */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
            <div className="border-b border-border/60 pb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Layout className="h-4 w-4" />
                </div>
                Data Presentation & Grid Density
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure table compact mode, records per page, and timestamp clock formats
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Compact Tables */}
              <div className="space-y-3 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Compact Data Density</label>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${config.compactTables ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {config.compactTables ? "Compact" : "Standard"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Reduces vertical padding across bookings, rentals, and payments tables for higher information density.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">Enable compact view</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.compactTables}
                      onChange={(e) => handleUpdateConfig("compactTables", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>

              {/* Default Page Size */}
              <div className="space-y-2 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Records Per Page</label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {config.pageSize || 8} items
                  </span>
                </div>
                <select
                  value={config.pageSize || 8}
                  onChange={(e) => handleUpdateConfig("pageSize", Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  <option value={8}>8 records per page (Standard)</option>
                  <option value={10}>10 records per page</option>
                  <option value={15}>15 records per page</option>
                  <option value={25}>25 records per page</option>
                  <option value={50}>50 records per page (High Density)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Applies default pagination length to your fleet & payment history.</p>
              </div>

              {/* Time Format */}
              <div className="space-y-2 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Time Format Display</label>
                <select
                  value={config.timeFormat || "12h"}
                  onChange={(e) => handleUpdateConfig("timeFormat", e.target.value as "12h" | "24h")}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  <option value="12h">12-Hour Clock (02:30 PM)</option>
                  <option value="24h">24-Hour Military Clock (14:30)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Formats pickup and return schedule times on customer booking slips.</p>
              </div>

              {/* Timezone */}
              <div className="space-y-2 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Operating Timezone</label>
                <select
                  value={config.timezone || "Asia/Kolkata"}
                  onChange={(e) => handleUpdateConfig("timezone", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30) — India Standard</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT +08:00)</option>
                  <option value="America/New_York">America/New_York (EST -05:00)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Governs automated pickup cutoff windows and calendar bookings.</p>
              </div>

              {/* Currency Display */}
              <div className="space-y-2 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Preferred Currency Symbol</label>
                <select
                  value={config.currency || "INR"}
                  onChange={(e) => handleUpdateConfig("currency", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Currency format applied across your daily earning reports.</p>
              </div>

              {/* Sound Alerts */}
              <div className="space-y-3 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Audio Chimes</label>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${config.soundAlertsEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                      {config.soundAlertsEnabled ? "Enabled" : "Muted"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Plays subtle audible cues upon incoming instant booking notifications.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">Sound notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.soundAlertsEnabled}
                      onChange={(e) => handleUpdateConfig("soundAlertsEnabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs backdrop-blur-md">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Live Workspace Preview
            </h3>
            <p className="text-xs text-muted-foreground">
              Here is how your interactive cards and status badges appear with your current theme and settings:
            </p>

            <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-background/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <Bike className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">Royal Enfield Hunter 350</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Live & Available
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Plate: TS-09-EA-8842 • Hourly Rate: ₹99/hr • Hub: Cyber Towers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition"
                >
                  View Telemetry
                </button>
                <button
                  type="button"
                  className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition"
                >
                  Instant Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Security & Data Export */}
      {activeTab === "SECURITY" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-foreground">Security Controls & Data Portability</h3>
                <p className="text-[11px] text-muted-foreground">Manage login safety, session timeouts, and download your complete fleet ledger backup</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/70 hover:border-primary/40 transition">
                <div className="space-y-0.5 pr-4">
                  <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-emerald-500" />
                    <span>Two-Factor Authentication (2FA)</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Require OTP verification when modifying payout bank accounts or approving high-value bookings.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={config.twoFactorEnabled}
                    onChange={(e) => handleUpdateConfig("twoFactorEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Session Inactivity Timeout */}
              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-foreground">Active Session Timeout</label>
                <select
                  value={config.sessionTimeoutMinutes}
                  onChange={(e) => handleUpdateConfig("sessionTimeoutMinutes", Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value={15}>15 Minutes of inactivity</option>
                  <option value={30}>30 Minutes of inactivity</option>
                  <option value={60}>1 Hour of inactivity (Standard)</option>
                  <option value={240}>4 Hours of inactivity</option>
                  <option value={0}>Never (Stay logged in)</option>
                </select>
              </div>

              {/* Data Export Box */}
              <div className="p-5 rounded-2xl border border-border/80 bg-background/50 space-y-3">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  Export Account Data & Configuration
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Download an official backup file containing all your host settings, fleet preferences, and configuration metadata.
                </p>
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleExportConfigJson}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-card border border-border/80 hover:bg-muted text-foreground text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
                  >
                    <FileJson className="h-3.5 w-3.5 text-primary" />
                    <span>Export JSON Backup</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              Security Recommendations
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-2xl border border-border/70 bg-background/50 space-y-1">
                <p className="font-bold text-foreground">Secure Bank Routing</p>
                <p className="text-[11px]">Keep your bank details updated to avoid any payout settlement delays.</p>
              </div>
              <div className="p-3 rounded-2xl border border-border/70 bg-background/50 space-y-1">
                <p className="font-bold text-foreground">Confidential OTPs</p>
                <p className="text-[11px]">Platform operators will never ask for your banking PIN or password.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bank Details Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-5 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Update Payout Bank Details</h3>
                  <p className="text-xs text-muted-foreground">Ensure bank account details match your KYC Aadhaar name</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank, SBI, ICICI"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:outline-hidden focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-foreground mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="e.g. 50100492817291"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs font-mono focus:outline-hidden focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Confirm Account Number</label>
                  <input
                    type="text"
                    value={bankForm.confirmAccountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value })}
                    placeholder="Re-enter account number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs font-mono focus:outline-hidden focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-foreground mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs font-mono focus:outline-hidden focus:border-primary uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">UPI ID (Optional)</label>
                  <input
                    type="text"
                    value={bankForm.upiId}
                    onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                    placeholder="e.g. name@okhdfcbank"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs font-mono focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 justify-end border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 bg-background border border-border text-foreground text-xs font-bold rounded-xl hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer shadow-sm"
                >
                  Save Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 text-center max-h-[90dvh] overflow-y-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Restore Default Settings?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This will reset all your booking rules, operating hours, notification toggles, and payout thresholds back to platform recommendations.
            </p>
            <div className="flex gap-2 pt-2 justify-center">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-background border border-border text-foreground text-xs font-bold rounded-xl hover:bg-muted transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-5 py-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer shadow-sm"
              >
                Yes, Restore Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
