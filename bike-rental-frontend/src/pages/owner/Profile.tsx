import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Camera,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Globe,
  KeyRound,
  FileCheck2,
  Sparkles,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Bike,
  Building2,
  MapPin,
  ExternalLink,
  Trash2,
  Layers
} from "lucide-react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { updateProfile, changePassword, uploadProfileImage } from "@/services/userService";
import { useOwnerStore } from "@/store/ownerStore";
import env from "@/config/env";
import toast from "react-hot-toast";

type ProfileTab = "PROFILE" | "PHOTO" | "SECURITY" | "VERIFICATION";

export default function OwnerProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { dashboard, fetchDashboard } = useOwnerStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>("PROFILE");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Password visibility
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Image preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
    city: "Hyderabad, Telangana",
    bio: "Certified Bike Rental Host & Fleet Partner.",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        fullName: user.fullName || user.name || "",
        phoneNumber: user.phoneNumber || "",
      }));
    }
  }, [user]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([refreshUser(), fetchDashboard(true)]);
      toast.success("Owner profile & credentials refreshed.");
    } catch {
      toast.error("Failed to refresh profile.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyId = () => {
    const id = user?.id ? `OWN-${user.id}` : "OWN-001";
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success(`Owner ID ${id} copied to clipboard!`);
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

  // Handle avatar file selection & live preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, JPEG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should not exceed 5 MB");
      return;
    }

    setSelectedImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleDirectAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should not exceed 5 MB");
      return;
    }

    try {
      setImageUploading(true);
      await uploadProfileImage(file);
      await refreshUser();
      setImagePreview(null);
      setSelectedImageFile(null);
      toast.success("Profile photo uploaded and updated successfully!");
    } catch (error: any) {
      const response = error.response?.data;
      toast.error(response?.message || "Failed to upload profile photo");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveUploadedPhoto = async () => {
    if (!selectedImageFile) {
      toast.error("Please select an image file first");
      return;
    }

    try {
      setImageUploading(true);
      await uploadProfileImage(selectedImageFile);
      await refreshUser();
      setImagePreview(null);
      setSelectedImageFile(null);
      toast.success("Profile photo updated successfully!");
    } catch (error: any) {
      const response = error.response?.data;
      toast.error(response?.message || "Failed to save profile photo");
    } finally {
      setImageUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      toast.error("Please enter a valid 10-digit Indian phone number starting with 6-9");
      return;
    }

    try {
      setProfileLoading(true);
      await updateProfile({
        fullName: profileForm.fullName.trim(),
        phoneNumber: profileForm.phoneNumber.trim(),
      });
      await refreshUser();
      toast.success("Owner profile updated successfully!");
    } catch (error: any) {
      const response = error.response?.data;
      toast.error(response?.message || "Failed to update profile");
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
      toast.success("Password changed successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      const response = error.response?.data;
      toast.error(response?.message || "Failed to change password. Verify your current password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (imagePreview) return imagePreview;
    if (!user?.profileImage) return null;
    if (user.profileImage.startsWith("http://") || user.profileImage.startsWith("https://")) {
      return user.profileImage;
    }
    return `${env.API_BASE_URL.replace("/api", "")}${user.profileImage}`;
  };

  const avatarUrl = getAvatarUrl();
  const isKycVerified = dashboard?.aadhaarVerified || user?.enabled;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground min-h-screen pb-16 font-sans">
      {/* Hero Profile Overview Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-border/60 pb-6">
          {/* Avatar with Camera Trigger */}
          <div className="relative group shrink-0">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-primary/20 via-primary/10 to-background text-primary font-black text-3xl border border-primary/30 shadow-md overflow-hidden ring-4 ring-primary/10">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.fullName || "Owner Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{user?.fullName ? user.fullName[0].toUpperCase() : "O"}</span>
              )}
            </div>

            {/* Quick Upload Hover Overlay */}
            <label
              htmlFor="hero-avatar-upload"
              className="absolute inset-0 rounded-3xl bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-2xs"
              title="Change Profile Photo"
            >
              <Camera className="h-6 w-6 text-white" />
              <span className="text-[9px] font-bold mt-1">Upload</span>
            </label>
            <input
              type="file"
              id="hero-avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleDirectAvatarUpload}
              disabled={imageUploading}
            />

            <span
              className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-card ring-2 ${
                isKycVerified ? "bg-emerald-500 ring-emerald-500/20" : "bg-amber-500 ring-amber-500/20"
              }`}
              title={isKycVerified ? "KYC Verified Partner" : "Verification Incomplete"}
            />
          </div>

          {/* Details & Actions */}
          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {user?.fullName || "Bike Fleet Host"}
              </h2>

              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary uppercase tracking-wider border border-primary/20">
                <Bike className="h-3.5 w-3.5" />
                OWNER PARTNER
              </span>

              {isKycVerified ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  KYC VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider border border-amber-500/20">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  VERIFICATION PENDING
                </span>
              )}
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
                <span>ID: #{user?.id ? `OWN-${user.id}` : "OWN-001"}</span>
              </button>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{profileForm.city}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>2FA / Secure Login: Active</span>
              </span>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer ml-auto"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
                <span>Reload</span>
              </button>
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
              <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Registered Email</p>
              <p className="text-xs font-bold text-foreground truncate mt-0.5">{user?.email || "owner@smartbike.com"}</p>
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
              <Bike className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Fleet Status</p>
              <p className="text-xs font-bold text-foreground truncate mt-0.5">
                {dashboard?.totalBikes ? `${dashboard.totalBikes} Listed Bikes` : "Fleet Partner"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto sm:flex-wrap gap-2 border-b border-border/60 pb-3 scrollbar-none">
        {[
          { id: "PROFILE" as ProfileTab, label: "Profile Information", icon: User },
          { id: "PHOTO" as ProfileTab, label: "Profile Photo & Avatar", icon: Camera },
          { id: "SECURITY" as ProfileTab, label: "Password & Security", icon: KeyRound },
          { id: "VERIFICATION" as ProfileTab, label: "KYC & Documents", icon: ShieldCheck },
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

      {/* Tab 1: Profile Information Form */}
      {activeTab === "PROFILE" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <User className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-foreground">Host Identity & Contact Information</h3>
                <p className="text-[11px] text-muted-foreground">Manage your public host identity, contact telephone, and operating hub</p>
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
                  placeholder="e.g. Rajesh Sharma"
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
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Registered Email (Read-Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || "owner@smartbike.com"}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted/40 border border-border/60 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Contact platform support to request an email change.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Operating City / Fleet Hub</label>
                  <input
                    type="text"
                    name="city"
                    value={profileForm.city}
                    onChange={handleProfileChange}
                    placeholder="e.g. Hyderabad, Telangana"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Host Fleet Summary / Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  placeholder="Describe your bike fleet and rental experience..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/80 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button title="Save Profile Changes" type="submit" loading={profileLoading} />
              </div>
            </form>
          </div>

          {/* Session & Account Status */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Host Account Status
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Your partner account is active and verified to receive customer bike booking requests and payouts.
              </p>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Partner Clearance</span>
                  <span className="font-bold text-emerald-500">ROLE_OWNER</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Listed Fleet</span>
                  <span className="font-mono text-foreground">{dashboard?.totalBikes ?? 0} Vehicles</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Total Completed Trips</span>
                  <span className="font-bold text-primary">{dashboard?.completedBookings ?? 0} Bookings</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Payout Clearance</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Direct Bank Settlement</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-xs space-y-1">
              <p className="font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Live Notification Sync
              </p>
              <p className="text-[11px] text-muted-foreground">
                All customer bookings, cancellations, and earnings payouts are dispatched directly into your notification center.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Profile Photo & Avatar Management */}
      {activeTab === "PHOTO" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <Camera className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-foreground">Upload Profile Picture</h3>
                <p className="text-[11px] text-muted-foreground">Upload your custom profile photo to appear on customer booking tickets and invoices</p>
              </div>
            </div>

            {/* Drag and Drop / Picker Box */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/80 rounded-3xl p-8 text-center bg-background/50 hover:bg-muted/20 transition-all">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <ImageIcon className="h-10 w-10" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Choose a new profile image</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Supports JPG, PNG, WEBP formats up to 5 MB.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  id="tab-photo-input"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="tab-photo-input"
                  className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition cursor-pointer flex items-center gap-2 shadow-md shadow-primary/20"
                >
                  <Upload className="h-4 w-4" />
                  <span>Browse Photo</span>
                </label>

                {selectedImageFile && (
                  <button
                    type="button"
                    onClick={handleCancelPreview}
                    className="px-4 py-2.5 bg-background border border-border text-foreground text-xs font-bold rounded-xl hover:bg-muted transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Preview Box & Save Action */}
            {selectedImageFile && imagePreview && (
              <div className="p-4 rounded-2xl bg-muted/30 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-primary shrink-0 shadow-md">
                    <img src={imagePreview} alt="Selected Preview" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{selectedImageFile.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(selectedImageFile.size / 1024).toFixed(1)} KB — Ready to upload
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveUploadedPhoto}
                  disabled={imageUploading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  {imageUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save & Apply Photo</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Current Avatar Card */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col items-center text-center justify-center">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Avatar Display</h4>
            
            <div className="h-32 w-32 rounded-3xl bg-linear-to-br from-primary/20 via-primary/10 to-background text-primary font-black text-4xl border-2 border-primary/40 shadow-lg overflow-hidden flex items-center justify-center ring-4 ring-primary/10">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.fullName || "Owner"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{user?.fullName ? user.fullName[0].toUpperCase() : "O"}</span>
              )}
            </div>

            <div className="space-y-1">
              <p className="font-bold text-sm text-foreground">{user?.fullName || "Owner Partner"}</p>
              <p className="text-[11px] text-muted-foreground font-mono">#{user?.id ? `OWN-${user.id}` : "OWN-001"}</p>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 text-[11px] text-muted-foreground text-left leading-relaxed">
              💡 <strong>Tip:</strong> A clean, recognizable profile picture builds customer trust and increases booking conversion rates.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Password & Security */}
      {activeTab === "SECURITY" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <KeyRound className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-foreground">Change Account Password</h3>
                <p className="text-[11px] text-muted-foreground">Update your owner login credentials securely</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="Current Password"
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
                  label="New Password"
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
                    Use 8+ characters, mixed upper/lowercase, numbers & symbols.
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
              Security Best Practices
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-2xl border border-border/70 bg-background/50 space-y-1">
                <p className="font-bold text-foreground">Unique Passwords</p>
                <p className="text-[11px]">Do not reuse your owner portal password across other websites.</p>
              </div>
              <div className="p-3 rounded-2xl border border-border/70 bg-background/50 space-y-1">
                <p className="font-bold text-foreground">Active Session Monitoring</p>
                <p className="text-[11px]">Logout if accessing the owner dashboard from shared or public computers.</p>
              </div>
              <div className="p-3 rounded-2xl border border-border/70 bg-background/50 space-y-1">
                <p className="font-bold text-foreground">Payout PIN & Bank Details</p>
                <p className="text-[11px]">Platform representatives will never ask for your bank OTP or login password.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: KYC & Verification Status */}
      {activeTab === "VERIFICATION" && (
        <div className="space-y-6">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Partner Verification & Compliance Status
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Official KYC documents registered with the platform to list bikes and collect earnings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/owner/documents")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer shadow-sm"
              >
                <span>Manage KYC Documents</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Aadhaar KYC */}
              <div className="p-5 rounded-2xl border border-border/80 bg-background/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Identity KYC</span>
                  {dashboard?.aadhaarVerified ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      VERIFIED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      PENDING
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Aadhaar Card Verification</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboard?.aadhaarVerified
                      ? "Government ID verified and approved for hosting bikes."
                      : "Upload your Aadhaar ID in Documents section to complete KYC."}
                  </p>
                </div>
              </div>

              {/* RC Documents */}
              <div className="p-5 rounded-2xl border border-border/80 bg-background/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fleet RC</span>
                  {dashboard?.rcVerified ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      REGISTERED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      REVIEW REQUIRED
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Vehicle Registration Certificates</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboard?.rcVerified
                      ? "Vehicle RC documents verified for commercial rental listing."
                      : "Upload bike RC certificates to activate listed vehicles."}
                  </p>
                </div>
              </div>

              {/* Payout Clearance */}
              <div className="p-5 rounded-2xl border border-border/80 bg-background/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Settlements</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Payout Settlements</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct automated earnings clearance to your registered bank account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
