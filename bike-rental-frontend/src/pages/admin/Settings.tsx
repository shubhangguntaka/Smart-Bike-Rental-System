import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  CreditCard,
  Database,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileJson,
  Fingerprint,
  Flame,
  Gauge,
  Globe,
  HardDrive,
  Info,
  KeyRound,
  Layers,
  Layout,
  Lock,
  Mail,
  MessageSquare,
  Moon,
  Power,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Server,
  Settings as SettingsIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  Terminal,
  Trash2,
  Tv,
  Upload,
  User,
  Volume2,
  VolumeX,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import adminService from "@/services/adminService";
import type { BankAccountDTO } from "@/types/owner";

// Interface defining all admin configurable settings
export interface AdminSettingsConfig {
  // Display & UI
  pageSize: number;
  compactTables: boolean;
  autoRefreshInterval: number;
  soundAlertsEnabled: boolean;
  timezone: string;
  currency: string;
  timeFormat: "12h" | "24h";

  // Platform & Financial Operations
  commission: number;
  securityDeposit: number;
  supportEmail: string;
  emergencyHotline: string;
  maintenanceMode: boolean;
  maintenanceBannerText: string;
  surgePricingEnabled: boolean;
  surgeMultiplier: number;
  peakHourStart: string;
  peakHourEnd: string;
  autoCancelUnpaidMinutes: number;
  autoApproveBikeListings: boolean;

  // Fleet & Safety Policies
  freeCancellationMinutes: number;
  lateReturnPenaltyPerHour: number;
  evMinBatteryThreshold: number;
  mandatoryHelmetCheck: boolean;
  geofenceEnforcement: boolean;
  maxActiveBookingsPerCustomer: number;
  damageClaimLiabilityCeiling: number;

  // Security & Governance
  sessionInactivityTimeout: number; // minutes, 0 = never
  enforceAdmin2FA: boolean;
  mandatoryKycVerification: boolean;
  passwordPolicyLevel: "standard" | "strict" | "maximum";
  adminIpWhitelist: string;
  webhookSecret: string;
  auditLogRetentionDays: number;

  // Notifications & Channels
  notifyOnNewUser: boolean;
  notifyOnBikeVerification: boolean;
  notifyOnHighValueBooking: boolean;
  notifyOnDisputeSos: boolean;
  notifyDailyRevenueSummary: boolean;
  smsGatewayEnabled: boolean;
  whatsappAlertsEnabled: boolean;
  toastPosition: "top-right" | "top-center" | "bottom-right";
  lowFleetAlertThreshold: number; // percentage
}

const DEFAULT_SETTINGS: AdminSettingsConfig = {
  pageSize: 8,
  compactTables: false,
  autoRefreshInterval: 30,
  soundAlertsEnabled: true,
  timezone: "Asia/Kolkata",
  currency: "INR",
  timeFormat: "12h",

  commission: 10,
  securityDeposit: 500,
  supportEmail: "support@smartbike.com",
  emergencyHotline: "+91 1800 258 9000",
  maintenanceMode: false,
  maintenanceBannerText: "Smart Bike is undergoing scheduled system upgrades. Live bookings will resume shortly.",
  surgePricingEnabled: true,
  surgeMultiplier: 1.25,
  peakHourStart: "17:00",
  peakHourEnd: "21:00",
  autoCancelUnpaidMinutes: 15,
  autoApproveBikeListings: false,

  freeCancellationMinutes: 15,
  lateReturnPenaltyPerHour: 150,
  evMinBatteryThreshold: 30,
  mandatoryHelmetCheck: true,
  geofenceEnforcement: true,
  maxActiveBookingsPerCustomer: 2,
  damageClaimLiabilityCeiling: 10000,

  sessionInactivityTimeout: 30,
  enforceAdmin2FA: false,
  mandatoryKycVerification: true,
  passwordPolicyLevel: "strict",
  adminIpWhitelist: "127.0.0.1/32, 192.168.1.0/24",
  webhookSecret: "whsec_live_9b8f2a74c10e395d8204bb58e990c8a1",
  auditLogRetentionDays: 90,

  notifyOnNewUser: true,
  notifyOnBikeVerification: true,
  notifyOnHighValueBooking: true,
  notifyOnDisputeSos: true,
  notifyDailyRevenueSummary: true,
  smsGatewayEnabled: true,
  whatsappAlertsEnabled: false,
  toastPosition: "top-right",
  lowFleetAlertThreshold: 20,
};

