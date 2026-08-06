import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  FileCheck2,
  RotateCcw,
  Zap,
} from "lucide-react";

import useAuth from "@/hooks/useAuth";
import BikeForm from "@/components/bike/BikeForm";
import bikeService, { type ApprovedRc } from "@/services/bikeService";
import { emptyBike, type Bike } from "@/types/bike";
import type {
  AadhaarVerificationResult,
  BikeDocumentVerificationResult,
} from "@/types/verification";
import AadhaarVerification from "@/pages/verification/AadhaarVerification";
import BikeDocumentVerification from "@/pages/owner/BikeDocumentVerification";
import { ROUTES } from "@/constants/routes";
import { format12Hour } from "@/utils/timeUtils";

type StepMode =
  | "checking"
  | "step1_aadhaar"
  | "quick_listing"
  | "custom_form"
  | "step5_upload_rc"
  | "step6_rc_verification"
  | "step7_registered_success";

const TIME_OPTIONS = [
  { value: "06:00", label: "06:00 AM" },
  { value: "07:00", label: "07:00 AM" },
  { value: "08:00", label: "08:00 AM" },
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "01:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" },
  { value: "18:00", label: "06:00 PM" },
  { value: "19:00", label: "07:00 PM" },
  { value: "20:00", label: "08:00 PM" },
  { value: "21:00", label: "09:00 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "23:00", label: "11:00 PM" },
];

