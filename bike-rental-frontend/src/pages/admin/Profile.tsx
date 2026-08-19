import React, { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import {
  Calendar,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
} from "lucide-react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { updateProfile, changePassword } from "@/services/userService";
import toast from "react-hot-toast";

export default function AdminProfile() {
  const { user, refreshUser } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshUser();
      toast.success("Profile reloaded from server.");
    } catch {
      toast.error("Failed to reload profile.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
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
      toast.success("Admin profile updated successfully!");
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

  return (
    <div className="space-y-6 max-w-7xl text-foreground min-h-screen pb-12">
      {/* Title & Header */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Admin Profile & Security
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            Administrator Profile & Access
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage authenticated administrator identity, contact details, role permissions, and access credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60 shadow-2xs"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Reload Profile"}</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-border pb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary font-black text-2xl border border-primary/20 shadow-xs shrink-0">
            {user?.fullName ? user.fullName[0].toUpperCase() : "A"}
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h3 className="text-xl font-bold text-foreground">{user?.fullName || "Administrator"}</h3>
              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                {user?.role || "ADMIN"} PRIVILEGES
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-500 uppercase tracking-wider">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-muted-foreground font-medium">
              System Administrator ID #{user?.id || "ADM-001"} • Full read & write permissions across global fleet, users, and audit logs.
            </p>
          </div>
        </div>

        {/* Read-only Attribute Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-border bg-muted/20">
            <Mail className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">Official Email</p>
              <p className="text-xs font-semibold text-foreground truncate mt-0.5">{user?.email || "admin@smartbike.com"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-border bg-muted/20">
            <Phone className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">Contact Phone</p>
              <p className="text-xs font-semibold text-foreground truncate mt-0.5">{user?.phoneNumber || "Not configured"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-border bg-muted/20">
            <Shield className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">Governance Role</p>
              <p className="text-xs font-semibold text-foreground truncate mt-0.5">Platform SuperAdmin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Profile Form */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <UserCheck className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-bold text-foreground">Personal Information</h3>
              <p className="text-[11px] text-muted-foreground">Update your official full name and contact number</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              value={profileForm.fullName}
              onChange={handleProfileChange}
              placeholder="e.g. John Doe"
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              type="text"
              value={profileForm.phoneNumber}
              onChange={handleProfileChange}
              placeholder="e.g. 9876543210"
            />
            <div className="flex justify-end pt-2">
              <Button title="Save Profile Changes" type="submit" loading={profileLoading} />
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <KeyRound className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-foreground">Security & Password</h3>
              <p className="text-[11px] text-muted-foreground">Change your account password securely</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              name="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Minimum 8 characters"
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Re-enter new password"
            />
            <div className="flex justify-end pt-2">
              <Button title="Update Password" type="submit" loading={passwordLoading} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