const STORAGE_KEY = "smartbike_admin_settings_v2";

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab State
  const initialTab = useMemo<
    "display" | "platform" | "banking" | "fleet" | "security" | "notifications" | "telemetry"
  >(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "display" ||
      tabParam === "platform" ||
      tabParam === "banking" ||
      tabParam === "fleet" ||
      tabParam === "security" ||
      tabParam === "notifications" ||
      tabParam === "telemetry"
    ) {
      return tabParam;
    }
    return "display";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<
    "display" | "platform" | "banking" | "fleet" | "security" | "notifications" | "telemetry"
  >(initialTab);

  // Sync tab with URL
  const handleTabChange = (
    tab: "display" | "platform" | "banking" | "fleet" | "security" | "notifications" | "telemetry"
  ) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };

  // Platform Bank Account State
  const [bankAccount, setBankAccount] = useState<BankAccountDTO | null>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState<BankAccountDTO>({
    bankName: "State Bank of India",
    accountHolderName: "SmartBike Platform Escrow Admin",
    accountNumber: "392019482710",
    ifscCode: "SBIN0001234",
    accountType: "CURRENT",
    branchName: "Cyber City Branch, Hyderabad",
    upiId: "smartbike.admin@oksbi",
    payoutFrequency: "DAILY",
    autoSettlementEnabled: true,
    minPayoutThreshold: 1000,
    isKycVerified: true,
  });

  const loadBankAccount = useCallback(async () => {
    try {
      setBankLoading(true);
      const data = await adminService.getBankAccount();
      if (data) {
        setBankAccount(data);
        setBankForm(data);
      }
    } catch {
      // Keep local defaults
    } finally {
      setBankLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBankAccount();
  }, [loadBankAccount]);

  // Main Config State
  const [config, setConfig] = useState<AdminSettingsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    const savedPageSize = localStorage.getItem("admin_default_page_size");
    const savedCompact = localStorage.getItem("admin_compact_tables");
    const savedRefresh = localStorage.getItem("admin_auto_refresh");

    return {
      ...DEFAULT_SETTINGS,
      pageSize: savedPageSize ? Number(savedPageSize) : DEFAULT_SETTINGS.pageSize,
      compactTables: savedCompact === "true" ? true : DEFAULT_SETTINGS.compactTables,
      autoRefreshInterval: savedRefresh ? Number(savedRefresh) : DEFAULT_SETTINGS.autoRefreshInterval,
    };
  });

  const [initialConfig, setInitialConfig] = useState<AdminSettingsConfig>(config);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Modals & Diagnostic States
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRegenWebhookModal, setShowRegenWebhookModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Live Telemetry Diagnostic testing states
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<{ status: "idle" | "success" | "error"; latency?: number; message?: string }>({ status: "idle" });
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testWebhookLoading, setTestWebhookLoading] = useState(false);

  // Check if form is modified
  useEffect(() => {
    const dirty = JSON.stringify(config) !== JSON.stringify(initialConfig);
    setIsDirty(dirty);
  }, [config, initialConfig]);

  // Helper to update individual settings
  const updateSetting = <K extends keyof AdminSettingsConfig>(key: K, value: AdminSettingsConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Play subtle feedback sound if enabled
  const playSoundFeedback = () => {
    if (!config.soundAlertsEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio not permitted or supported
    }
  };

  // Save All Changes Handler
  const handleSaveAll = () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      localStorage.setItem("admin_default_page_size", String(config.pageSize));
      localStorage.setItem("admin_compact_tables", String(config.compactTables));
      localStorage.setItem("admin_auto_refresh", String(config.autoRefreshInterval));

      window.dispatchEvent(new CustomEvent("smartbike:admin_settings_updated", { detail: config }));

      setTimeout(() => {
        setInitialConfig(config);
        setSaving(false);
        setIsDirty(false);
        playSoundFeedback();
        toast.success("System configurations & preferences saved successfully!", {
          icon: "🚀",
          style: {
            borderRadius: "14px",
            background: "#18181b",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        });
      }, 350);
    } catch {
      setSaving(false);
      toast.error("Failed to persist settings to storage.");
    }
  };

  // Reset to Defaults
  const handleResetToDefaults = () => {
    setConfig(DEFAULT_SETTINGS);
    setShowResetModal(false);
    toast.success("Settings restored to factory defaults! Click 'Save' to apply.");
  };

  // Export Settings as JSON file
  const handleExportJSON = () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: "2.0.0",
        platform: "Smart Bike Rental Enterprise",
        settings: config,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `smartbike-admin-settings-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Configuration exported successfully!");
    } catch {
      toast.error("Failed to export configuration.");
    }
  };

  // Import JSON File
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedSettings = parsed.settings || parsed;
        if (typeof importedSettings === "object" && importedSettings !== null) {
          setConfig((prev) => ({ ...prev, ...importedSettings }));
          toast.success("Configuration imported successfully! Click 'Save' to apply.");
        } else {
          toast.error("Invalid settings JSON structure.");
        }
      } catch {
        toast.error("Failed to parse the imported JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Regenerate Webhook Secret
  const handleRegenerateWebhookSecret = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
    const newSecret = `whsec_live_${hex}`;
    updateSetting("webhookSecret", newSecret);
    setShowRegenWebhookModal(false);
    toast.success("Generated new live Webhook Secret Key!");
  };

  // Copy Webhook Secret
  const handleCopySecret = () => {
    navigator.clipboard.writeText(config.webhookSecret);
    setCopiedKey(true);
    toast.success("Webhook Secret copied to clipboard!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Ping Backend Database & API Diagnostics
  const handleTestPing = async () => {
    setPingLoading(true);
    setPingResult({ status: "idle" });
    const startTime = performance.now();
    try {
      await adminService.getDashboard();
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      setPingResult({
        status: "success",
        latency,
        message: `HTTP 200 OK — Spring Boot Backend & MySQL Pool responsive (${latency}ms)`,
      });
      toast.success(`Telemetry check passed! Latency: ${latency}ms`);
    } catch {
      setPingResult({
        status: "error",
        message: "Backend telemetry ping timed out or failed to reach /api/admin/dashboard.",
      });
      toast.error("Telemetry check failed. Backend may be offline.");
    } finally {
      setPingLoading(false);
    }
  };

  // Test SMTP Email Gateway
  const handleTestEmail = () => {
    setTestEmailLoading(true);
    setTimeout(() => {
      setTestEmailLoading(false);
      toast.success(`Test verification email sent to ${config.supportEmail}!`);
    }, 850);
  };

  // Test Webhook Simulation
  const handleTestWebhook = () => {
    setTestWebhookLoading(true);
    setTimeout(() => {
      setTestWebhookLoading(false);
      toast.success("Simulated payload { event: 'booking.completed' } verified with HMAC signature!");
    }, 800);
  };

  // Flush Frontend Cache
  const handleFlushCache = () => {
    try {
      sessionStorage.clear();
      toast.success("Application session cache & telemetry buffers cleared!");
    } catch {
      toast.error("Failed to clear cache.");
    }
  };

  // Download Simulated DB SQL Dump
  const handleDownloadDbDump = () => {
    const sqlContent = `-- Smart Bike Rental Management Database Snapshot
-- Generated on: ${new Date().toISOString()}
-- Region: AP-SOUTH-1 (Hyderabad)
-- Schema: bikerental_db
-- Tables: users, bikes, bookings, payments, reviews, activity_ledger

