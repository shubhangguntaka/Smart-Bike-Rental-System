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
  KeyRound,
  FileCheck2,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  MapPin,
  Trash2,
  UserCheck,
  AlertCircle,
  AlertTriangle,
  FileText,
  Clock,
  Compass,
} from "lucide-react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { updateProfile, changePassword, uploadProfileImage, deleteMyAccount } from "@/services/userService";
import env from "@/config/env";
import toast from "react-hot-toast";

type ProfileTab = "PROFILE" | "PHOTO" | "SECURITY" | "VERIFICATION";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();

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

  // Delete account modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
    city: "Hyderabad, Telangana",
    bio: "Passionate Urban Rider & Bike Explorer.",
    emergencyContactName: "",
    emergencyContactPhone: "",
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
        fullName: user.fullName || user.name || "",
        phoneNumber: user.phoneNumber || "",
      }));
    }
  }, [user]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshUser();
      toast.success("Customer profile refreshed successfully.");
    } catch {
      toast.error("Failed to refresh profile.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyId = () => {
    const id = user?.id ? `CUST-${user.id}` : "CUST-001";
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success(`Customer ID ${id} copied to clipboard!`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      toast.success("Customer profile updated successfully!");
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      toast.error('Please type "DELETE" to confirm account deletion.');
      return;
    }
    try {
      setDeleteLoading(true);
      await deleteMyAccount();
      toast.success("Your account has been deleted successfully.");
      setDeleteModalOpen(false);
      await logout();
    } catch (error: any) {
      const response = error.response?.data;
      const errorMsg = response?.message || response?.error || "Failed to delete account. Ensure no active bookings or ongoing rides exist.";
      toast.error(errorMsg);
    } finally {
      setDeleteLoading(false);
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
  const isKycVerified = user?.enabled ?? true;

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
                  alt={user?.fullName || "Customer Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{user?.fullName ? user.fullName[0].toUpperCase() : "C"}</span>
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
              className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-card ring-2 ${isKycVerified ? "bg-emerald-500 ring-emerald-500/20" : "bg-amber-500 ring-amber-500/20"
                }`}
              title={isKycVerified ? "KYC Verified Customer" : "DL Verification Required"}
            />
          </div>

          {/* Details & Actions */}
          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {user?.fullName || "Urban Bike Rider"}
              </h2>

              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary uppercase tracking-wider border border-primary/20">
                <UserCheck className="h-3.5 w-3.5" />
                CUSTOMER RIDER
              </span>

              {isKycVerified ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  DL VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider border border-amber-500/20">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  DL PENDING
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
                <span>ID: #{user?.id ? `CUST-${user.id}` : "CUST-001"}</span>
              </button>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{profileForm.city}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>Account Protection: Active</span>
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
              <p className="text-xs font-bold text-foreground truncate mt-0.5">{user?.email || "customer@smartbike.com"}</p>
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
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Driving License</p>
              <p className="text-xs font-bold text-emerald-500 truncate mt-0.5">Verified & Rental Eligible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {[
          { id: "PROFILE" as ProfileTab, label: "Profile Information", icon: User },
          { id: "PHOTO" as ProfileTab, label: "Profile Photo & Avatar", icon: Camera },
          { id: "SECURITY" as ProfileTab, label: "Password & Security", icon: KeyRound },
          { id: "VERIFICATION" as ProfileTab, label: "DL & Documents", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${isActive
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

      {/* TAB CONTENT 1: PROFILE INFO */}
      {activeTab === "PROFILE" && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span>Personal Information</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your contact parameters, location, and emergency contact details.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                name="fullName"
                type="text"
                value={profileForm.fullName}
                onChange={handleProfileChange}
                placeholder="e.g. Rajesh Kumar"
                required
              />

              <Input
                label="Phone Number"
                name="phoneNumber"
                type="text"
                value={profileForm.phoneNumber}
                onChange={handleProfileChange}
                placeholder="e.g. 9876543210"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full rounded-xl border border-border/80 bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground font-semibold cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    LOCKED
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Contact customer support to change registered account email.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Preferred Location / City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="city"
                    value={profileForm.city}
                    onChange={handleProfileChange}
                    placeholder="e.g. Hyderabad, Telangana"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Rider Bio */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Rider Bio & Riding Notes
              </label>
              <textarea
                name="bio"
                rows={3}
                value={profileForm.bio}
                onChange={handleProfileChange}
                placeholder="Tell hosts about your riding experience, preferred bike models, or commute style..."
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium resize-none"
              />
            </div>

            {/* Emergency Contact */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Emergency Contact Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Name"
                  name="emergencyContactName"
                  type="text"
                  value={profileForm.emergencyContactName}
                  onChange={handleProfileChange}
                  placeholder="e.g. Vikram Sharma (Brother)"
                />
                <Input
                  label="Contact Phone"
                  name="emergencyContactPhone"
                  type="text"
                  value={profileForm.emergencyContactPhone}
                  onChange={handleProfileChange}
                  placeholder="e.g. 9812345678"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                title="Save Customer Profile"
                type="submit"
                loading={profileLoading}
                className="px-6 py-2.5 text-xs font-bold rounded-xl"
              />
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT 2: PROFILE PHOTO */}
      {activeTab === "PHOTO" && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-border/60 pb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <span>Profile Photo & Avatar</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload a clear profile image. Your photo will be visible to bike owners when reviewing ride bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Preview Box */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/80 rounded-3xl bg-muted/20 space-y-4">
              <div className="relative">
                <div className="h-40 w-40 rounded-3xl bg-linear-to-br from-primary/20 to-background flex items-center justify-center text-primary font-black text-5xl border-2 border-primary/30 shadow-lg overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span>{user?.fullName ? user.fullName[0].toUpperCase() : "C"}</span>
                  )}
                </div>
                {imagePreview && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    PREVIEW
                  </span>
                )}
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-foreground">
                  {selectedImageFile ? selectedImageFile.name : "Current Profile Avatar"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {selectedImageFile
                    ? `${(selectedImageFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : "No new file selected"}
                </p>
              </div>

              {imagePreview && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveUploadedPhoto}
                    disabled={imageUploading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{imageUploading ? "Uploading..." : "Save Photo"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPreview}
                    disabled={imageUploading}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: Upload Options & Specs */}
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>Photo Guidelines</span>
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>Accepted formats: PNG, JPG, JPEG, WEBP</li>
                  <li>Maximum file size limit: 5 MB</li>
                  <li>Square ratio (1:1) recommended for optimal display</li>
                  <li>Ensure clear lighting and face visibility</li>
                </ul>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Image File
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer border border-border rounded-xl p-1 bg-background"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveUploadedPhoto}
                  disabled={!selectedImageFile || imageUploading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{imageUploading ? "Uploading Avatar..." : "Upload Selected Photo"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PASSWORD & SECURITY */}
      {activeTab === "SECURITY" && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-border/60 pb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <span>Password & Security</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your account password and review security parameters.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-2xl">
            {/* Old Password */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? "text" : "password"}
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                  className="w-full rounded-xl border border-border bg-background pr-10 pl-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 8 chars)"
                  required
                  className="w-full rounded-xl border border-border bg-background pr-10 pl-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator Bar */}
              {passwordForm.newPassword && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-muted-foreground">Password Strength</span>
                    <span
                      className={
                        passwordStrength <= 25
                          ? "text-rose-500"
                          : passwordStrength <= 50
                            ? "text-amber-500"
                            : passwordStrength <= 75
                              ? "text-blue-500"
                              : "text-emerald-500"
                      }
                    >
                      {passwordStrength <= 25
                        ? "Weak"
                        : passwordStrength <= 50
                          ? "Fair"
                          : passwordStrength <= 75
                            ? "Good"
                            : "Strong & Secure"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength >= 25 ? (passwordStrength <= 25 ? "bg-rose-500" : "bg-emerald-500") : "bg-transparent"
                        }`}
                      style={{ width: "25%" }}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength >= 50 ? (passwordStrength <= 50 ? "bg-amber-500" : "bg-emerald-500") : "bg-transparent"
                        }`}
                      style={{ width: "25%" }}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength >= 75 ? (passwordStrength <= 75 ? "bg-blue-500" : "bg-emerald-500") : "bg-transparent"
                        }`}
                      style={{ width: "25%" }}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength >= 100 ? "bg-emerald-500" : "bg-transparent"
                        }`}
                      style={{ width: "25%" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                  className="w-full rounded-xl border border-border bg-background pr-10 pl-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                title="Update Password"
                type="submit"
                loading={passwordLoading}
                className="px-6 py-2.5 text-xs font-bold rounded-xl"
              />
            </div>
          </form>

          {/* Danger Zone: Delete Account */}
          <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Danger Zone — Delete Account</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                  Permanently remove your personal customer account, authentication sessions, and verification records. This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmText("");
                  setDeleteModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: DL & VERIFICATION */}
      {activeTab === "VERIFICATION" && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-border/60 pb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Driving License & KYC Documents</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verify your Driving License to unlock instant bike bookings and rental privileges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Card */}
            <div className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Status: Verified & Active
                </span>
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                  RENTAL READY
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">License Holder:</span>
                  <span className="font-bold text-foreground">{user?.fullName || "Verified Rider"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Document Type:</span>
                  <span className="font-bold text-foreground">Indian Driving License (DL)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Verification Date:</span>
                  <span className="font-bold text-foreground">Jan 15, 2026</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/customer/verification")}
                className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>Manage Verification Documents</span>
              </button>
            </div>

            {/* Guidance Box */}
            <div className="p-6 rounded-3xl border border-border/80 bg-muted/20 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span>Verification Requirements</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All bike rentals require a valid government-issued Driving License matching the registered rider profile name. Ensure your uploaded document has clear text, uncropped edges, and valid expiration date.
              </p>
              <div className="pt-2 text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1" onClick={() => navigate("/customer/verification")}>
                <span>View License Verification Portal</span>
                <Compass className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleteLoading) setDeleteModalOpen(false);
        }}
        size="md"
        ariaLabelledBy="delete-account-title"
      >
        <ModalHeader
          onClose={() => {
            if (!deleteLoading) setDeleteModalOpen(false);
          }}
        >
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span id="delete-account-title" className="font-bold text-base text-foreground">
              Delete Your Account?
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium leading-relaxed">
            <strong>Warning:</strong> This action is permanent and irreversible. Your personal profile, active sessions, and document records will be deleted immediately.
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Account deletion cannot be performed while you have active bookings, ongoing rides, or pending returns.
          </p>

          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-foreground">
              To confirm, type <span className="font-mono text-rose-600 dark:text-rose-400 font-black">DELETE</span> below:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              disabled={deleteLoading}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || deleteLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{deleteLoading ? "Deleting Account..." : "Permanently Delete"}</span>
            </button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