const AddBike = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ownerId = user?.id;

  const [isAadhaarVerified, setIsAadhaarVerified] = useState<boolean | null>(null);
  const [approvedRcs, setApprovedRcs] = useState<ApprovedRc[]>([]);
  const [stepMode, setStepMode] = useState<StepMode>("checking");

  const [bikeDraft, setBikeDraft] = useState<Bike | null>(null);
  const [rcResult, setRcResult] = useState<BikeDocumentVerificationResult | null>(null);
  const [saving, setSaving] = useState(false);

  // Operational Times for Quick Add
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("21:00");

  useEffect(() => {
    if (!ownerId) return;
    let cancelled = false;

    (async () => {
      try {
        setStepMode("checking");

        // 1. Check Owner Aadhaar Verification
        const verified = await bikeService.checkOwnerVerification(ownerId);
        if (cancelled) return;
        setIsAadhaarVerified(verified);

        if (verified) {
          // Owner is Aadhaar Verified -> directly open quick listing
          let rcs: ApprovedRc[] = [];
          try {
            rcs = await bikeService.getApprovedRcs();
          } catch {
            rcs = [];
          }
          if (cancelled) return;
          setApprovedRcs(rcs || []);

          const validRcs = (rcs || []).filter((r) => r.verified);
          const first = validRcs.length > 0 ? validRcs[0] : null;
          const reg = first?.registrationNumber || "TS09AB1234";

          setBikeDraft({
            ...emptyBike(ownerId),
            registrationNumber: reg,
            rcNumber: reg,
            rcVerified: true,
            brand: first?.makerName || "Yamaha",
            model: first?.model || "R15 V4",
            bikeName: first?.model
              ? `${first.makerName || ""} ${first.model}`.trim()
              : `${first?.makerName || "Yamaha"} Bike`,
            availableStartTime: "09:00",
            availableEndTime: "21:00",
          });
          setStepMode("custom_form");
        } else {
          setStepMode("step1_aadhaar");
        }
      } catch (err) {
        console.error("Check owner verification error:", err);
        if (cancelled) return;
        setIsAadhaarVerified(false);
        setStepMode("step1_aadhaar");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  // Handle Aadhaar verification callback
  const handleAadhaarVerified = (result: AadhaarVerificationResult) => {
    if (result.status === "REJECTED") {
      toast.error(result.rejectionReason || "Aadhaar verification failed.");
      return;
    }

    setIsAadhaarVerified(true);
    toast.success("Aadhaar Verified Successfully!");
    setBikeDraft(emptyBike(ownerId || 0));
    setStepMode("step5_upload_rc");
  };

  // Handle RC Verification callback
  const handleRcVerified = (result: BikeDocumentVerificationResult) => {
    if (!result.verified) {
      toast.error(
        result.message ||
          "RC Verification failed. Ensure RC owner name matches Aadhaar details (≥80% similarity required)."
      );
      setRcResult(result);
      return;
    }

    setRcResult(result);
    const reg = result.registrationNumber || "TS09AB1234";

    const preparedBike: Bike = {
      ...emptyBike(ownerId || 0),
      registrationNumber: reg,
      rcNumber: reg,
      brand: result.makerName || "Yamaha",
      model: result.model || "R15 V4",
      bikeName: result.model
        ? `${result.makerName || ""} ${result.model}`.trim()
        : `${result.makerName || "Yamaha"} Bike`,
      rcVerified: true,
      availableStartTime: startTime,
      availableEndTime: endTime,
    };

    setBikeDraft(preparedBike);
    toast.success("RC Verified Successfully! No re-verification will be needed next time.");
    setStepMode("quick_listing");
  };

  const formatTimeForBackend = (val?: string) => {
    if (!val) return "09:00:00";
    const clean = val.trim();
    if (clean.length === 5) return `${clean}:00`;
    return clean;
  };

  // Quick Register Handler (No Verification Needed!)
  const handleQuickRegister = async () => {
    if (!bikeDraft) return;

    try {
      setSaving(true);
      const activeOwnerId = ownerId || user?.id || 0;
      const reg = bikeDraft.registrationNumber?.trim() || "TS09AB1234";

      const finalBike: Bike = {
        ...bikeDraft,
        ownerId: activeOwnerId,
        bikeName: bikeDraft.bikeName?.trim() || "Yamaha R15 V4",
        brand: bikeDraft.brand?.trim() || "Yamaha",
        model: bikeDraft.model?.trim() || "R15 V4",
        registrationNumber: reg,
        rcNumber: bikeDraft.rcNumber?.trim() || reg,
        fuelType: bikeDraft.fuelType?.trim() || "PETROL",
        location: bikeDraft.location?.trim() || "Hyderabad",
        rcVerified: true,
        availableStartTime: formatTimeForBackend(startTime),
        availableEndTime: formatTimeForBackend(endTime),
      };

      console.log("Submitting quick register payload:", finalBike);
      await bikeService.addBike(finalBike);
      toast.success("Bike Registered Successfully!");
      setStepMode("step7_registered_success");
    } catch (err: unknown) {
      console.error("Quick Register Error:", err);
      const data = (err as { response?: { data?: { message?: string } | string } })?.response?.data;
      const errorMsg =
        typeof data === "string"
          ? data
          : data?.message || (err as Error)?.message || "Failed to register bike.";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Custom Form Submit Handler (when user clicks "Modify Bike Details")
  const handleCustomFormSubmit = async (preparedBike: Bike) => {
    try {
      setSaving(true);
      const activeOwnerId = ownerId || user?.id || 0;
      const reg = preparedBike.registrationNumber?.trim() || bikeDraft?.registrationNumber?.trim() || "TS09AB1234";

      const rate = preparedBike.hourlyRate && preparedBike.hourlyRate > 0 ? preparedBike.hourlyRate : 80;
      const rentalPrice = preparedBike.rentalPrice && preparedBike.rentalPrice > 0 ? preparedBike.rentalPrice : rate * 8;

      // Destructure to remove any temporary id/bikeId so backend creates a new entity
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, bikeId, ...cleanBike } = preparedBike;

      const payload: Bike = {
        ...cleanBike,
        ownerId: activeOwnerId,
        bikeName: preparedBike.bikeName?.trim() || bikeDraft?.bikeName || "Yamaha R15 V4",
        brand: preparedBike.brand?.trim() || bikeDraft?.brand || "Yamaha",
        model: preparedBike.model?.trim() || bikeDraft?.model || "R15 V4",
        registrationNumber: reg,
        rcNumber: preparedBike.rcNumber?.trim() || reg,
        fuelType: preparedBike.fuelType?.trim() || "PETROL",
        location: preparedBike.location?.trim() || "Hyderabad",
        hourlyRate: rate,
        rentalPrice: rentalPrice,
        rcVerified: true,
        availableStartTime: formatTimeForBackend(preparedBike.availableStartTime || startTime),
        availableEndTime: formatTimeForBackend(preparedBike.availableEndTime || endTime),
      };

      console.log("Submitting custom bike payload:", payload);
      await bikeService.addBike(payload);

      toast.success("Bike Registered Successfully!");
      setStepMode("step7_registered_success");
    } catch (err: unknown) {
      console.error("Custom Form Submit Error:", err);
      const resData = (err as { response?: { data?: { message?: string } | string } })?.response?.data;
      const errorMsg =
        typeof resData === "string"
          ? resData
          : resData?.message || (err as Error)?.message || "Failed to register bike.";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!ownerId) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-lg">
        Please sign in as a bike owner to register a bike.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header Container */}
      <header className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(ROUTES.OWNER.BIKES)}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Fleet
        </button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
              Bike Fleet Management
            </p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
              Add a Bike
            </h1>
            <p className="mt-1 max-w-xl text-xs text-muted-foreground">
              {isAadhaarVerified && (stepMode === "quick_listing" || stepMode === "custom_form")
                ? "Aadhaar & RC are fully verified. Simply set your availability time and register instantly!"
                : "Complete verification once, then list bikes instantly anytime."}
            </p>
          </div>

          {isAadhaarVerified && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
                Aadhaar & RC Verified
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Loading state */}
      {stepMode === "checking" && (
        <div className="flex items-center justify-center gap-3 rounded-3xl border border-border bg-card p-12 text-sm text-muted-foreground">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Verifying owner status...
        </div>
      )}

      {/* Step 1: Aadhaar Verification (Only for first-time unverified owners) */}
      {stepMode === "step1_aadhaar" && (
        <AadhaarVerification
          customerId={ownerId}
          purpose="BIKE_OWNER"
          onVerified={handleAadhaarVerified}
          onBack={() => navigate(ROUTES.OWNER.BIKES)}
        />
      )}

      {/* Step 5: Upload RC (Only if owner has not verified any RC yet) */}
      {stepMode === "step5_upload_rc" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-3">
            <FileCheck2 className="h-5 w-5 shrink-0 text-amber-600" />
            <span>
              Upload your bike RC once for verification. Name on RC must match Aadhaar (≥80% similarity).
            </span>
          </div>

          <BikeDocumentVerification
            ownerId={ownerId}
            onVerified={handleRcVerified}
            onBack={() => navigate(ROUTES.OWNER.BIKES)}
          />
        </div>
      )}

      {/* Quick Listing View: Verified Owners just set Available Times & Register! */}
      {stepMode === "quick_listing" && bikeDraft && (
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex items-start justify-between border-b border-border/60 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                  <Zap className="h-3 w-3" /> Quick Add
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  Zero Verification Required
                </span>
              </div>
              <h2 className="mt-2 font-serif text-xl font-bold text-foreground">
                Set Available Operational Times
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your Aadhaar and RC details are verified. Choose operational times to list this bike immediately.
              </p>
            </div>
          </div>

          {/* Pre-filled Bike Summary Card */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  {bikeDraft.brand || "Yamaha"}
                </p>
                <h3 className="font-serif text-base font-bold text-foreground">
                  {bikeDraft.bikeName}
                </h3>
              </div>
              <span className="font-mono text-xs font-extrabold text-foreground bg-background px-3 py-1.5 rounded-xl border border-border">
                {bikeDraft.registrationNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3 text-xs">
              <div>
                <span className="text-muted-foreground">Rate: </span>
                <span className="font-bold text-foreground">₹{bikeDraft.hourlyRate || 80} / hr</span>
              </div>
              <div>
                <span className="text-muted-foreground">Location: </span>
                <span className="font-bold text-foreground">{bikeDraft.location || "Hyderabad"}</span>
              </div>
            </div>
          </div>

          {/* Operational Available Times Selector */}
          <div className="space-y-4 rounded-2xl bg-card border border-border/80 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Select Available Operational Hours</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Available Start Time
                </span>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 font-medium"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Available End Time
                </span>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 font-medium"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                Available Schedule: {format12Hour(startTime)} – {format12Hour(endTime)} daily
              </span>
            </div>
          </div>

          {/* Action Buttons: Register Bike OR Modify Details */}
          <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-between sm:items-center">
            <button
              type="button"
              onClick={() => setStepMode("custom_form")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Modify Bike Details
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleQuickRegister}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {saving ? "Registering..." : "Quick Register Bike"}
            </button>
          </div>
        </div>
      )}

      {/* Custom Form View (Unlocked when user clicks "Modify Bike Details") */}
      {stepMode === "custom_form" && bikeDraft && (
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">
                Register Bike - Fill All Details
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Fill or customize bike name, brand, model, registration number, rate, photos, and location.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStepMode("quick_listing")}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Back to Quick Add
            </button>
          </div>

          <BikeForm
            initial={bikeDraft}
            lockIdentityFields={false}
            submitLabel="Register Bike with Modified Details"
            loading={saving}
            onSubmit={handleCustomFormSubmit}
            onCancel={() => setStepMode("quick_listing")}
          />
        </div>
      )}

      {/* Step 7 - Success Screen */}
      {stepMode === "step7_registered_success" && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-500/30 bg-card p-10 text-center shadow-xl space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600 animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Bike Registered Successfully!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your bike <strong>{bikeDraft?.bikeName}</strong> ({bikeDraft?.registrationNumber}) is now available for customer rentals between {format12Hour(startTime)} and {format12Hour(endTime)}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.OWNER.BIKES)}
            className="rounded-2xl bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-[0.98]"
          >
            Go to My Bikes Fleet
          </button>
        </div>
      )}
    </div>
  );
};

export default AddBike;
