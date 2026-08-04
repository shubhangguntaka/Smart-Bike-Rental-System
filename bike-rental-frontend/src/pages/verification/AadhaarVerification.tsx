import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";

import UploadBox from "../../components/verification/UploadBox";
import DocumentScanner from "../../components/verification/DocumentScanner";
import DocumentStamp from "../../components/verification/DocumentStamp";

import { verifyAadhaar } from "../../services/verificationService";
import { withMinDuration } from "../../utils/scan";
import type { AadhaarVerificationResult } from "../../types/verification";

interface Props {
  // Passed up so a later Driving License upload can be cross-checked
  // against this Aadhaar record on the backend.
  onVerified?: (result: AadhaarVerificationResult) => void;
  // Lets the person leave this step (e.g. return to the dashboard)
  // if they landed here by mistake.
  onBack?: () => void;
}

const SCAN_STEPS = [
  "Reading document",
  "Locating secure QR",
  "Verifying UIDAI signature",
  "Cross-checking details",
];

// The checklist above advances one step every 900ms - keep the
// perceived scan at least that long end-to-end (plus a small buffer
// for the final "all checked" beat) so a fast backend response can't
// cut the animation off mid-step.
const MIN_SCAN_MS = SCAN_STEPS.length * 900 + 500;

const AadhaarVerification = ({ onVerified, onBack }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AadhaarVerificationResult | null>(null);
  const [error, setError] = useState("");

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  };

  const handleVerify = async () => {
    if (!file) {
      setError("Please select an Aadhaar image.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await withMinDuration(() => verifyAadhaar(file), MIN_SCAN_MS);

      setResult(data);
      onVerified?.(data);
    } catch (err) {
      console.error(err);
      setError("Aadhaar verification failed. Please try a clearer image.");
    } finally {
      setLoading(false);
    }
  };

  // Wipes the current attempt so a new document can be picked from
  // scratch. This is the only way back once a result has come in -
  // previously the upload control disappeared as soon as a result
  // arrived, so a wrong/rejected upload had no way to be corrected.
  const handleStartOver = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  };

  const rejected = result?.status === "REJECTED";

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
            Back
          </button>
        )}

        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
          Identity Check · Step 1 of 2
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold">Aadhaar Verification</h1>
        <p className="mt-1 text-sm text-parchment/70">
          Upload a clear photo of your Aadhaar card. We'll read the secure QR and confirm
          it's genuine.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">

        {/* Left: document / scanner */}
        <div className="flex flex-col gap-4">
          {!preview ? (
            <UploadBox
              onFileSelect={handleFileSelect}
              title="Upload Aadhaar card"
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
              {loading ? "Scanning..." : "Scan & Verify Aadhaar"}
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
                  key={result.id}
                  label={result.stampLabel ?? result.status}
                  color={result.stampColor}
                  message={rejected ? result.rejectionReason : null}
                />

                {!rejected && (
                  <div className="mt-5 grid grid-cols-1 gap-4 border-t border-ink/10 pt-5">
                    <Info title="Name" value={result.customerName} />
                    <Info title="Aadhaar Number" value={result.aadhaarNumber} mono />
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

export default AadhaarVerification;
