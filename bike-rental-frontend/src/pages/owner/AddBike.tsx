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
  FileText,
  ChevronRight,
  Plus,
  BadgeCheck,
  Building,
  MapPin,
} from "lucide-react";

import useAuth from "@/hooks/useAuth";
import BikeForm from "@/components/bike/BikeForm";
import bikeService, { type ApprovedRc } from "@/services/bikeService";
import { emptyBike, type Bike } from "@/types/bike";
import { notifyBikeUpdated } from "@/utils/syncUtils";
import type {
  AadhaarVerificationResult,
  BikeDocumentVerificationResult,
} from "@/types/verification";
import AadhaarVerification from "@/pages/verification/AadhaarVerification";
import BikeDocumentVerification from "@/pages/owner/BikeDocumentVerification";
import { ROUTES } from "@/constants/routes";
import { format12Hour, parse12HourTo24 } from "@/utils/timeUtils";

type StepMode =
  | "step1_details"
  | "step2_aadhaar"
  | "step3_rc"
  | "step4_success";

const AddBike = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ownerId = user?.id;

  const [isAadhaarVerified, setIsAadhaarVerified] = useState<boolean | null>(null);
  const [approvedRcs, setApprovedRcs] = useState<ApprovedRc[]>([]);
  const [stepMode, setStepMode] = useState<StepMode>("step1_details");

  const [bikeDraft, setBikeDraft] = useState<Bike | null>(null);
  const [verifyingStatus, setVerifyingStatus] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize draft bike on mount
  useEffect(() => {
    if (!ownerId) return;
    setBikeDraft(emptyBike(ownerId));

    // Pre-check owner Aadhaar & RC status silently in background
    (async () => {
      try {
        const verified = await bikeService.checkOwnerVerification(ownerId);
        setIsAadhaarVerified(verified);
        if (verified) {
          try {
            const rcs = await bikeService.getApprovedRcs();
            setApprovedRcs(rcs || []);
          } catch {
            setApprovedRcs([]);
          }
        }
      } catch (err) {
        console.error("Initial check error:", err);
      }
    })();
  }, [ownerId]);

  const formatTimeForBackend = (val?: string) => {
    if (!val) return "09:00:00";
    const parsed24 = parse12HourTo24(val.trim());
    if (parsed24.length === 5) return `${parsed24}:00`;
    return parsed24;
  };

  // STEP 1: Details Filled -> Move to Document Verification
  const handleDetailsSubmitted = async (preparedBike: Bike) => {
    setBikeDraft(preparedBike);

    if (!ownerId) {
      toast.error("Owner session expired. Please sign in again.");
      return;
    }

    try {
      setVerifyingStatus(true);
      // Check Aadhaar verification status
      const aadhaarOk = await bikeService.checkOwnerVerification(ownerId);
      setIsAadhaarVerified(aadhaarOk);

      if (!aadhaarOk) {
        toast("Bike details saved! Step 2: Verify your Aadhaar identity.", { icon: "ℹ️" });
        setStepMode("step2_aadhaar");
      } else {
        // Aadhaar already verified -> skip directly to RC verification
        let rcs: ApprovedRc[] = [];
        try {
          rcs = await bikeService.getApprovedRcs();
          setApprovedRcs(rcs || []);
        } catch {
          setApprovedRcs([]);
        }

        toast.success("Aadhaar is already verified! Next step: Verify Vehicle RC.");
        setStepMode("step3_rc");
      }
    } catch (err) {
      console.error("Error checking verification:", err);
      setStepMode("step2_aadhaar");
    } finally {
      setVerifyingStatus(false);
    }
  };

  // STEP 2: Aadhaar Verified -> Move to RC Verification
  const handleAadhaarVerified = (result: AadhaarVerificationResult) => {
    if (result.status === "REJECTED") {
      toast.error(result.rejectionReason || "Aadhaar verification failed.");
      return;
    }

    setIsAadhaarVerified(true);
    toast.success("Aadhaar Verified Successfully! Proceeding to RC Verification.");
    setStepMode("step3_rc");
  };

  // Final Registration API Call
  const registerBikeFinal = async (regNumOverride?: string) => {
    setSaving(true);
    const activeOwnerId = ownerId || user?.id;
    if (!activeOwnerId) {
      toast.error("Authentication required to register bike.");
      setSaving(false);
      return;
    }

    const name = (bikeDraft?.bikeName && bikeDraft.bikeName.trim()) || "Bike";
    const brandStr = (bikeDraft?.brand && bikeDraft.brand.trim()) || "Brand";
    const modelStr = (bikeDraft?.model && bikeDraft.model.trim()) || "Model";
    const fuelStr = (bikeDraft?.fuelType && bikeDraft.fuelType.trim()) || "PETROL";
    const locStr = (bikeDraft?.location && bikeDraft.location.trim()) || "City Center";
    const reg = (regNumOverride || (bikeDraft?.registrationNumber && bikeDraft.registrationNumber.trim()) || "").toUpperCase();
    const rcStr = (bikeDraft?.rcNumber && bikeDraft.rcNumber.trim()) || reg;

    const rate = bikeDraft?.hourlyRate && bikeDraft.hourlyRate > 0 ? bikeDraft.hourlyRate : 80;
    const rentalPrice = bikeDraft?.rentalPrice && bikeDraft.rentalPrice > 0 ? bikeDraft.rentalPrice : rate * 8;

    const defaultPhoto = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80";
    const photoUrl = (bikeDraft?.imageUrl && bikeDraft.imageUrl.trim()) || defaultPhoto;
    const photoList = bikeDraft?.imageUrls && bikeDraft.imageUrls.length > 0 ? bikeDraft.imageUrls : [photoUrl];

    const payload: Bike = {
      ownerId: activeOwnerId,
      bikeName: name,
      brand: brandStr,
      model: modelStr,
      registrationNumber: reg,
      rcNumber: rcStr,
      fuelType: fuelStr,
      location: locStr,
      latitude: bikeDraft?.latitude ?? undefined,
      longitude: bikeDraft?.longitude ?? undefined,
      hourlyRate: rate,
      rentalPrice: rentalPrice,
      rcVerified: true,
      bikeStatus: "AVAILABLE",
      availableStartTime: formatTimeForBackend(bikeDraft?.availableStartTime || "09:00"),
      availableEndTime: formatTimeForBackend(bikeDraft?.availableEndTime || "21:00"),
      availableDate: new Date().toISOString().split("T")[0],
      imageUrl: photoUrl,
      imageUrls: photoList,
    };

    try {
      console.log("Submitting final bike payload:", payload);
      const created = await bikeService.addBike(payload);
      const saved = created || payload;
      setBikeDraft(saved);

      // Save locally so My Bikes renders it immediately
      const cached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
      const filtered = cached.filter((b) => (b.registrationNumber || "").trim().toUpperCase() !== reg.toUpperCase());
      filtered.unshift(saved);
      localStorage.setItem("custom_owner_bikes", JSON.stringify(filtered));
      localStorage.setItem("local_owner_bikes", JSON.stringify(filtered));

      // Clear deleted_bike_keys entry for this bike registration & name
      const deletedKeys: string[] = JSON.parse(localStorage.getItem("deleted_bike_keys") || "[]");
      const updatedDeletedKeys = deletedKeys.filter((k) => k.toUpperCase() !== reg.toUpperCase() && k.toUpperCase() !== name.toUpperCase());
      localStorage.setItem("deleted_bike_keys", JSON.stringify(updatedDeletedKeys));

      notifyBikeUpdated(saved);
      toast.success("Bike Listed Successfully!");
      setStepMode("step4_success");
    } catch (err: any) {
      console.error("Backend addBike error:", err);
      const serverMsg = err.response?.data?.message || err.message || "Failed to register bike on backend.";
      toast.error(serverMsg);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // STEP 3: RC Verified -> Trigger Registration
  const handleRcVerified = (result: BikeDocumentVerificationResult) => {
    if (!result.verified) {
      toast.error(
        result.message ||
          "RC Verification failed. Please ensure the RC document is clear and matches the bike registration number."
      );
      return;
    }

    const reg = result.registrationNumber || bikeDraft?.registrationNumber || "";

    // Update draft with OCR extracted metadata
    setBikeDraft((prev) =>
      prev
        ? {
            ...prev,
            registrationNumber: reg,
            rcNumber: reg,
            brand: result.makerName || prev.brand,
            model: result.model || prev.model,
            bikeName: result.model
              ? `${result.makerName || prev.brand} ${result.model}`.trim()
              : prev.bikeName,
            rcVerified: true,
          }
        : prev
    );

    toast.success("RC Verified! Finalizing listing...");
    registerBikeFinal(reg);
  };

  if (!ownerId) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-lg">
        Please sign in as a bike owner to register a bike.
      </div>
    );
  }

  // Stepper calculations
  const steps = [
    { id: "step1_details", number: 1, title: "Bike Details", desc: "Specifications & Pricing" },
    { id: "step2_aadhaar", number: 2, title: "Aadhaar Identity", desc: "Owner Verification" },
    { id: "step3_rc", number: 3, title: "RC Document", desc: "Vehicle Verification" },
    { id: "step4_success", number: 4, title: "Live Listing", desc: "Fleet Ready" },
  ];

  const currentStepIndex =
    stepMode === "step1_details"
      ? 0
      : stepMode === "step2_aadhaar"
      ? 1
      : stepMode === "step3_rc"
      ? 2
      : 3;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header Container */}
      <header className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(ROUTES.OWNER.BIKES)}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Fleet
        </button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
              Owner Onboarding Flow
            </p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
              Add a Bike to Your Fleet
            </h1>
            <p className="mt-1 max-w-xl text-xs text-muted-foreground">
              Fill in your bike details first, then quickly verify owner Aadhaar & RC to publish your listing.
            </p>
          </div>

          {isAadhaarVerified && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
                Aadhaar Pre-Verified
              </span>
            </div>
          )}
        </div>

        {/* Stepper Progress Bar */}
        <div className="mt-6 border-t border-border/60 pt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {steps.map((st, idx) => {
              const isCompleted = idx < currentStepIndex || (idx === 1 && isAadhaarVerified);
              const isActive = idx === currentStepIndex;

              return (
                <div
                  key={st.id}
                  className={`flex items-start gap-3 rounded-2xl border p-3 transition ${
                    isActive
                      ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                      : isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border/60 bg-muted/20 opacity-60"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : st.number}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        isActive
                          ? "text-primary"
                          : isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {st.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* STEP 1: Fill Bike Details First */}
      {stepMode === "step1_details" && bikeDraft && (
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  <SlidersHorizontal className="h-3 w-3" /> Step 1 of 3
                </span>
                <span className="text-xs font-bold text-foreground">Fill Bike Details</span>
              </div>
              <h2 className="mt-1 font-serif text-lg font-bold text-foreground">
                Enter Vehicle Specifications & Pricing
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Enter bike name, registration number, rental price, location, and photos. Verification will follow next.
              </p>
            </div>
          </div>

          <BikeForm
            initial={bikeDraft}
            lockIdentityFields={false}
            submitLabel={verifyingStatus ? "Verifying..." : "Proceed to Document Verification →"}
            loading={verifyingStatus}
            onSubmit={handleDetailsSubmitted}
            onCancel={() => navigate(ROUTES.OWNER.BIKES)}
          />
        </div>
      )}

      {/* STEP 2: Aadhaar Identity Verification */}
      {stepMode === "step2_aadhaar" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20 text-xs text-primary flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>
                <strong>Step 2: Owner Aadhaar Check</strong> for listing{" "}
                <strong>{bikeDraft?.bikeName || "your bike"}</strong> ({bikeDraft?.registrationNumber}).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStepMode("step1_details")}
              className="inline-flex items-center gap-1 text-xs font-bold hover:underline shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Back to Edit Details
            </button>
          </div>

          <AadhaarVerification
            customerId={ownerId}
            purpose="BIKE_OWNER"
            onVerified={handleAadhaarVerified}
            onBack={() => setStepMode("step1_details")}
          />
        </div>
      )}

      {/* STEP 3: Bike RC Document Verification */}
      {stepMode === "step3_rc" && bikeDraft && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                    <FileCheck2 className="h-3 w-3" /> Step 3 of 3
                  </span>
                  <span className="text-xs font-bold text-emerald-600">Vehicle Verification</span>
                </div>
                <h2 className="mt-1 font-serif text-lg font-bold text-foreground">
                  Verify RC for {bikeDraft.bikeName}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Upload the Registration Certificate (RC) for registration number{" "}
                  <strong className="font-mono">{bikeDraft.registrationNumber}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStepMode("step1_details")}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Edit Details
              </button>
            </div>

            {/* Pre-filled Bike Summary Card */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                    {bikeDraft.brand}
                  </p>
                  <h3 className="font-serif text-base font-bold text-foreground">
                    {bikeDraft.bikeName}
                  </h3>
                </div>
                <span className="font-mono text-xs font-extrabold text-foreground bg-background px-3 py-1.5 rounded-xl border border-border">
                  {bikeDraft.registrationNumber}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Rate: </span>
                  <span className="font-bold text-foreground">₹{bikeDraft.hourlyRate || 80}/hr</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  <span className="font-bold text-foreground">{bikeDraft.location || "Hyderabad"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Hours: </span>
                  <span className="font-bold text-foreground">
                    {format12Hour(bikeDraft.availableStartTime || "09:00")} - {format12Hour(bikeDraft.availableEndTime || "21:00")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Register option if owner has matching approved RC */}
            {approvedRcs.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <BadgeCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Found Pre-Approved RC in Your Profile
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      You have verified RCs on record. You can list directly without re-uploading documents.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => registerBikeFinal()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {saving ? "Listing..." : "Instant Register Bike"}
                </button>
              </div>
            )}
          </div>

          <BikeDocumentVerification
            ownerId={ownerId}
            registrationNumber={bikeDraft.registrationNumber}
            onVerified={handleRcVerified}
            onBack={() => setStepMode("step1_details")}
          />
        </div>
      )}

      {/* STEP 4: Success Screen */}
      {stepMode === "step4_success" && (
        (() => {
          const displayBike = bikeDraft || {
            bikeName: "KTM Duke 390",
            brand: "KTM",
            registrationNumber: "TS09AB1234",
            location: "Hyderabad",
            availableStartTime: "09:00",
            availableEndTime: "21:00",
          };

          return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-500/30 bg-card p-10 text-center shadow-xl space-y-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div className="space-y-2 max-w-md">
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Bike Listed Successfully!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your bike <strong>{displayBike.bikeName}</strong> (
                  <span className="font-mono font-bold text-foreground">{displayBike.registrationNumber}</span>) is now active and ready for customer rentals.
                </p>
              </div>

              {/* Published Card Details */}
              <div className="w-full max-w-md rounded-2xl border border-border bg-muted/20 p-5 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {displayBike.brand}
                    </p>
                    <p className="font-serif text-base font-bold text-foreground">{displayBike.bikeName}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified & Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Hours</p>
                      <p className="font-bold text-foreground">
                        {format12Hour(displayBike.availableStartTime || "09:00")} – {format12Hour(displayBike.availableEndTime || "21:00")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Location</p>
                      <p className="font-bold text-foreground truncate">{displayBike.location || "Hyderabad"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.OWNER.BIKES)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-[0.98]"
                >
                  <Building className="h-4 w-4" />
                  Go to My Bikes Fleet
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBikeDraft(emptyBike(ownerId));
                    setStepMode("step1_details");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-bold text-foreground transition hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Bike
                </button>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};

export default AddBike;
