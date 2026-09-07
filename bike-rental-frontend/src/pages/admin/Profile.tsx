import React, { useState, useEffect, useMemo } from "react";
import useAuth from "@/hooks/useAuth";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { updateProfile, changePassword } from "@/services/userService";
import adminService from "@/services/adminService";
import type { AdminActivity } from "@/types/admin";
import toast from "react-hot-toast";

type ProfileTab = "PROFILE" | "SECURITY" | "PERMISSIONS" | "ACTIVITY";

export default function AdminProfile() {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>("PROFILE");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Show/Hide password toggles
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Recent activity logs
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
    department: "Executive Operations",
    bio: "Principal Platform SuperAdmin with unrestricted governance privileges.",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setActivityLoading(true);
        const data = await adminService.getActivity();
        if (Array.isArray(data)) {
          // Filter activities performed by current user or show top admin logs
          setActivities(data.slice(0, 8));
        }
      } catch {
        // ignore
      } finally {
        setActivityLoading(false);
      }
    };

    void fetchActivities();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshUser();
      const data = await adminService.getActivity().catch(() => []);
      if (Array.isArray(data)) setActivities(data.slice(0, 8));
      toast.success("Administrator profile & credentials reloaded.");
    } catch {
      toast.error("Failed to reload profile.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyId = () => {
    const id = user?.id ? String(user.id) : "ADM-001";
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success(`Admin ID #${id} copied to clipboard!`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const p = passwordForm.newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score += 25;
    if (p.length >= 12) score += 25;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 25;
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score += 25;
    return score;
  }, [passwordForm.newPassword]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!profileForm.phoneNumber.trim()) {
      toast.error("Phone Number is required");
      return;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(profileForm.phoneNumber)) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return;
    }

    try {
      setProfileLoading(true);
      await updateProfile({
        fullName: profileForm.fullName.trim(),
        phoneNumber: profileForm.phoneNumber.trim(),
      });
      await refreshUser();
      toast.success("Administrator profile updated successfully!");
    } catch (error: any) {
      const response = error.response?.data;
      toast.error(response?.message || "Failed to update admin profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.oldPassword.trim()) {
      toast.error("Current Password is required");
      return;
    }
    if (!passwordForm.newPassword.trim()) {
      toast.error("New Password is required");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New Password must be at least 8 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New Password and Confirm Password do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Administrator password changed successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      const response = error.response?.data;
      toast.error(response?.message || "Failed to change password. Please verify current password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const permissionsList = [
    {
      title: "Global Fleet Management",
      desc: "Register, modify, decommission bikes, pricing rates, and track live GPS coordinates.",
      level: "SUPERADMIN",
      badge: "FULL ACCESS",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Financial Ledger & Settlements",
      desc: "Inspect payments, process refund reversals, configure commission splits, and export CSV/PDF ledgers.",
      level: "SUPERADMIN",
      badge: "FULL ACCESS",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "User & Host Governance",
      desc: "Activate/block users, review verification documents, approve host KYC, and manage partner accounts.",
      level: "SUPERADMIN",
      badge: "FULL ACCESS",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "System Telemetry & Health Audit",
      desc: "Perform live server diagnostics, test webhooks, inspect error rates, and manage emergency maintenance locks.",
      level: "SUPERADMIN",
      badge: "FULL ACCESS",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Security & Access Credentials",
      desc: "Rotate master webhook keys, review audit trails, and manage high-privilege administrative identities.",
      level: "SUPERADMIN",
      badge: "FULL ACCESS",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground min-h-screen pb-16 font-sans">
      {/* Hero Profile Overview Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-border/60 pb-6">
          <div className="relative group">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-primary/20 via-primary/10 to-background text-primary font-black text-3xl border border-primary/30 shadow-md shrink-0 ring-4 ring-primary/10">
              {user?.fullName ? user.fullName[0].toUpperCase() : "A"}
            </div>
            <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-card ring-2 ring-emerald-500/20" title="Online Session" />
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {user?.fullName || "System Administrator"}
              </h2>

              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary uppercase tracking-wider border border-primary/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                {user?.role || "ADMIN"} PRIVILEGES
              </span>

              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                VERIFIED ACTIVE
              </span>
            </div>

            <p className="text-xs text-muted-foreground font-medium max-w-2xl">
              {profileForm.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-mono font-bold bg-muted/40 hover:bg-muted text-foreground border border-border/80 transition cursor-pointer"
              >
                {copiedId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                <span>ID: #{user?.id || "ADM-001"}</span>
              </button>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>Region: AP-SOUTH-1 (India)</span>
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>2FA: Authenticator Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Read-only Quick Metric Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/70 bg-background/50 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Official Email</p>
              <p className="text-xs font-bold text-foreground truncate mt-0.5">{user?.email || "admin@smartbike.com"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/70 bg-background/50 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Phone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Contact Phone</p>
              <p className="text-xs font-bold text-foreground truncate mt-0.5">{user?.phoneNumber || "+91 9876543210"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/70 bg-background/50 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Security Tier</p>
              <p className="text-xs font-bold text-foreground truncate mt-0.5">Tier 5 (Full SuperAdmin)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {[
          { id: "PROFILE" as ProfileTab, label: "Profile Information", icon: UserCheck },
          { id: "SECURITY" as ProfileTab, label: "Password & Security", icon: KeyRound },
          { id: "PERMISSIONS" as ProfileTab, label: "Governance Privileges", icon: ShieldCheck },
          { id: "ACTIVITY" as ProfileTab, label: `Audit Log (${activities.length})`, icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
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

      {/* Tab 1: Profile Information Form */}
      {activeTab === "PROFILE" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-foreground">Personal & Official Contact Details</h3>
                <p className="text-[11px] text-muted-foreground">Update your official administrator profile identity</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Official Name"
                  name="fullName"
                  type="text"
                  value={profileForm.fullName}
                  onChange={handleProfileChange}
                  placeholder="e.g. System Administrator"
                />

                <Input
                  label="Contact Phone Number"
                  name="phoneNumber"
                  type="text"
                  value={profileForm.phoneNumber}
                  onChange={handleProfileChange}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Official Email (Locked)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || "admin@smartbike.com"}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted/40 border border-border/60 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Master email can only be modified via database migration.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Department / Role</label>
                  <input
                    type="text"
                    name="department"
                    value={profileForm.department}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Role Summary / Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  placeholder="Describe administrator role or responsibilities..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button title="Save Profile Changes" type="submit" loading={profileLoading} />
              </div>
            </form>
          </div>

          {/* Quick System Identity info */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Session & Identity Diagnostics
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Your authenticated admin session is protected by TLS encryption and rotating JWT access tokens.
              </p>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Session Status</span>
                  <span className="font-bold text-emerald-500">Active (Authorized)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Token Protocol</span>
                  <span className="font-mono text-foreground">Bearer JWT (HS256)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Token Expiry</span>
                  <span className="text-foreground">24 Hours Auto-Refresh</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Role Clearance</span>
                  <span className="font-bold text-primary">ROLE_ADMIN (Root)</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-xs space-y-1">
              <p className="font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Live Toast Connection Active
              </p>
              <p className="text-[11px] text-muted-foreground">
                All platform events, profile updates, and admin actions automatically dispatch live toast alerts into your notification center.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Password & Security */}
      {activeTab === "SECURITY" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <KeyRound className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-foreground">Change Administrator Password</h3>
                <p className="text-[11px] text-muted-foreground">Update your master administrator credentials securely</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="Current Master Password"
                  name="oldPassword"
                  type={showOldPass ? "text" : "password"}
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-8 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Master Password"
                  name="newPassword"
                  type={showNewPass ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-8 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {passwordForm.newPassword && (
                <div className="space-y-1.5 p-3 rounded-xl bg-background border border-border/80">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>Password Strength:</span>
                    <span
                      className={
                        passwordStrength >= 75
                          ? "text-emerald-500"
                          : passwordStrength >= 50
                          ? "text-amber-500"
                          : "text-red-500"
                      }
                    >
                      {passwordStrength >= 75 ? "Strong" : passwordStrength >= 50 ? "Moderate" : "Weak"}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength >= 75
                          ? "bg-emerald-500"
                          : passwordStrength >= 50
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Use 8+ characters, mixed upper/lowercase, numbers & special symbols.
                  </p>
                </div>
              )}

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-8 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <Button title="Update Password" type="submit" loading={passwordLoading} />
              </div>
            </form>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              Security Recommendations
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-2xl border border-border/70 bg-background/50 space-y-1">
                <p className="font-bold text-foreground">Rotate Credentials Quarterly</p>
                <p className="text-[11px]">It is recommended to rotate root administrator keys and passwords every 90 days.</p>
              </div>
              <div className="p-3 rounded-2xl border border-border/70 bg-background/50 space-y-1">
                <p className="font-bold text-foreground">Enforce OTP / 2FA</p>
                <p className="text-[11px]">Keep phone verification active to verify master operations and ledger exports.</p>
              </div>
              <div className="p-3 rounded-2xl border border-border/70 bg-background/50 space-y-1">
                <p className="font-bold text-foreground">Zero Shared Logins</p>
                <p className="text-[11px]">Never share root administrator credentials with third parties or across public Wi-Fi networks.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Governance Privileges Matrix */}
      {activeTab === "PERMISSIONS" && (
        <div className="space-y-4">
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Administrator Governance & Authorization Matrix
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Active permission scopes assigned to this account by the Smart Bike authorization engine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {permissionsList.map((perm, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-border/80 bg-background/50 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border ${perm.color}`}>
                      {perm.badge}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">LEVEL 5</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{perm.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{perm.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Recent Activity Log */}
      {activeTab === "ACTIVITY" && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Administrator Audit Log
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Audit trail of operations, fleet modifications, and security actions performed on the platform.
              </p>
            </div>

            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary">
              Live Audit Sync
            </span>
          </div>

          {activityLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin mx-auto mb-2 h-6 w-6 rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground font-medium">Loading audit history...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
              No recent administrative actions recorded.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/70 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 font-bold text-muted-foreground uppercase tracking-wider text-[10px] border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {activities.map((a, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 font-bold text-foreground">
                        {a.action || "SYSTEM_ACTION"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {a.performedBy || user?.fullName || "Admin"}
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono">
                        {a.targetType ? `${a.targetType} #${a.targetId || ""}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                          {a.status || "SUCCESS"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">
                        {a.timestamp ? new Date(a.timestamp).toLocaleString("en-IN") : "Just now"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

