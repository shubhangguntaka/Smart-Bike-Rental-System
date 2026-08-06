import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  BadgeCheck,
  BadgeX,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  FileCheck2,
} from "lucide-react";

import UploadBox from "../../components/verification/UploadBox";
import DocumentScanner from "../../components/verification/DocumentScanner";
import DocumentStamp from "../../components/verification/DocumentStamp";

import { verifyBikeDocument } from "../../services/verificationService";
import bikeService from "../../services/bikeService";
import { withMinDuration } from "../../utils/scan";
import type { BikeDocumentVerificationResult } from "../../types/verification";

interface Props {
  ownerId?: number;
  bikeId?: number;
  onVerified?: (result: BikeDocumentVerificationResult) => void;
  onBack?: () => void;
}

const SCAN_STEPS = [
  "Reading Registration Certificate (RC)",
  "Extracting vehicle & owner details via OCR",
  "Checking registration uniqueness",
  "Fuzzy matching RC name with Aadhaar (≥80% match)",
];

const MIN_SCAN_MS = SCAN_STEPS.length * 900 + 400;

const BikeDocumentVerification = ({ ownerId, bikeId, onVerified, onBack }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BikeDocumentVerificationResult | null>(null);
  const [error, setError] = useState("");

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  };

  const handleVerify = async () => {
    if (!file) {
      setError("Please upload the bike's Registration Certificate (RC) image.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await withMinDuration(
        () =>
          ownerId !== undefined
            ? bikeService.verifyBikeRC(file, ownerId, bikeId)
            : verifyBikeDocument(file, ownerId, bikeId),
        MIN_SCAN_MS
      );

      setResult(data);

      if (!data.verified) {
        setError(data.message || "RC Verification Failed. Name mismatch or invalid RC.");
      }

      onVerified?.(data);
    } catch (err: unknown) {
      console.error(err);
      const serverMsg = (err as { response?: { data?: { message?: string } | string } })?.response?.data;
      const errorText =
        typeof serverMsg === "string"
          ? serverMsg
          : serverMsg?.message || "RC Verification failed. Please ensure the document is clear and readable.";
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  };

  const rejected = !!result && !result.verified;

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-card shadow-2xl backdrop-blur-xl">
      {/* Header Band */}
      <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
              Bike Document Check
            </p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
              Registration Certificate (RC) Verification
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload your bike RC. We will read the RC details and match the owner name with your verified Aadhaar (≥80% match required).
            </p>
          </div>
          <div className="hidden rounded-2xl bg-primary/10 p-3.5 text-primary sm:block">
            <FileCheck2 className="h-7 w-7" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-2">
        {/* Left Column: Upload & Scanner */}
        <div className="flex flex-col gap-4">
          {!preview ? (
            <UploadBox
              onFileSelect={handleFileSelect}
              title="Upload Bike RC Image"
              subtitle="Front side, registration & owner name clearly visible"
            />
          ) : (
            <>
              <DocumentScanner imageSrc={preview} scanning={loading} steps={SCAN_STEPS} />
              {!loading && !result && (
                <UploadBox onFileSelect={handleFileSelect} title="" preview={preview} />
              )}
            </>
          )}

          {preview && !result && (
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || !file}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={18} />
              {loading ? "Scanning & Matching Name..." : "Verify RC Document"}
            </button>
          )}

          {result && (
            <button
              type="button"
              onClick={handleStartOver}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition ${
                rejected
                  ? "bg-destructive text-destructive-foreground hover:opacity-90"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <RotateCcw size={16} />
              {rejected ? "Try a different RC document" : "Upload another RC document"}
            </button>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/10 p-4 text-xs font-semibold text-destructive border border-destructive/20">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Result Status & Extracted Metadata */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-serif text-base font-semibold text-foreground">
                  RC Verification Pending
                </h3>
                <p className="max-w-xs text-xs text-muted-foreground">
                  OCR will extract registration number, owner name, maker, and fuzzy match against Aadhaar.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl border p-6 shadow-lg ${
                  rejected
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-emerald-500/30 bg-emerald-500/5"
                }`}
              >
                <DocumentStamp
                  key={result.registrationNumber + result.status}
                  label={result.stampLabel ?? result.status}
                  color={result.stampColor}
                  message={result.message}
                />

                {result.verified && (
                  <div className="mt-5 space-y-4 border-t border-border/60 pt-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Info title="RC Owner Name" value={result.ownerName} />
                      <Info title="Registration Number" value={result.registrationNumber} mono />
                      <Info title="Maker & Model" value={[result.makerName, result.model].filter(Boolean).join(" · ") || null} />
                      <Info title="Vehicle Class" value={result.vehicleClass} />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <MatchBadge label="QR Verified" ok={result.qrVerified} />
                      {ownerId !== undefined && (
                        <MatchBadge
                          label="Aadhaar Name Match ≥ 80%"
                          ok={result.ownerAadhaarNameMatched}
                        />
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

interface InfoProps {
  title: string;
  value: string | null;
  mono?: boolean;
}

const Info = ({ title, value, mono }: InfoProps) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
    <p className={`mt-0.5 text-xs font-extrabold text-foreground ${mono ? "font-mono tracking-wider" : ""}`}>
      {value || "—"}
    </p>
  </div>
);

const MatchBadge = ({ label, ok }: { label: string; ok: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
      ok ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/15 text-destructive"
    }`}
  >
    {ok ? <BadgeCheck size={14} /> : <BadgeX size={14} />}
    {label}
  </span>
);

export default BikeDocumentVerification;
