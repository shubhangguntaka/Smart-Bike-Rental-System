import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, BadgeCheck, BadgeX, ArrowLeft, RotateCcw } from "lucide-react";

import UploadBox from "../../components/verification/UploadBox";
import DocumentScanner from "../../components/verification/DocumentScanner";
import DocumentStamp from "../../components/verification/DocumentStamp";

import { verifyDrivingLicense } from "../../services/verificationService";
import { withMinDuration } from "../../utils/scan";
import type { DrivingLicenseVerificationResult } from "../../types/verification";

interface Props {
  // If Aadhaar was verified first, pass its customerId through here
  // so the backend can cross-check the DL name against it.
  customerId?: number;
  onVerified?: (result: DrivingLicenseVerificationResult) => void;
  // Lets the person return to the previous step (re-do Aadhaar) if
  // they landed here by mistake or want to upload a different card.
  onBack?: () => void;
}

const SCAN_STEPS = [
  "Reading document",
  "Locating QR code",
  "Verifying license data",
  "Matching with Aadhaar name",
];

// Keep the perceived scan at least as long as the checklist takes to
// finish stepping through on its own (plus a small buffer for the
// final "all checked" beat), so a fast backend response can't cut
// the animation off mid-step.
const MIN_SCAN_MS = SCAN_STEPS.length * 900 + 500;

const DrivingLicenseVerification = ({ customerId, onVerified, onBack }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DrivingLicenseVerificationResult | null>(null);
  const [error, setError] = useState("");

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  };

  const handleVerify = async () => {
    if (!file) {
      setError("Please select a Driving License image.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await withMinDuration(
        () => verifyDrivingLicense(file, customerId),
        MIN_SCAN_MS
      );

      setResult(data);
      onVerified?.(data);
    } catch (err) {
      console.error(err);
      setError("Driving License verification failed. Please try a clearer image.");
    } finally {
      setLoading(false);
    }
  };

  // Wipes the current attempt so a new document can be picked from
  // scratch. Previously the upload control disappeared as soon as a
  // result arrived, so a wrong/rejected upload had no way to be
  // corrected without leaving the step entirely.
  const handleStartOver = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  };

  const rejected = !!result && !result.verified;

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_20px_60px_-25px_rgba(11,18,32,0.35)]">

      {/* Header band */}
      <div className="border-b border-ink/10 bg-bureau px-8 py-6 text-parchment">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-3 flex items-center gap-1.5 text-sm font-medium text-parchment/70 transition hover:text-parchment"
          >
            <ArrowLeft size={15} />
            Back to Aadhaar
          </button>
        )}

        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
          Identity Check · Step 2 of 2
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold">Driving License Verification</h1>
        <p className="mt-1 text-sm text-parchment/70">
          Upload a clear photo of your Driving License. We'll confirm it's valid and matches
          your Aadhaar details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">

        {/* Left: document / scanner */}
        <div className="flex flex-col gap-4">
          {!preview ? (
            <UploadBox
              onFileSelect={handleFileSelect}
              title="Upload Driving License"
              subtitle="Front side, all four corners visible"
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
              onClick={handleVerify}
              disabled={loading || !file}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-bureau px-6 py-3 font-medium text-white transition hover:bg-bureau-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck size={17} />
              {loading ? "Scanning..." : "Scan & Verify License"}
            </button>
          )}

          {result && (
            <button
              onClick={handleStartOver}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition ${
                rejected
                  ? "bg-bureau text-white hover:bg-bureau-light"
                  : "border border-bureau/25 text-bureau hover:bg-bureau/5"
              }`}
            >
              <RotateCcw size={16} />
              {rejected ? "Try a different document" : "Upload a different document"}
            </button>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-crimson-dim px-4 py-3 text-sm text-crimson">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Right: status / result */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink/10 bg-parchment px-6 py-14 text-center"
              >
                <ShieldCheck size={28} className="text-ink/20" />
                <p className="text-sm text-slate-400">
                  Your verification result will appear here once the scan completes.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border px-6 py-6 ${
                  rejected ? "border-crimson/20 bg-crimson-dim/40" : "border-verified/20 bg-verified-dim/50"
                }`}
              >
                <DocumentStamp
                  key={result.licenseNumber + result.status}
                  label={result.stampLabel ?? result.status}
                  color={result.stampColor}
                  message={result.message}
                />

                {result.verified && (
                  <div className="mt-5 space-y-5 border-t border-ink/10 pt-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Info title="Name" value={result.customerName} />
                      <Info title="License Number" value={result.licenseNumber} mono />
                      <Info title="Date of Birth" value={result.dob} />
                      <Info title="Valid Till" value={result.validTill} />
                    </div>

                    <Info title="Address" value={result.address} />

                    <div className="flex flex-wrap gap-3 pt-1">
                      <MatchBadge label="QR verified" ok={result.qrVerified} />
                      {customerId !== undefined && (
                        <MatchBadge label="Matches Aadhaar name" ok={result.aadhaarNameMatched} />
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
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
    <p className={`mt-0.5 font-semibold text-ink ${mono ? "font-mono tracking-wide" : ""}`}>
      {value || "—"}
    </p>
  </div>
);

const MatchBadge = ({ label, ok }: { label: string; ok: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
      ok ? "bg-verified-dim text-verified" : "bg-crimson-dim text-crimson"
    }`}
  >
    {ok ? <BadgeCheck size={13} /> : <BadgeX size={13} />}
    {label}
  </span>
);

export default DrivingLicenseVerification;
