import React from "react";
import useAuth from "@/hooks/useAuth";
import { User, Mail, Phone, ShieldCheck, Building } from "lucide-react";

export default function OwnerProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Bike Owner Profile</h2>
        <p className="text-xs text-muted-foreground mt-1">Owner identification credentials and partner status.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl border border-primary/20">
            {user?.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`.toUpperCase() : "O"}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-lg font-bold">{user?.firstName} {user?.lastName}</h3>
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
              {user?.role} PARTNER
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
              <p className="text-foreground">{user?.phoneNumber || "+91 98210 54192"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-xs text-muted-foreground">KYC Partner Verification</p>
              <p className="text-green-500 font-bold">Approved & Verified Partner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
