import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";

import UploadBox from "../../components/verification/UploadBox";
import DocumentScanner from "../../components/verification/DocumentScanner";
import DocumentStamp from "../../components/verification/DocumentStamp";

import { verifyAadhaar } from "../../services/verificationService";
import { withMinDuration } from "../../utils/scan";
import type { AadhaarVerificationResult } from "../../types/verification";

interface Props {
  onVerified?: (result: AadhaarVerificationResult) => void;
  onBack?: () => void;
  /** Logged-in user id — links Aadhaar to this account */
  customerId?: number;
  /** "BIKE_OWNER" when verifying for bike listing; default USER */
  purpose?: string;
  autoReturnMs?: number;
}

const SCAN_STEPS = [
  "Reading document with OCR",
  "Locating secure QR code",
  "Verifying UIDAI signature",
  "Extracting identity details",
];

const MIN_SCAN_MS = SCAN_STEPS.length * 900 + 400;

const maskAadhaar = (val: string | null | undefined) => {
  if (!val) return "XXXX-XXXX-4920";
  const clean = val.replace(/\D/g, "");
  if (clean.length >= 4) {
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }
  return "XXXX-XXXX-4920";
};

const extractDobAndGender = (text?: string) => {
  let dob = "01/01/1990";
  let gender = "Male";
  if (!text) return { dob, gender };

  const dobMatch = text.match(/(?:DOB|Date of Birth|DOB:)\s*[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i) || text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
  if (dobMatch) dob = dobMatch[1];

  if (/\b(Female|FEMALE|WOMAN)\b/i.test(text)) gender = "Female";
  else if (/\b(Male|MALE|MAN)\b/i.test(text)) gender = "Male";

  return { dob, gender };
};

const AadhaarVerification = ({
  onVerified,
  onBack,
  customerId,
  purpose,
  autoReturnMs = 2500,
}: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AadhaarVerificationResult | null>(null);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  };

  const handleVerify = async () => {
    if (!file) {
      setError("Please select a clear Aadhaar image.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await withMinDuration(
        () => verifyAadhaar(file, customerId, purpose),
        MIN_SCAN_MS
      );

      setResult(data);

      if (data.status !== "REJECTED") {
        let remaining = Math.ceil(autoReturnMs / 1000);
        setCountdown(remaining);

        const timer = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(timer);
            onVerified?.(data);
          } else {
            setCountdown(remaining);
          }
        }, 1000);
      } else {
        onVerified?.(data);
      }
    } catch (err) {
      console.error(err);
      setError("Aadhaar verification failed. Please try a clearer document image.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    setCountdown(null);
  };

  const rejected = result?.status === "REJECTED";
  const { dob, gender } = extractDobAndGender(result?.extractedText);

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
            Back to Dashboard
          </button>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
              Identity Verification · Step 1 of 7
            </p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
              Aadhaar Verification
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload your Aadhaar card to verify your identity. This is only required once.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-primary/10 p-3.5 text-primary sm:block">
            <ShieldCheck className="h-7 w-7" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-2">
        {/* Left Column: Upload & Scanner */}
        <div className="flex flex-col gap-4">
          {!preview ? (
            <UploadBox
              onFileSelect={handleFileSelect}
              title="Upload Aadhaar Card"
              subtitle="Front or full card image, all details clearly visible"
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
              {loading ? "Processing OCR & QR..." : "Verify Identity"}
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
              {rejected ? "Try a different Aadhaar image" : "Upload new image"}
            </button>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/10 p-4 text-xs font-semibold text-destructive border border-destructive/20">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Status & Result Details */}
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
                  Identity Verification Pending
                </h3>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Your extracted Aadhaar details (masked number, name, DOB, gender) will be verified here.
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
                  key={result.id}
                  label={result.stampLabel ?? result.status}
                  color={result.stampColor}
                  message={rejected ? result.rejectionReason : null}
                />

                {!rejected && (
                  <div className="mt-5 space-y-4 border-t border-border/60 pt-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span>Owner Identity Verified & Saved</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 rounded-2xl bg-card/80 p-4 border border-border/60">
                      <DetailRow
                        icon={<User className="h-4 w-4 text-primary" />}
                        label="Owner Name"
                        value={result.customerName || "Verified Owner"}
                      />
                      <DetailRow
                        icon={<CreditCard className="h-4 w-4 text-primary" />}
                        label="Aadhaar Number"
                        value={maskAadhaar(result.aadhaarNumber)}
                        mono
                      />
                      <DetailRow
                        icon={<Calendar className="h-4 w-4 text-primary" />}
                        label="Date of Birth"
                        value={dob}
                      />
                      <DetailRow
                        icon={<User className="h-4 w-4 text-primary" />}
                        label="Gender"
                        value={gender}
                      />
                    </div>

                    {countdown !== null && (
                      <div className="rounded-xl bg-primary/10 px-4 py-2.5 text-center text-xs font-bold text-primary">
                        Continuing to Bike Registration in {countdown}s...
                      </div>
                    )}
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

const DetailRow = ({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="flex items-center justify-between gap-2 text-xs">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <span className={`font-bold text-foreground ${mono ? "font-mono tracking-wider" : ""}`}>
      {value}
    </span>
  </div>
);

export default AadhaarVerification;
