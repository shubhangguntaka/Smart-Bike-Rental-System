import React, { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { Mail, Phone, Shield } from "lucide-react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { updateProfile, changePassword } from "@/services/userService";
import toast from "react-hot-toast";

export default function AdminProfile() {
  const { user, refreshUser } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

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
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setProfileLoading(true);
      await updateProfile(profileForm);
      await refreshUser();
      toast.success("Profile updated successfully!");
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
      toast.error("New Password must be at least 8 characters");
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword(passwordForm);
      toast.success("Password changed successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (error: any) {
      const response = error.response?.data;
      toast.error(response?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-8xl text-foreground min-h-screen pb-10">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Admin Profile</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage admin credentials and system roles.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 font-bold text-xl border border-red-500/20">
            {user?.fullName ? user.fullName[0].toUpperCase() : "A"}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-lg font-bold">{user?.fullName}</h3>
            <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">
              {user?.role} ACCOUNT
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-xs text-muted-foreground">Email Address</p>
              <p className="text-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-xs text-muted-foreground">Contact Phone</p>
              <p className="text-foreground">{user?.phoneNumber || "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-xs text-muted-foreground">Access Permissions</p>
              <p className="text-red-500 font-bold">Root Admin Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold border-b border-border pb-3 mb-4">Edit Profile</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              value={profileForm.fullName}
              onChange={handleProfileChange}
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              type="text"
              value={profileForm.phoneNumber}
              onChange={handleProfileChange}
            />
          </div>
          <div className="flex justify-end">
            <Button title="Update Profile" type="submit" loading={profileLoading} />
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold border-b border-border pb-3 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              name="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="flex justify-end">
            <Button title="Change Password" type="submit" loading={passwordLoading} />
          </div>
        </form>
      </div>
    </div>
  );
}
