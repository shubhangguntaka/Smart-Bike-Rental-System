import React from "react";
import useAuth from "@/hooks/useAuth";
import { User, Mail, Phone, Calendar, ShieldCheck } from "lucide-react";

export default function CustomerProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Your Profile</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage registration parameters and verification statuses.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl border border-primary/20">
            {user?.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`.toUpperCase() : "U"}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-lg font-bold">{user?.firstName} {user?.lastName}</h3>
            <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-500 uppercase tracking-wider">
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
              <p className="font-semibold text-xs text-muted-foreground">Phone Number</p>
              <p className="text-foreground">{user?.phoneNumber || "+91 90812 78311"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-xs text-muted-foreground">Driving License Verification</p>
              <p className="text-green-500 font-bold">Verified & Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