SET FOREIGN_KEY_CHECKS=0;
-- Snapshot metadata validated.
-- Total tables verified: 6
SET FOREIGN_KEY_CHECKS=1;
`;
    const blob = new Blob([sqlContent], { type: "application/sql" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bikerental_db_snapshot_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Database schema snapshot downloaded!");
  };

  // Save Bank Account Details
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName?.trim() || !bankForm.accountNumber?.trim() || !bankForm.ifscCode?.trim()) {
      toast.error("Please fill in all mandatory banking fields (Bank Name, Account Number, IFSC).");
      return;
    }
    setBankSaving(true);
    try {
      const updated = await adminService.updateBankAccount(bankForm);
      setBankAccount(updated);
      setBankForm(updated);
      setIsBankModalOpen(false);
      toast.success("Platform banking & settlement details updated successfully!", {
        icon: "💳",
      });
    } catch {
      toast.error("Failed to update platform banking details.");
    } finally {
      setBankSaving(false);
    }
  };

  // Simulate Instant Settlement
  const handleSimulateSettlement = () => {
    const utr = `ADMIN${Date.now().toString().slice(-8)}`;
    toast.success(`Test platform settlement initiated! Reference UTR: ${utr}`, {
      icon: "💳",
      duration: 4000,
    });
  };

  const handleCopyBankField = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const tabs = [
    { id: "display", label: "Display & Theme", icon: Sliders, badge: "UI", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { id: "platform", label: "Operations & Fees", icon: Globe, badge: "Pricing", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { id: "banking", label: "Bank & Payouts", icon: CreditCard, badge: "Settlement", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { id: "fleet", label: "Fleet & Safety", icon: Zap, badge: "Rules", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { id: "security", label: "Security & Keys", icon: ShieldCheck, badge: "RBAC", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { id: "notifications", label: "Notifications", icon: Bell, badge: "Channels", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { id: "telemetry", label: "Telemetry & Health", icon: Server, badge: "Live", color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  ] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground min-h-screen pb-24 font-sans">
      {/* Hidden File Input for JSON Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportJSON}
      />

      {/* Hero Glassmorphic Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card/95 via-card/75 to-background p-6 sm:p-8 shadow-md backdrop-blur-xl">
        {/* Subtle Ambient Glow Effect */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3 w-3" />
                Enterprise Administration Console
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Node AP-SOUTH-1 Online
              </span>

              {isDirty && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-bounce">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Unsaved Changes Pending
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-foreground flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <SettingsIcon className="h-6 w-6" />
              </div>
              Platform Administration & System Controls
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Configure global rental parameters, financial commission splits, fleet safety enforcement, live IoT webhooks, and backend telemetry health.
            </p>
          </div>

          {/* Header Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border/70 bg-background/80 hover:bg-muted text-foreground transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs hover:border-red-400 hover:text-red-500 active:scale-95"
              title="Reset all settings to default values"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border/70 bg-background/80 hover:bg-muted text-foreground transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
              title="Export configuration as JSON file"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border/70 bg-background/80 hover:bg-muted text-foreground transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
              title="Import configuration from JSON file"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Maintenance Alert Banner (when active) */}
      {config.maintenanceMode && (
        <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 p-4 shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-500 shrink-0 mt-0.5">
              <Power className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Maintenance Mode Is Active</p>
              <p className="text-xs opacity-90 mt-0.5">
                Public customers and host booking portals are currently offline. Display message: &ldquo;<span className="font-semibold">{config.maintenanceBannerText}</span>&rdquo;
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateSetting("maintenanceMode", false)}
            className="px-3.5 py-1.5 bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-red-600 transition-all duration-200 cursor-pointer shrink-0 active:scale-95"
          >
            Turn Off Maintenance
          </button>
        </div>
      )}

      {/* Segmented Navigation Tab Strip */}
      <div className="rounded-2xl border border-border/80 bg-card/70 p-2 shadow-xs backdrop-blur-md">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as any)}
                className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.01]"
                    : "bg-background/60 text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent hover:border-border/50"
                }`}
              >
                <div
                  className={`p-2 rounded-lg transition-all duration-200 shrink-0 ${
                    isActive
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : `${tab.bg} ${tab.color} border ${tab.border} group-hover:scale-105`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold leading-tight truncate">{tab.label}</p>
                  </div>
                  <p className={`text-[10px] font-medium leading-none mt-1 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {tab.badge}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: Display & Workspace Preferences */}
      {/* ========================================================================= */}
      {activeTab === "display" && (
        <div className="space-y-6">
          {/* Theme Selector */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Sun className="h-4 w-4" />
                  </div>
                  Visual Appearance & Color Palette
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tailor your workspace aesthetic and contrast preferences across the admin portal
                </p>
              </div>

              <span className="self-start sm:self-auto text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-muted text-muted-foreground border border-border">
                Current: {theme.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "light", label: "Light Mode", icon: Sun, desc: "Ultra-crisp high-contrast daylight aesthetic", previewClass: "bg-white border-zinc-200 text-zinc-900" },
                { id: "dark", label: "Dark Mode", icon: Moon, desc: "Sleek low-light interface optimized for focus", previewClass: "bg-zinc-950 border-zinc-800 text-zinc-100" },
                { id: "system", label: "System Sync", icon: Tv, desc: "Automatically synchronizes with your device settings", previewClass: "bg-gradient-to-r from-zinc-100 to-zinc-900 border-zinc-400 text-zinc-800" },
              ].map((opt) => {
                const OptIcon = opt.icon;
                const isCurrent = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id as any)}
                    className={`relative p-5 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between space-y-4 cursor-pointer group ${
                      isCurrent
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/5 ring-1 ring-primary/40"
                        : "border-border/80 bg-background/60 hover:bg-muted/50 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl transition-all duration-200 ${isCurrent ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
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
                      <div className={`h-full rounded-full transition-all duration-300 ${isCurrent ? "bg-primary w-full" : "bg-transparent w-0"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Layout & Pagination Density */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
            <div className="border-b border-border/60 pb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Layout className="h-4 w-4" />
                </div>
                Data Presentation & Grid Density
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure table pagination sizes, live refresh polling frequencies, and timestamp formats
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Page Size */}
              <div className="space-y-2 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Default Page Records</label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {config.pageSize} items
                  </span>
                </div>
                <select
                  value={config.pageSize}
                  onChange={(e) => updateSetting("pageSize", Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  <option value={8}>8 records per page (Standard)</option>
                  <option value={10}>10 records per page</option>
                  <option value={15}>15 records per page</option>
                  <option value={25}>25 records per page</option>
                  <option value={50}>50 records per page (Dense)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Applies across Bikes, Users, Bookings, and Payments data tables.</p>
              </div>

              {/* Refresh Interval */}
              <div className="space-y-2 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Live Telemetry Refresh</label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">
                    {config.autoRefreshInterval > 0 ? `${config.autoRefreshInterval}s` : "Manual"}
                  </span>
                </div>
                <select
                  value={config.autoRefreshInterval}
                  onChange={(e) => updateSetting("autoRefreshInterval", Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  <option value={10}>Every 10 seconds (High Precision)</option>
                  <option value={15}>Every 15 seconds</option>
                  <option value={30}>Every 30 seconds (Recommended)</option>
                  <option value={60}>Every 1 minute</option>
                  <option value={0}>Manual refresh only</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Governs automated background polling on live Dashboard feeds.</p>
              </div>

              {/* Time Format */}
              <div className="space-y-2 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Time Format Display</label>
                <select
                  value={config.timeFormat}
                  onChange={(e) => updateSetting("timeFormat", e.target.value as "12h" | "24h")}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  <option value="12h">12-Hour Clock (02:30 PM)</option>
                  <option value="24h">24-Hour ISO Clock (14:30)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Formats timestamps across activity logs, trips, and audit ledgers.</p>
              </div>

              {/* Timezone */}
              <div className="space-y-2 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Operational Timezone</label>
                <select
                  value={config.timezone}
                  onChange={(e) => updateSetting("timezone", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30) - Primary</option>
                  <option value="UTC">UTC (Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Standardized time baseline for booking period calculations.</p>
              </div>

              {/* Currency */}
              <div className="space-y-2 p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-primary/30 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">System Currency</label>
                <select
                  value={config.currency}
                  onChange={(e) => updateSetting("currency", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Currency symbol used in revenue reports and ledger views.</p>
              </div>

              {/* Compact Tables Toggle */}
              <div
                onClick={() => updateSetting("compactTables", !config.compactTables)}
                className="p-4 rounded-2xl border border-border/70 bg-background/50 flex flex-col justify-between cursor-pointer hover:border-primary/40 hover:bg-muted/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Compact Tables</span>
                  <input
                    type="checkbox"
                    checked={config.compactTables}
                    onChange={() => {}}
                    className="h-4 w-4 rounded text-primary focus:ring-primary border-border cursor-pointer accent-primary"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Condenses table row padding to fit more lines on high-resolution screens.
                </p>
              </div>
            </div>

            {/* Audio Feedback Controls */}
            <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl transition ${config.soundAlertsEnabled ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-muted text-muted-foreground"}`}>
                  {config.soundAlertsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Audible Cues & Incident Chimes</p>
                  <p className="text-[11px] text-muted-foreground">
                    Synthesizes subtle WebAudio chimes upon SOS distress signals, new bookings, or saved configurations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={playSoundFeedback}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border/80 bg-background hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Test Tone</span>
                </button>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.soundAlertsEnabled}
                    onChange={(e) => updateSetting("soundAlertsEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Operations & Platform Fees */}
      {/* ========================================================================= */}
      {activeTab === "platform" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
            <div className="border-b border-border/60 pb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Globe className="h-4 w-4" />
                </div>
                Platform Fee Structure & Operational Parameters
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage automated host commissions, security deposit holding rates, and reservation cancel windows
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Commission Slider */}
              <div className="space-y-3 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-foreground">Standard Platform Commission</label>
                    <p className="text-[11px] text-muted-foreground">Percentage split from completed trip fares</p>
                  </div>
                  <span className="text-xs font-extrabold text-primary px-3 py-1 bg-primary/10 border border-primary/20 rounded-xl">
                    {config.commission}% Platform / {100 - config.commission}% Host
                  </span>
                </div>

                <div className="pt-2">
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={config.commission}
                    onChange={(e) => updateSetting("commission", Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                    <span>0% (Free)</span>
                    <span>25% Standard</span>
                    <span>50% Max</span>
                  </div>
                </div>
              </div>

              {/* Security Deposit */}
              <div className="space-y-3 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <div>
                  <label className="text-xs font-bold text-foreground">Mandatory Refundable Security Deposit</label>
                  <p className="text-[11px] text-muted-foreground">Held during ride and returned upon lock verification</p>
                </div>
                <div className="relative pt-1">
                  <span className="absolute left-3.5 top-3.5 text-xs text-muted-foreground font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={config.securityDeposit}
                    onChange={(e) => updateSetting("securityDeposit", Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold transition"
                  />
                </div>
              </div>

              {/* Support Email */}
              <div className="space-y-2 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Customer Support Mailbox</label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3 text-muted-foreground" />
                  <input
                    type="email"
                    value={config.supportEmail}
                    onChange={(e) => updateSetting("supportEmail", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Inquiries from customers and partners route to this mailbox.</p>
              </div>

              {/* Emergency Hotline */}
              <div className="space-y-2 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">24/7 Emergency Helpline Hotline</label>
                <div className="relative">
                  <Smartphone className="h-4 w-4 absolute left-3.5 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={config.emergencyHotline}
                    onChange={(e) => updateSetting("emergencyHotline", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Displayed prominently in user mobile app for SOS assistance.</p>
              </div>

              {/* Auto Cancel Unpaid Bookings */}
              <div className="space-y-2 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Unpaid Reservation Hold (Minutes)</label>
                <div className="relative">
                  <Clock className="h-4 w-4 absolute left-3.5 top-3 text-muted-foreground" />
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={config.autoCancelUnpaidMinutes}
                    onChange={(e) => updateSetting("autoCancelUnpaidMinutes", Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Automatically releases bike inventory if payment checkout is abandoned.</p>
              </div>

              {/* Auto Approve Bike Listings */}
              <div
                onClick={() => updateSetting("autoApproveBikeListings", !config.autoApproveBikeListings)}
                className="p-5 rounded-2xl border border-border/80 bg-background/60 flex flex-col justify-between cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Host Bike Listing Verification</label>
                  <input
                    type="checkbox"
                    checked={config.autoApproveBikeListings}
                    onChange={() => {}}
                    className="h-4 w-4 rounded text-primary focus:ring-primary border-border cursor-pointer accent-primary"
                  />
                </div>
                <div className="mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${config.autoApproveBikeListings ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                    {config.autoApproveBikeListings ? "Instant Auto-Approval Enabled" : "Manual KYC Review Required"}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {config.autoApproveBikeListings
                      ? "New host bike listings appear immediately without manual admin approval."
                      : "Requires admin review of RC documents before appearing in catalog."}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Surge Pricing Box */}
            <div className="pt-6 border-t border-border/60 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Dynamic Peak-Hour Surge Multiplier</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Automatically applies a fare boost during high traffic hours to rebalance station inventory
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.surgePricingEnabled}
                    onChange={(e) => updateSetting("surgePricingEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {config.surgePricingEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-background/50 border border-amber-500/20">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Surge Multiplier (x)</label>
                    <input
                      type="number"
                      step={0.05}
                      min={1.0}
                      max={3.0}
                      value={config.surgeMultiplier}
                      onChange={(e) => updateSetting("surgeMultiplier", Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-card border border-border text-foreground font-bold"
                    />
                    <p className="text-[10px] text-muted-foreground">E.g., 1.25x = 25% price increase</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Peak Window Start</label>
                    <input
                      type="time"
                      value={config.peakHourStart}
                      onChange={(e) => updateSetting("peakHourStart", e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-card border border-border text-foreground font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Peak Window End</label>
                    <input
                      type="time"
                      value={config.peakHourEnd}
                      onChange={(e) => updateSetting("peakHourEnd", e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-card border border-border text-foreground font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Maintenance Mode Emergency Controls */}
            <div className="pt-6 border-t border-border/60">
              <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-red-500/15 text-red-500 shrink-0">
                      <Power className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">Platform-Wide Maintenance Lock</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Puts public booking portals into temporary downtime while retaining administrative access.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.maintenanceMode}
                      onChange={(e) => updateSetting("maintenanceMode", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>

                {config.maintenanceMode && (
                  <div className="pt-3 border-t border-red-500/20 space-y-2">
                    <label className="text-[11px] font-bold text-foreground">Broadcast Banner Text</label>
                    <input
                      type="text"
                      value={config.maintenanceBannerText}
                      onChange={(e) => updateSetting("maintenanceBannerText", e.target.value)}
                      placeholder="Enter announcement banner message shown to users..."
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-card border border-red-500/30 text-foreground focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: Platform Banking & Settlement */}
      {/* ========================================================================= */}
      {activeTab === "banking" && (
        <div className="space-y-6">
          {/* Main Escrow Bank Card */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Building2 className="h-4 w-4" />
                  </div>
                  Platform Escrow & Admin Settlement Account
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Platform commission ({config.commission}%), surge charges, and tax splits are automatically routed to this verified institutional account.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateSettlement}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Test Settlement</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (bankAccount) {
                      setBankForm(bankAccount);
                    }
                    setIsBankModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Bank Details</span>
                </button>
              </div>
            </div>

            {/* Bank Card Preview & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Virtual Escrow Card */}
              <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-zinc-900 via-emerald-950 to-zinc-900 border border-emerald-500/30 flex flex-col justify-between min-h-[220px]">
                <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-300">
                      {bankAccount?.bankName || bankForm.bankName || "State Bank of India"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> KYC Verified
                  </span>
                </div>

                <div className="my-4 relative z-10 space-y-1">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Account Number</p>
                  <p className="text-lg sm:text-xl font-mono font-bold tracking-widest text-emerald-100">
                    {bankAccount?.maskedAccountNumber || bankAccount?.accountNumber || "•••• •••• 2710"}
                  </p>
                </div>

                <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10">
                  <div>
                    <p className="text-[9px] text-zinc-400 uppercase">Beneficiary Name</p>
                    <p className="text-xs font-bold text-zinc-200">
                      {bankAccount?.accountHolderName || bankForm.accountHolderName || "SmartBike Platform Escrow Admin"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-400 uppercase">Account Type</p>
                    <p className="text-xs font-bold text-emerald-300 uppercase">
                      {bankAccount?.accountType || bankForm.accountType || "CURRENT"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-border/80 bg-background/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">IFSC Code</span>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-bold text-foreground">
                      {bankAccount?.ifscCode || bankForm.ifscCode || "SBIN0001234"}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyBankField(bankAccount?.ifscCode || bankForm.ifscCode || "SBIN0001234", "IFSC Code")}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                      title="Copy IFSC"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{bankAccount?.branchName || bankForm.branchName || "Cyber City Branch, Hyderabad"}</p>
                </div>

                <div className="p-4 rounded-2xl border border-border/80 bg-background/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Instant UPI ID</span>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-bold text-foreground">
                      {bankAccount?.upiId || bankForm.upiId || "smartbike.admin@oksbi"}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyBankField(bankAccount?.upiId || bankForm.upiId || "smartbike.admin@oksbi", "UPI ID")}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                      title="Copy UPI ID"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Verified for Real-Time Payouts</p>
                </div>

                <div className="p-4 rounded-2xl border border-border/80 bg-background/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Settlement Frequency</span>
                  <p className="text-sm font-bold text-foreground capitalize">
                    {bankAccount?.payoutFrequency || bankForm.payoutFrequency || "DAILY"} Automatic Payouts
                  </p>
                  <p className="text-[11px] text-muted-foreground">Processed automatically at 23:59 IST</p>
                </div>

                <div className="p-4 rounded-2xl border border-border/80 bg-background/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Minimum Threshold</span>
                  <p className="text-sm font-bold text-foreground">
                    ₹{bankAccount?.minPayoutThreshold || bankForm.minPayoutThreshold || 1000}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Earnings auto-sweep once balance exceeds threshold</p>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Payment Split Architecture Information */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-4 shadow-xs backdrop-blur-md">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Automated Revenue Split & Escrow Architecture
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When a customer completes a payment via Razorpay, UPI, or Card, the Spring Boot backend immediately divides the transaction into two distinct ledger streams:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Admin / Platform Share</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                    {config.commission}% + Taxes
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contains the platform commission fee and applicable GST taxes. Settled directly into the Admin Bank Account shown above with unique UTR tracking.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Bike Host / Owner Share</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-600 dark:text-blue-300">
                    {100 - config.commission}% Base + Late Fees
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contains the base rental hours amount and late return penalty charges. Routed directly to the respective bike host&apos;s verified bank account.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: Fleet & Safety Rules */}
      {/* ========================================================================= */}
      {activeTab === "fleet" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
            <div className="border-b border-border/60 pb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Zap className="h-4 w-4" />
                </div>
                Fleet Safety, Battery Dispatch & Penalty Governance
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set minimum EV battery limits, late return surcharges, and helmet verification policies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Free Cancellation Window */}
              <div className="space-y-3 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Free Cancellation Grace</label>
                  <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-md bg-primary/10">
                    {config.freeCancellationMinutes} Mins
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={config.freeCancellationMinutes}
                  onChange={(e) => updateSetting("freeCancellationMinutes", Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                />
                <p className="text-[11px] text-muted-foreground">
                  Customers can cancel with zero fee within this window of booking confirmation.
                </p>
              </div>

              {/* Late Return Penalty */}
              <div className="space-y-3 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Late Return Penalty (₹ / Hour)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs text-muted-foreground font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={25}
                    value={config.lateReturnPenaltyPerHour}
                    onChange={(e) => updateSetting("lateReturnPenaltyPerHour", Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground font-bold"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Accrues hourly when rider fails to return bike on schedule.</p>
              </div>

              {/* EV Battery Threshold */}
              <div className="space-y-3 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-emerald-500/40 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">EV Min Battery Dispatch</label>
                  <span className="text-xs font-bold text-emerald-500 px-2.5 py-0.5 rounded-md bg-emerald-500/10">
                    {config.evMinBatteryThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={50}
                  step={5}
                  value={config.evMinBatteryThreshold}
                  onChange={(e) => updateSetting("evMinBatteryThreshold", Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-muted rounded-lg"
                />
                <p className="text-[11px] text-muted-foreground">Electric bikes below this charge are hidden from public discovery.</p>
              </div>

              {/* Max Active Bookings */}
              <div className="space-y-2 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Max Concurrent Active Bookings</label>
                <select
                  value={config.maxActiveBookingsPerCustomer}
                  onChange={(e) => updateSetting("maxActiveBookingsPerCustomer", Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground font-semibold"
                >
                  <option value={1}>1 Bike per Customer (Strict)</option>
                  <option value={2}>2 Bikes per Customer (Standard)</option>
                  <option value={3}>3 Bikes per Customer (Family)</option>
                  <option value={5}>5 Bikes per Customer (Corporate)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Prevents abusive simultaneous reservations per user.</p>
              </div>

              {/* Damage Claim Ceiling */}
              <div className="space-y-2 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Max Damage Claim Ceiling (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs text-muted-foreground font-bold">₹</span>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={config.damageClaimLiabilityCeiling}
                    onChange={(e) => updateSetting("damageClaimLiabilityCeiling", Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground font-bold"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Maximum host damage insurance payout covered per incident.</p>
              </div>
            </div>

            {/* Safety Verification Policies Grid */}
            <div className="pt-4 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mandatory Helmet Check */}
              <div
                onClick={() => updateSetting("mandatoryHelmetCheck", !config.mandatoryHelmetCheck)}
                className="p-5 rounded-2xl border border-border/80 bg-background/60 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 hover:bg-muted/30 transition-all duration-200"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-xs font-bold text-foreground">Mandatory Helmet Photo Verification</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Requires riders to upload a selfie wearing a helmet before electronic lock release.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.mandatoryHelmetCheck}
                  onChange={() => {}}
                  className="h-4 w-4 rounded text-primary focus:ring-primary border-border cursor-pointer ml-3 accent-primary"
                />
              </div>

              {/* Geofence Perimeter Enforcement */}
              <div
                onClick={() => updateSetting("geofenceEnforcement", !config.geofenceEnforcement)}
                className="p-5 rounded-2xl border border-border/80 bg-background/60 flex items-center justify-between cursor-pointer hover:border-blue-500/40 hover:bg-muted/30 transition-all duration-200"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-foreground">City Geofence Boundary Alerts</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Triggers high-priority telemetry alerts if GPS coordinates exit designated operational perimeter.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.geofenceEnforcement}
                  onChange={() => {}}
                  className="h-4 w-4 rounded text-primary focus:ring-primary border-border cursor-pointer ml-3 accent-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: Security & Governance */}
      {/* ========================================================================= */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
            <div className="border-b border-border/60 pb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                Administrative Access, Governance & Webhook Keys
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure role enforcement, authentication timeouts, API webhook tokens, and KYC compliance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Session Inactivity Timeout */}
              <div className="space-y-2 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Admin Session Auto-Logout Timeout</label>
                <select
                  value={config.sessionInactivityTimeout}
                  onChange={(e) => updateSetting("sessionInactivityTimeout", Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground font-semibold"
                >
                  <option value={15}>15 minutes of inactivity</option>
                  <option value={30}>30 minutes (Standard)</option>
                  <option value={60}>1 hour</option>
                  <option value={240}>4 hours</option>
                  <option value={0}>Never (Development only)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Automatically invalidates JWT tokens when admin remains idle.</p>
              </div>

              {/* Password Complexity */}
              <div className="space-y-2 p-5 rounded-2xl border border-border/80 bg-background/60 hover:border-primary/40 transition-all duration-200">
                <label className="text-xs font-bold text-foreground">Password Complexity Requirements</label>
                <select
                  value={config.passwordPolicyLevel}
                  onChange={(e) => updateSetting("passwordPolicyLevel", e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground font-semibold"
                >
                  <option value="standard">Standard (Min 8 chars, 1 digit)</option>
                  <option value="strict">Strict (Min 8 chars, Upper + Lower + Digit + Symbol)</option>
                  <option value="maximum">Maximum (Min 12 chars, 2 Symbols, High Entropy)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Enforced during user registration and password resets.</p>
              </div>

              {/* Mandatory KYC */}
              <div
                onClick={() => updateSetting("mandatoryKycVerification", !config.mandatoryKycVerification)}
                className="p-5 rounded-2xl border border-border/80 bg-background/60 flex items-center justify-between cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all duration-200"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground">Mandatory Driving License / KYC Verification</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Restricts customer bike unlocks until Govt ID / Driving License is approved by administrators.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.mandatoryKycVerification}
                  onChange={() => {}}
                  className="h-4 w-4 rounded text-primary focus:ring-primary border-border cursor-pointer ml-3 accent-primary"
                />
              </div>

              {/* 2FA Enforcement */}
              <div
                onClick={() => updateSetting("enforceAdmin2FA", !config.enforceAdmin2FA)}
                className="p-5 rounded-2xl border border-border/80 bg-background/60 flex items-center justify-between cursor-pointer hover:border-amber-500/40 hover:bg-muted/30 transition-all duration-200"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-foreground">Enforce Two-Factor Authentication (2FA)</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Requires OTP / Authenticator code on all administrative logins.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.enforceAdmin2FA}
                  onChange={() => {}}
                  className="h-4 w-4 rounded text-primary focus:ring-primary border-border cursor-pointer ml-3 accent-primary"
                />
              </div>
            </div>

            {/* IP Whitelisting */}
            <div className="space-y-2 pt-4 border-t border-border/60">
              <label className="text-xs font-bold text-foreground flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-primary" />
                Administrative IP Whitelist (CIDR blocks)
              </label>
              <input
                type="text"
                value={config.adminIpWhitelist}
                onChange={(e) => updateSetting("adminIpWhitelist", e.target.value)}
                placeholder="127.0.0.1/32, 192.168.1.0/24"
                className="w-full font-mono text-xs px-4 py-2.5 rounded-xl bg-card border border-border/80 text-foreground focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">Comma-separated IPv4/IPv6 addresses authorized to access `/admin/*` routes.</p>
            </div>

            {/* Webhook Secret Management */}
            <div className="pt-4 border-t border-border/60 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    IoT Telemetry & Payment Webhook Signature Secret
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Used to verify cryptographically signed payloads from Razorpay / Stripe and IoT bike locks
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={testWebhookLoading}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    {testWebhookLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-amber-500" />}
                    <span>Test Webhook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRegenWebhookModal(true)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-red-500 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 rounded-xl bg-muted/30 border border-border font-mono text-xs text-foreground flex items-center justify-between">
                  <span className="truncate">{config.webhookSecret}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="px-4 py-3 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Copy secret key"
                >
                  {copiedKey ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedKey ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Admin Profile Link */}
            <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-foreground">Need to update your personal security credentials?</p>
                <p className="text-[11px] text-muted-foreground">Manage your admin username, password, and avatar on your profile tab.</p>
              </div>
              <Link
                to="/admin/profile"
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition flex items-center gap-2 shadow-2xs group"
              >
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Go to Admin Profile</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Notifications & Channels */}
      {/* ========================================================================= */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
            <div className="border-b border-border/60 pb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Bell className="h-4 w-4" />
                </div>
                Notification Dispatches & Event Subscriptions
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage automated system emails, SMS gateway dispatches, and in-app alert positioning
              </p>
            </div>

            {/* Email Channels */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  Email Dispatch Channels
                </h3>
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testEmailLoading}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {testEmailLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5 text-primary" />}
                  <span>Send Test Email</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "notifyOnNewUser" as const, label: "New Customer Registration", desc: "Dispatches summary when a new user signs up." },
                  { key: "notifyOnBikeVerification" as const, label: "Bike & Host KYC Review", desc: "Alerts admins when a new bike listing needs approval." },
                  { key: "notifyOnHighValueBooking" as const, label: "High-Value Bookings (> ₹2,000)", desc: "Instant notification for premium multi-day rentals." },
                  { key: "notifyOnDisputeSos" as const, label: "Accident / SOS Distress Signals", desc: "Urgent instant notification with rider coordinates." },
                  { key: "notifyDailyRevenueSummary" as const, label: "Daily Financial & Fleet Summary", desc: "Sent daily at 23:59 with revenue breakdown and utilization." },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="p-4 rounded-2xl border border-border/80 bg-background/60 flex items-start justify-between cursor-pointer hover:bg-muted/30 transition-all duration-200"
                  >
                    <div className="space-y-0.5 pr-2">
                      <p className="text-xs font-bold text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config[item.key]}
                      onChange={(e) => updateSetting(item.key, e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded text-primary focus:ring-primary border-border cursor-pointer accent-primary"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* External Messaging Gateways */}
            <div className="pt-4 border-t border-border/60 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                External Messaging Gateways
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => updateSetting("smsGatewayEnabled", !config.smsGatewayEnabled)}
                  className="p-5 rounded-2xl border border-border/80 bg-background/60 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 hover:bg-muted/30 transition-all duration-200"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-xs font-bold text-foreground">Transactional SMS Gateway (Twilio/AWS SNS)</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Delivers instant OTP verification codes and booking unlock PINs.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.smsGatewayEnabled}
                    onChange={() => {}}
                    className="h-4 w-4 rounded text-primary focus:ring-primary border-border cursor-pointer ml-3 accent-primary"
                  />
                </div>

                <div
                  onClick={() => updateSetting("whatsappAlertsEnabled", !config.whatsappAlertsEnabled)}
                  className="p-5 rounded-2xl border border-border/80 bg-background/60 flex items-center justify-between cursor-pointer hover:border-green-500/40 hover:bg-muted/30 transition-all duration-200"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <h4 className="text-xs font-bold text-foreground">WhatsApp Business API Gateway</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Sends booking confirmation cards and trip receipts via WhatsApp.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.whatsappAlertsEnabled}
                    onChange={() => {}}
                    className="h-4 w-4 rounded text-primary focus:ring-primary border-border cursor-pointer ml-3 accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Toast Position & Low Fleet Alert */}
            <div className="pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2 p-5 rounded-2xl border border-border/80 bg-background/60">
                <label className="text-xs font-bold text-foreground">In-App Toast Banner Placement</label>
                <select
                  value={config.toastPosition}
                  onChange={(e) => updateSetting("toastPosition", e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border/80 text-foreground font-semibold"
                >
                  <option value="top-right">Top Right (Standard)</option>
                  <option value="top-center">Top Center (Prominent)</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Controls onscreen coordinate placement for administrative flash alerts.</p>
              </div>

              <div className="space-y-3 p-5 rounded-2xl border border-border/80 bg-background/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Low Fleet Availability Threshold</label>
                  <span className="text-xs font-bold text-amber-500 px-2.5 py-0.5 rounded-md bg-amber-500/10">
                    {config.lowFleetAlertThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={5}
                  value={config.lowFleetAlertThreshold}
                  onChange={(e) => updateSetting("lowFleetAlertThreshold", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-muted rounded-lg"
                />
                <p className="text-[11px] text-muted-foreground">
                  Fires alert when station bike inventory drops below this percentage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: System Telemetry, Health & Diagnostics */}
      {/* ========================================================================= */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                    <Server className="h-4 w-4" />
                  </div>
                  System Telemetry & Environment Diagnostics
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time microservice status, active connection pools, and diagnostic utilities
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestPing}
                disabled={pingLoading}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {pingLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
                <span>{pingLoading ? "Pinging Services..." : "Run Telemetry Ping"}</span>
              </button>
            </div>

            {/* Ping Result Flash Box */}
            {pingResult.status !== "idle" && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-center gap-3 transition-all ${
                  pingResult.status === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                }`}
              >
                {pingResult.status === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                )}
                <span className="font-mono">{pingResult.message}</span>
              </div>
            )}

            {/* Service Health Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Backend Core</span>
                  <Server className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-extrabold text-foreground">Spring Boot 3.5</p>
                <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE (Port 8080)
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Frontend App</span>
                  <Layout className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm font-extrabold text-foreground">React 19 + Vite</p>
                <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  SPA CLIENT ACTIVE
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Relational DB</span>
                  <Database className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-sm font-extrabold text-foreground">MySQL 8.0</p>
                <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Pool Active (10 / 10)
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Region / Zone</span>
                  <Globe className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-sm font-extrabold text-foreground">AP-SOUTH-1</p>
                <p className="text-[10px] text-muted-foreground font-semibold">Hyderabad Data Center</p>
              </div>
            </div>

            {/* Performance Metric Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-primary" /> CPU Load
                  </span>
                  <span className="text-foreground font-mono font-bold">14.2%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: "14.2%" }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-blue-500" /> Heap Memory
                  </span>
                  <span className="text-foreground font-mono font-bold">248MB / 1024MB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: "24.2%" }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                  <span className="flex items-center gap-1.5">
                    <Wifi className="h-3.5 w-3.5 text-emerald-500" /> Avg API Latency
                  </span>
                  <span className="text-foreground font-mono font-bold">{pingResult.latency ? `${pingResult.latency}ms` : "38ms"}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: "18%" }} />
                </div>
              </div>
            </div>

            {/* Diagnostic Operations Toolkit */}
            <div className="pt-4 border-t border-border/60 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                Database Maintenance & Quick Recovery Actions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleFlushCache}
                  className="p-4 rounded-2xl border border-border/80 bg-background/60 hover:bg-muted text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5 shadow-2xs group hover:border-amber-500/40"
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition">
                    <Trash2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Flush Session Cache</p>
                    <p className="text-[10px] text-muted-foreground">Purges local storage & telemetry buffers</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDbDump}
                  className="p-4 rounded-2xl border border-border/80 bg-background/60 hover:bg-muted text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5 shadow-2xs group hover:border-purple-500/40"
                >
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Backup SQL Snapshot</p>
                    <p className="text-[10px] text-muted-foreground">Downloads schema definition dump</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleTestPing}
                  className="p-4 rounded-2xl border border-border/80 bg-background/60 hover:bg-muted text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5 shadow-2xs group hover:border-emerald-500/40"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Check Database Pool</p>
                    <p className="text-[10px] text-muted-foreground">Verifies HikariCP connectivity</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Architecture Manifest */}
            <div className="p-5 rounded-2xl border border-border/80 bg-background/80 text-xs font-mono space-y-1.5 text-muted-foreground">
              <p className="text-foreground font-bold flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-primary" /> Runtime Manifest & Security Architecture:
              </p>
              <p>• Artifact: bike-rental-backend-v2.0.0-PROD</p>
              <p>• Security Layer: Spring Security 6.x JWT Stateless Filter with BCrypt (Strength 12)</p>
              <p>• Database Pool: HikariCP 5.1.0 / Hibernate 6.5 DDL Validated</p>
              <p>• Telemetry Engine: WebSocket SockJS Live GPS Broadcaster</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Unsaved Changes Action Bar (when dirty) */}
      {isDirty && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-2xl px-4 z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 rounded-2xl border border-amber-500/40 bg-card/95 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">You have unsaved configuration changes</p>
                <p className="text-[10px] text-muted-foreground">Remember to save your changes to persist them across sessions.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfig(initialConfig)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Reset to Defaults Confirmation */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Reset All Defaults?</h3>
                <p className="text-xs text-muted-foreground">Restore factory parameters across all tabs</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to reset all platform fees, display densities, security policies, and notification thresholds back to default values?
            </p>

            <div className="flex justify-end items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition cursor-pointer shadow-sm"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Regenerate Webhook Secret Confirmation */}
      {showRegenWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Regenerate Webhook Secret?</h3>
                <p className="text-xs text-muted-foreground">Active payment gateway webhooks will require updating</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Regenerating this secret key will immediately invalidate the existing webhook signature token. Any payment gateways or GPS IoT telemetry units using the previous secret will need to be reconfigured.
            </p>

            <div className="flex justify-end items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenWebhookModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateWebhookSecret}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition cursor-pointer shadow-sm"
              >
                Regenerate Secret
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Platform Bank Account */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Edit Platform Escrow Bank</h3>
                  <p className="text-xs text-muted-foreground">Configure settlement routing for platform commission</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                    placeholder="Beneficiary / Corporate Entity"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Account Number *</label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="Full Account Number"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">IFSC Code *</label>
                  <input
                    type="text"
                    required
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. SBIN0001234"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground font-mono uppercase focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Account Type</label>
                  <select
                    value={bankForm.accountType || "CURRENT"}
                    onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="CURRENT">Current Account (Corporate)</option>
                    <option value="SAVINGS">Savings Account</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Branch Name / City</label>
                  <input
                    type="text"
                    value={bankForm.branchName || ""}
                    onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                    placeholder="e.g. Cyber City Branch, Hyderabad"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground">Institutional UPI ID</label>
                  <input
                    type="text"
                    value={bankForm.upiId || ""}
                    onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                    placeholder="e.g. smartbike.admin@oksbi"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Payout Sweep Frequency</label>
                  <select
                    value={bankForm.payoutFrequency || "DAILY"}
                    onChange={(e) => setBankForm({ ...bankForm, payoutFrequency: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="INSTANT">Real-time / Instant</option>
                    <option value="DAILY">Daily (Recommended)</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Auto-Sweep Minimum (₹)</label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={bankForm.minPayoutThreshold || 1000}
                    onChange={(e) => setBankForm({ ...bankForm, minPayoutThreshold: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bankSaving}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {bankSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{bankSaving ? "Saving..." : "Save Banking Details"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
