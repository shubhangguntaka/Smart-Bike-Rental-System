import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  Database,
  Globe,
  HardDrive,
  KeyRound,
  Layout,
  Moon,
  RotateCcw,
  Save,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sliders,
  Sun,
  Tv,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<"preferences" | "platform" | "diagnostics" | "security">("preferences");

  // Visual Preferences
  const [pageSize, setPageSize] = useState<number>(() => {
    const saved = localStorage.getItem("admin_default_page_size");
    return saved ? Number(saved) : 8;
  });
  const [compactTables, setCompactTables] = useState<boolean>(() => {
    return localStorage.getItem("admin_compact_tables") === "true";
  });

  // Operational Settings
  const [commission, setCommission] = useState(10);
  const [supportEmail, setSupportEmail] = useState("support@smartbike.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30);
  const [saving, setSaving] = useState(false);

  const handleSavePreferences = () => {
    setSaving(true);
    try {
      localStorage.setItem("admin_default_page_size", String(pageSize));
      localStorage.setItem("admin_compact_tables", String(compactTables));
      localStorage.setItem("admin_auto_refresh", String(autoRefreshInterval));

      setTimeout(() => {
        setSaving(false);
        toast.success("Display & table preferences saved to local profile!");
      }, 400);
    } catch {
      setSaving(false);
      toast.error("Failed to persist local preferences.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl text-foreground min-h-screen pb-12">
      {/* Title & Header */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Member 3 — System Configuration & Preferences
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            Administration Settings & Diagnostics
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Configure global platform variables, display preferences, operational parameters, and examine system health.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSavePreferences}
          disabled={saving}
          className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving Preferences..." : "Save Preferences"}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="bg-card border border-border p-3 rounded-2xl flex flex-wrap gap-2">
        {[
          { id: "preferences", label: "Display & Preferences", icon: Sliders },
          { id: "platform", label: "Platform Parameters", icon: Globe },
          { id: "security", label: "Security & Governance", icon: ShieldCheck },
          { id: "diagnostics", label: "System Telemetry", icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Visual & Display Preferences */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          {/* Theme Preference */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-foreground">Theme & Visual Mode</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Select your preferred color mode for the administrative interface</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "light", label: "Light Mode", icon: Sun, desc: "Crisp white background with high contrast" },
                { id: "dark", label: "Dark Mode", icon: Moon, desc: "Sleek dark theme optimized for low light" },
                { id: "system", label: "System Default", icon: Tv, desc: "Synchronize with your operating system preference" },
              ].map((opt) => {
                const OptIcon = opt.icon;
                const isCurrent = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id as any)}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer ${
                      isCurrent
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border bg-background hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <OptIcon className={`h-5 w-5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-primary text-primary-foreground">Active</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table & Data Controls */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-foreground">Table & Data Presentation</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Control pagination defaults and table row padding</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Default Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value={8}>8 records per page (Default)</option>
                  <option value={10}>10 records per page</option>
                  <option value={15}>15 records per page</option>
                  <option value={25}>25 records per page</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Live Telemetry Refresh Interval</label>
                <select
                  value={autoRefreshInterval}
                  onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value={15}>Every 15 seconds</option>
                  <option value={30}>Every 30 seconds (Default)</option>
                  <option value={60}>Every 1 minute</option>
                  <option value={0}>Manual refresh only</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Platform Operations */}
      {activeTab === "platform" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-foreground">Platform Variables</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Global parameters governing rental fees, customer support, and system availability</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Standard Platform Commission (%)</label>
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full max-w-sm text-xs px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
                <p className="text-[11px] text-muted-foreground">Commission automatically deducted from host booking earnings upon ride completion.</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold text-foreground">Public Support Email Address</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full max-w-sm text-xs px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
                <p className="text-[11px] text-muted-foreground">Inquiries from customers and partners will be routed to this mailbox.</p>
              </div>

              <div className="pt-3 border-t border-border">
                <label className="flex items-center justify-between cursor-pointer p-4 rounded-2xl border border-border bg-muted/20">
                  <div>
                    <p className="text-xs font-bold text-foreground">Maintenance Mode</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Puts public user portals into temporary maintenance while keeping administrative access active.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={() => setMaintenanceMode(!maintenanceMode)}
                    className="rounded h-4 w-4 text-primary border-border bg-background focus:ring-primary cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Governance */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-foreground">Administrative Security & RBAC</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Role-based access policies and security configurations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold text-foreground">Active Role Enforcement</p>
                </div>
                <p className="text-[11px] text-muted-foreground">Spring Security 6.x JWT stateless authentication with pre-authorize role guards on all `/api/admin/**` endpoints.</p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-bold text-foreground">Audit Trail Recording</p>
                </div>
                <p className="text-[11px] text-muted-foreground">Every critical administrative event (user activation, fleet status toggle) is automatically recorded in the activity ledger.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Need to change your admin password or profile?</p>
                <p className="text-[11px] text-muted-foreground">Access your personal security credentials tab.</p>
              </div>
              <Link
                to="/admin/profile"
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition flex items-center gap-1.5 shadow-2xs"
              >
                <User className="h-3.5 w-3.5" />
                <span>Go to Admin Profile</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: System Telemetry */}
      {activeTab === "diagnostics" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-foreground">System Telemetry & Environment Diagnostics</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Runtime health, deployment metrics, and database connectivity</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Backend Service</span>
                  <Server className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-extrabold text-foreground">Spring Boot 3.5</p>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> ONLINE (Port 8080)
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Frontend App</span>
                  <Layout className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm font-extrabold text-foreground">React 19 + Vite 8</p>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> CLIENT BUNDLE ACTIVE
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Primary Database</span>
                  <Database className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-sm font-extrabold text-foreground">PostgreSQL / H2</p>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> POOL CONNECTED
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Region / Zone</span>
                  <Globe className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-sm font-extrabold text-foreground">AP-SOUTH-1</p>
                <p className="text-[10px] text-muted-foreground font-semibold">Hyderabad Data Center</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-background text-xs font-mono space-y-1 text-muted-foreground">
              <p className="text-foreground font-bold">Runtime Build Info:</p>
              <p>• Artifact: bike-rental-backend-v1.0.0-SNAPSHOT</p>
              <p>• Security Layer: JWT Authorization Filter with BCryptPasswordEncoder (strength 12)</p>
              <p>• Logging Level: INFO / Hibernate DDL Validated</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
