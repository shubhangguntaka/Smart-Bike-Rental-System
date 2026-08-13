import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ShieldAlert, Sparkles } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import BikeForm from "@/components/bike/BikeForm";
import BikeDocumentVerification from "@/pages/owner/BikeDocumentVerification";
import bikeService from "@/services/bikeService";
import { emptyBike, type Bike } from "@/types/bike";
import type { BikeDocumentVerificationResult } from "@/types/verification";
import { ROUTES } from "@/constants/routes";

const EditBike = () => {
  const { bikeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const ownerId = user?.id;

  const [initialBike, setInitialBike] = useState<Bike | null>(null);
  const [currentBike, setCurrentBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [requiresRcReverify, setRequiresRcReverify] = useState(false);
  const [rcVerified, setRcVerified] = useState(false);
  const [rcResult, setRcResult] = useState<BikeDocumentVerificationResult | null>(null);

  useEffect(() => {
    if (!bikeId) return;

    (async () => {
      try {
        setLoading(true);

        // 1. Check local storage cache first
        const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
        const foundLocal = localCached.find(
          (b) =>
            String(b.bikeId || b.id) === String(bikeId) ||
            (b.registrationNumber &&
              b.registrationNumber.toUpperCase() === String(bikeId).toUpperCase())
        );

        if (foundLocal) {
          setInitialBike(foundLocal);
          setCurrentBike(foundLocal);
          setLoading(false);
          return;
        }

        // 2. Fetch from backend API
        const numericId = Number(bikeId);
        if (!isNaN(numericId) && numericId > 0) {
          const data = await bikeService.getBikeById(numericId);
          if (data) {
            setInitialBike(data);
            setCurrentBike(data);
            return;
          }
        }

        toast.error("Unable to load bike details.");
        navigate(ROUTES.OWNER.BIKES);
      } catch (err) {
        console.error("Error loading bike for editing:", err);
        const localCached: Bike[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
        const foundLocal = localCached.find(
          (b) =>
            String(b.bikeId || b.id) === String(bikeId) ||
            (b.registrationNumber &&
              b.registrationNumber.toUpperCase() === String(bikeId).toUpperCase())
        );
        if (foundLocal) {
          setInitialBike(foundLocal);
          setCurrentBike(foundLocal);
        } else {
          toast.error("Unable to load bike details.");
          navigate(ROUTES.OWNER.BIKES);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [bikeId, navigate]);

  const handleFormSubmit = async (updatedBike: Bike) => {
    if (!bikeId || !initialBike) return;

    const regChanged =
      updatedBike.registrationNumber?.trim().toUpperCase() !==
      initialBike.registrationNumber?.trim().toUpperCase();

    // If registration number changed, trigger mandatory RC re-verification
    if (regChanged && !rcVerified) {
      setCurrentBike(updatedBike);
      setRequiresRcReverify(true);
      toast.error("Registration Number changed. Please verify the new RC document before saving.");
      return;
    }

    try {
      setSaving(true);
      await bikeService.updateBike(Number(bikeId), {
        ...updatedBike,
        ownerId: updatedBike.ownerId || ownerId || 0,
        registrationNumber: updatedBike.registrationNumber,
        rcNumber: updatedBike.rcNumber || updatedBike.registrationNumber,
        rcVerified: regChanged ? true : initialBike.rcVerified ?? true,
      });

      toast.success("Bike Updated Successfully!");
      navigate(ROUTES.OWNER.BIKES);
    } catch (err: unknown) {
      console.error(err);
      const serverMsg = (err as { response?: { data?: { message?: string } | string } })?.response?.data;
      const errorText =
        typeof serverMsg === "string"
          ? serverMsg
          : serverMsg?.message || "Failed to update bike details.";
      toast.error(errorText);
    } finally {
      setSaving(false);
    }
  };

  const handleRcVerified = (result: BikeDocumentVerificationResult) => {
    if (!result.verified) {
      toast.error(result.message || "RC Verification failed for updated registration.");
      return;
    }

    setRcResult(result);
    setRcVerified(true);
    setRequiresRcReverify(false);

    if (currentBike) {
      const prepared = {
        ...currentBike,
        registrationNumber: result.registrationNumber || currentBike.registrationNumber,
        rcNumber: result.registrationNumber || currentBike.rcNumber,
        rcVerified: true,
      };
      setCurrentBike(prepared);
      toast.success("RC verified for new registration number! Ready to save.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="h-10 w-32 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-96 animate-pulse rounded-3xl bg-muted/60" />
      </div>
    );
  }

  if (!initialBike || !currentBike) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <header className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(ROUTES.OWNER.BIKES)}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Fleet
        </button>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
              Manage Bike Listing
            </p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
              Edit {initialBike.bikeName}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Update rental price, operational hours, specs, description, location, or images freely. Changing Registration Number triggers RC re-verification.
            </p>
          </div>
        </div>
      </header>

      {requiresRcReverify ? (
        <div className="space-y-6">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-300">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">RC Re-Verification Required</p>
              <p className="mt-0.5 opacity-90">
                You changed the Registration Number from <strong>{initialBike.registrationNumber}</strong> to <strong>{currentBike.registrationNumber}</strong>. Please upload the new bike RC for verification before saving changes.
              </p>
            </div>
          </div>

          <BikeDocumentVerification
            ownerId={ownerId}
            bikeId={Number(bikeId)}
            onVerified={handleRcVerified}
            onBack={() => setRequiresRcReverify(false)}
          />
        </div>
      ) : (
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          {rcVerified && rcResult && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-900 dark:text-emerald-300">
              <Sparkles className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold">New RC Verified Successfully</p>
                <p className="mt-0.5 opacity-90">
                  Registration: {rcResult.registrationNumber} · Owner: {rcResult.ownerName}
                </p>
              </div>
            </div>
          )}

          <BikeForm
            initial={currentBike}
            lockIdentityFields={false}
            submitLabel="Save Changes"
            loading={saving}
            onSubmit={handleFormSubmit}
            onCancel={() => navigate(ROUTES.OWNER.BIKES)}
          />
        </div>
      )}
    </div>
  );
};

export default EditBike;
