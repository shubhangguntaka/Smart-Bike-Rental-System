import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

import AadhaarVerification from "./AadhaarVerification";
import DrivingLicenseVerification from "../customer/DrivingLicenseVerification";
import { BookingService } from "../../services/bookingService";
import useAuth from "../../hooks/useAuth";

import type {
  AadhaarVerificationResult,
  DrivingLicenseVerificationResult,
} from "../../types/verification";

type Step = "aadhaar" | "license" | "done";

const DocumentVerification = () => {
  const { user } = useAuth();
  const customerId = user?.id || 11;
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("aadhaar");
  const [loading, setLoading] = useState(true);
  const [aadhaarResult, setAadhaarResult] = useState<AadhaarVerificationResult | null>(null);
  const [licenseResult, setLicenseResult] = useState<DrivingLicenseVerificationResult | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        setLoading(true);
        const details = await BookingService.getVerificationDetails(customerId);
        setAadhaarResult(details.aadhaarData);
        setLicenseResult(details.dlData);

        if (details.aadhaarVerified && details.dlVerified) {
          setStep("done");
        } else if (details.aadhaarVerified) {
          setStep("license");
        } else {
          setStep("aadhaar");
        }
      } catch (err) {
        console.error("Failed to load verification status", err);
      } finally {
        setLoading(false);
      }
    };
    checkVerification();
  }, [customerId]);

  const handleAadhaarVerified = async (result: AadhaarVerificationResult) => {
    setAadhaarResult(result);

    if (result.status !== "REJECTED") {
      const details = await BookingService.getVerificationDetails(customerId);
      if (details.dlVerified) {
        setStep("done");
      } else {
        setStep("license");
      }
    }
  };

  const handleLicenseVerified = (result: DrivingLicenseVerificationResult) => {
    setLicenseResult(result);

    if (result.verified) {
      setStep("done");
    }
  };

  const exitVerification = () => navigate(-1);

  const pendingBookingStr = localStorage.getItem("pending_booking");
  const handleContinue = () => {
    if (pendingBookingStr) {
      try {
        const { returnRoute } = JSON.parse(pendingBookingStr);
        navigate(returnRoute || "/customer/explore-bikes");
      } catch {
        navigate("/customer/explore-bikes");
      }
    } else {
      navigate("/customer/explore-bikes");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary animate-pulse">
          Loading Verification Status...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-8 sm:py-12 max-w-5xl mx-auto">
      {/* Title & Header */}
      <div className="text-center space-y-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary">
          Customer Verification
        </p>
        <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Get Verified to Start Renting
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Complete Aadhaar and Driving License verification to unlock instant bike bookings across the platform.
        </p>
      </div>

      {/* Stepper */}
      <StepIndicator step={step} onStepClick={setStep} />

      {step === "aadhaar" && (
        <AadhaarVerification
          customerId={customerId}
          onVerified={handleAadhaarVerified}
          onBack={exitVerification}
        />
      )}

      {step === "license" && (
        <DrivingLicenseVerification
          customerId={aadhaarResult?.customerId || customerId}
          onVerified={handleLicenseVerified}
          onBack={() => setStep("aadhaar")}
        />
      )}

      {step === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card text-center shadow-xl"
        >
          <div className="bg-gradient-to-b from-primary/15 via-primary/5 to-transparent px-8 py-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 shadow-lg shadow-emerald-500/10">
              <ShieldCheck size={38} />
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-foreground sm:text-3xl">
              Identity Verified & Ready to Ride
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Your Aadhaar and Driving License have been verified. You can now book any verified bike.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:p-8 text-left sm:grid-cols-2">
            <div className="rounded-2xl bg-muted/40 border border-border p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Aadhaar Verified Name
              </p>
              <p className="mt-1 font-bold text-foreground text-sm">
                {aadhaarResult?.customerName || user?.fullName || "Verified User"}
              </p>
            </div>

            <div className="rounded-2xl bg-muted/40 border border-border p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Driving License Number
              </p>
              <p className="mt-1 font-mono font-bold tracking-wider text-foreground text-sm">
                {licenseResult?.licenseNumber || "VERIFIED"}
              </p>
            </div>
          </div>

          <div className="border-t border-border p-6 bg-muted/20 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
            >
              <span>{pendingBookingStr ? "Continue to Booking" : "Explore Rental Rides"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const StepIndicator = ({
  step,
  onStepClick,
}: {
  step: Step;
  onStepClick: (step: Step) => void;
}) => {
  const steps: { key: Step; label: string }[] = [
    { key: "aadhaar", label: "Aadhaar" },
    { key: "license", label: "Driving License" },
    { key: "done", label: "Complete" },
  ];

  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center justify-center w-full max-w-md px-2 overflow-x-auto no-scrollbar">
      {steps.map((s, i) => {
        const complete = i < activeIndex;
        const active = i === activeIndex;
        const clickable = complete;

        return (
          <div key={s.key} className="flex items-center shrink-0">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(s.key)}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                clickable ? "cursor-pointer hover:opacity-80" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl border-2 text-xs font-bold transition-all shadow-xs ${
                  complete
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/50 text-muted-foreground"
                }`}
              >
                {complete ? <Check size={16} /> : i + 1}
              </span>
              <span
                className={`text-[11px] font-bold ${
                  active || complete ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </button>

            {i < steps.length - 1 && (
              <div
                className={`mx-2 sm:mx-4 mb-4 h-0.5 w-8 sm:w-16 transition-all ${
                  complete ? "bg-emerald-500" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DocumentVerification;
