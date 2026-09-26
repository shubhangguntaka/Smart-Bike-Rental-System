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
  Bike as BikeIcon,
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
  registrationNumber?: string;
  onVerified?: (result: BikeDocumentVerificationResult) => void;
  onBack?: () => void;
}

const SCAN_STEPS = [
  "Reading Registration Certificate (RC)",
  "Extracting vehicle & registration details via OCR",
  "Checking registration uniqueness",
  "Verifying vehicle registration number match",
];

const MIN_SCAN_MS = SCAN_STEPS.length * 900 + 400;

const BikeDocumentVerification = ({ ownerId, bikeId, registrationNumber, onVerified, onBack }: Props) => {
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
            ? bikeService.verifyBikeRC(file, ownerId, bikeId, registrationNumber)
            : verifyBikeDocument(file, ownerId, bikeId, registrationNumber),
        MIN_SCAN_MS
      );

      setResult(data);

      if (!data.verified) {
        setError(data.message || "RC Verification Failed. Could not verify registration details.");
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

  const isRegMatched = Boolean(
    result?.verified &&
    result?.registrationNumber &&
    (!registrationNumber ||
      result.registrationNumber.replace(/[\s-]/g, "").toUpperCase() ===
        registrationNumber.replace(/[\s-]/g, "").toUpperCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-xl">
      {/* Header Band */}
      <div className="border-b border-border bg-muted/40 px-4 py-5 sm:px-8 sm:py-6">
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

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
              Bike Document Verification
            </p>
            <h1 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-foreground">
              Registration Certificate (RC) Verification
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Upload the bike's RC. We extract registration details and verify the number against your vehicle.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-primary/10 p-3.5 text-primary sm:block shrink-0">
            <FileCheck2 className="h-7 w-7" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:p-8 md:grid-cols-2">
        {/* Left Column: Upload & Scanner */}
        <div className="flex flex-col gap-4">
          {!preview ? (
            <UploadBox
              onFileSelect={handleFileSelect}
              title="Upload Bike RC Image"
              subtitle="Front or smart card side with registration number clearly visible"
            />
          ) : (
            <>
              <DocumentScanner
                imageSrc={preview}
                scanning={loading}
                steps={SCAN_STEPS}
                hasError={rejected || Boolean(error)}
              />
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
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-primary/20"
            >
              <Sparkles size={18} />
              {loading ? "Scanning & Extracting RC..." : "Verify RC Document"}
            </button>
          )}

          {result && (
            <button
              type="button"
              onClick={handleStartOver}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-bold transition ${
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
                className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 sm:px-6 sm:py-12 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-serif text-base font-semibold text-foreground">
                  RC Verification Pending
                </h3>
                <p className="max-w-xs text-xs text-muted-foreground">
                  OCR will extract registration number, vehicle class, make, and verify match against bike details.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl border p-4 sm:p-6 shadow-lg ${
                  rejected
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-emerald-500/30 bg-emerald-500/5"
                }`}
              >
                <DocumentStamp
                  key={(result.registrationNumber || "") + result.status}
                  label={result.stampLabel ?? result.status}
                  color={result.stampColor}
                  message={result.message}
                />

                <div className="mt-5 space-y-4 border-t border-border/60 pt-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Info title="Extracted Regn Number" value={result.registrationNumber} mono />
                    {registrationNumber && (
                      <Info title="Bike Regn Number" value={registrationNumber} mono />
                    )}
                    <Info title="Registration Match" value={isRegMatched ? "MATCHED" : "MISMATCH"} highlight={isRegMatched} />
                    <Info title="RC Owner Name" value={result.ownerName || "Not Detected"} />
                    <Info title="Vehicle Class" value={result.vehicleClass || "Motor Cycle"} />
                    <Info title="Make & Model" value={[result.makerName, result.model].filter(Boolean).join(" · ") || "—"} />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <MatchBadge label="QR Verified" ok={Boolean(result?.verified && result?.qrVerified)} />
                    <MatchBadge label="Vehicle Number Matched" ok={isRegMatched} />
                  </div>
                </div>
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
  highlight?: boolean;
}

const Info = ({ title, value, mono, highlight }: InfoProps) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
    <p
      className={`mt-0.5 text-xs font-extrabold ${
        highlight !== undefined
          ? highlight
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-destructive"
          : "text-foreground"
      } ${mono ? "font-mono tracking-wider" : ""}`}
    >
      {value || "—"}
    </p>
  </div>
);

const MatchBadge = ({ label, ok }: { label: string; ok: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
      ok
        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
        : "bg-destructive/15 text-destructive border border-destructive/20"
    }`}
  >
    {ok ? <BadgeCheck size={14} /> : <BadgeX size={14} />}
    {label}
  </span>
);

export default BikeDocumentVerification;
