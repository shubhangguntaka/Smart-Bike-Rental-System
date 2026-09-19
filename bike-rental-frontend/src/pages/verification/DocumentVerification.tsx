import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";

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
        navigate(returnRoute || "/customer/bikes");
      } catch {
        navigate("/customer/bikes");
      }
    } else {
      navigate("/customer/bikes");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brass">
          Loading Verification Status...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-10 bg-parchment px-4 py-14">

      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brass">
          Verification Bureau
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          Get verified to start renting
        </h1>
      </div>

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
          className="w-full max-w-4xl overflow-hidden rounded-2xl border border-ink/10 bg-white text-center shadow-[0_20px_60px_-25px_rgba(11,18,32,0.35)]"
        >
          <div className="bg-bureau px-8 py-10 text-parchment">
            <div className="animate-stamp-slam mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-verified bg-white/10">
              <ShieldCheck size={34} className="text-verified" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold">Identity Verified</h2>
            <p className="mt-1 text-sm text-parchment/70">
              Your Aadhaar and Driving License have both been verified successfully.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-8 text-left sm:grid-cols-2">
            <div className="rounded-xl bg-parchment px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Aadhaar Name
              </p>
              <p className="mt-0.5 font-semibold text-ink">{aadhaarResult?.customerName}</p>
            </div>

            <div className="rounded-xl bg-parchment px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                License Number
              </p>
              <p className="mt-0.5 font-mono font-semibold tracking-wide text-ink">
                {licenseResult?.licenseNumber}
              </p>
            </div>
          </div>

          {pendingBookingStr && (
            <div className="border-t border-ink/10 p-6 bg-slate-50 flex justify-center">
              <button
                onClick={handleContinue}
                className="w-full max-w-xs rounded-xl bg-bureau px-6 py-3 font-semibold text-white transition-colors hover:bg-bureau/90"
              >
                Continue to Booking
              </button>
            </div>
          )}
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
    <div className="flex items-center">
      {steps.map((s, i) => {
        const complete = i < activeIndex;
        const active = i === activeIndex;
        // Only completed steps are safe to jump back to - "done" and
        // the current step aren't clickable targets.
        const clickable = complete;

        return (
          <div key={s.key} className="flex items-center">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(s.key)}
              className={`flex flex-col items-center gap-2 ${
                clickable ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  complete
                    ? "border-verified bg-verified text-white hover:bg-verified/85"
                    : active
                    ? "border-bureau bg-bureau text-white"
                    : "border-ink/15 bg-white text-slate-400"
                }`}
              >
                {complete ? <Check size={16} /> : i + 1}
              </span>
              <span
                className={`text-xs font-medium ${
                  active || complete ? "text-ink" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </button>

            {i < steps.length - 1 && (
              <span
                className={`mx-1 sm:mx-3 mb-5 h-0.5 w-6 xs:w-10 sm:w-16 md:w-20 self-start ${
                  complete ? "bg-verified" : "bg-ink/10"
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
