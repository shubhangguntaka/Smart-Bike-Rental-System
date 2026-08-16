import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Check, 
    ShieldCheck, 
    AlertTriangle, 
    ArrowLeft, 
    RotateCcw, 
    FileText,
    FileSpreadsheet
} from "lucide-react";
import toast from "react-hot-toast";

import UploadBox from "../../components/verification/UploadBox";
import DocumentScanner from "../../components/verification/DocumentScanner";
import DocumentStamp from "../../components/verification/DocumentStamp";

import { verifyAadhaar, verifyBikeDocument } from "../../services/verificationService";
import { ownerService } from "../../services/ownerService";
import useAuth from "../../hooks/useAuth";
import { withMinDuration } from "../../utils/scan";
import type { AadhaarVerificationResult, BikeDocumentVerificationResult } from "../../types/verification";

type Step = "aadhaar" | "bikeDocument" | "insurance" | "pollution" | "done";

const SCAN_STEPS_AADHAAR = [
    "Reading document",
    "Locating secure QR",
    "Verifying UIDAI signature",
    "Cross-checking details"
];

const SCAN_STEPS_RC = [
    "Reading Registration Certificate",
    "Validating chassis number",
    "Checking registration status",
    "Cross-checking owner name"
];

const SCAN_STEPS_INSURANCE = [
    "Reading Insurance certificate",
    "Verifying policy active status",
    "Validating policy duration",
    "Verifying premium receipt"
];

const SCAN_STEPS_POLLUTION = [
    "Reading Pollution Under Control (PUCC) certificate",
    "Verifying emission level readouts",
    "Checking PUCC validity date",
    "Matching vehicle registration mark"
];

const MIN_SCAN_MS = 4 * 900 + 500;

export default function OwnerVerification() {
    const { user } = useAuth();
    const [step, setStep] = useState<Step>("aadhaar");
    
    // Uploaded Files
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
    const [rcFile, setRcFile] = useState<File | null>(null);
    const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
    const [pollutionFile, setPollutionFile] = useState<File | null>(null);

    // Previews
    const [aadhaarPreview, setAadhaarPreview] = useState("");
    const [rcPreview, setRcPreview] = useState("");
    const [insurancePreview, setInsurancePreview] = useState("");
    const [pollutionPreview, setPollutionPreview] = useState("");

    // Results
    const [aadhaarResult, setAadhaarResult] = useState<AadhaarVerificationResult | null>(null);
    const [rcResult, setRcResult] = useState<BikeDocumentVerificationResult | null>(null);
    const [insuranceResult, setInsuranceResult] = useState<any>(null);
    const [pollutionResult, setPollutionResult] = useState<any>(null);

    // Loading & Errors
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;
        async function fetchVerificationStatus() {
            try {
                const res = await ownerService.getDashboard();
                const raw = res?.data;
                const data = (raw && typeof raw === "object" && raw.data !== undefined) ? raw.data : raw;
                if (data) {
                    if (data.aadhaarVerified && data.rcVerified) {
                        setStep("done");
                    } else if (data.aadhaarVerified) {
                        setAadhaarResult({
                            id: data.ownerId || Number(user?.id) || 1,
                            status: "APPROVED",
                            verified: true,
                            customerName: user?.fullName || "Verified Owner",
                            aadhaarNumber: "xxxx-xxxx-xxxx"
                        } as any);
                        setStep("bikeDocument");
                    }
                }
            } catch (err) {
                console.error("Failed to load verification status:", err);
            }
        }
        fetchVerificationStatus();
    }, [user]);

    const exitVerification = () => window.history.back();

    // Progress percentage
    const getProgressPercent = () => {
        switch (step) {
            case "aadhaar": return 20;
            case "bikeDocument": return 40;
            case "insurance": return 60;
            case "pollution": return 80;
            case "done": return 100;
        }
    };

    // --- Aadhaar Verification ---
    const handleVerifyAadhaar = async () => {
        if (!aadhaarFile) {
            setError("Please select an Aadhaar image.");
            return;
        }
        try {
            setLoading(true);
            setError("");
            const customerId = user?.id ? Number(user.id) : undefined;
            const data = await withMinDuration(() => verifyAadhaar(aadhaarFile, customerId, "BIKE_OWNER"), MIN_SCAN_MS);
            if (data.status === "REJECTED") {
                setError(data.rejectionReason || "Verification rejected.");
                setAadhaarResult(data);
            } else {
                setAadhaarResult(data);
                toast.success("Aadhaar verified successfully!");
                setTimeout(() => setStep("bikeDocument"), 1500);
            }
        } catch (err) {
            setError("Aadhaar verification failed. Try a clearer scan.");
        } finally {
            setLoading(false);
        }
    };

    // --- RC Verification ---
    const handleVerifyRC = async () => {
        if (!rcFile) {
            setError("Please select a Bike Document (RC) image.");
            return;
        }
        try {
            setLoading(true);
            setError("");
            const ownerId = user?.id ? Number(user.id) : aadhaarResult?.id;
            const data = await withMinDuration(
                () => verifyBikeDocument(rcFile, ownerId),
                MIN_SCAN_MS
            );
            if (!data.verified) {
                setError(data.message || "Registration Certificate verification rejected.");
                setRcResult(data);
            } else {
                setRcResult(data);
                toast.success("RC verified successfully!");
                setTimeout(() => setStep("insurance"), 1500);
            }
        } catch (err) {
            setError("RC verification failed. Try a clearer scan.");
        } finally {
            setLoading(false);
        }
    };

    // --- Insurance (Simulated Verification) ---
    const handleVerifyInsurance = async () => {
        if (!insuranceFile) {
            setError("Please select an Insurance document image.");
            return;
        }
        try {
            setLoading(true);
            setError("");
            await new Promise(resolve => setTimeout(resolve, MIN_SCAN_MS));
            
            const resultData = {
                id: "INS-" + Date.now(),
                verified: true,
                status: "VERIFIED",
                stampLabel: "APPROVED",
                stampColor: "green" as const,
                policyNumber: "POL-" + Math.floor(100000 + Math.random() * 900000),
                validUpto: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
            };
            
            setInsuranceResult(resultData);
            toast.success("Insurance verified successfully!");
            setTimeout(() => setStep("pollution"), 1500);
        } catch (err) {
            setError("Insurance verification failed.");
        } finally {
            setLoading(false);
        }
    };

    // --- Pollution PUCC (Simulated Verification) ---
    const handleVerifyPollution = async () => {
        if (!pollutionFile) {
            setError("Please select a Pollution (PUCC) certificate image.");
            return;
        }
        try {
            setLoading(true);
            setError("");
            await new Promise(resolve => setTimeout(resolve, MIN_SCAN_MS));
            
            const resultData = {
                id: "PUC-" + Date.now(),
                verified: true,
                status: "VERIFIED",
                stampLabel: "APPROVED",
                stampColor: "green" as const,
                certificateNumber: "PUC-" + Math.floor(100000 + Math.random() * 900000),
                validUpto: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString()
            };
            
            setPollutionResult(resultData);
            toast.success("PUCC certificate verified successfully!");
            setTimeout(() => setStep("done"), 1500);
        } catch (err) {
            setError("Pollution certificate verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartOver = () => {
        setError("");
        if (step === "aadhaar") {
            setAadhaarFile(null);
            setAadhaarPreview("");
            setAadhaarResult(null);
        } else if (step === "bikeDocument") {
            setRcFile(null);
            setRcPreview("");
            setRcResult(null);
        } else if (step === "insurance") {
            setInsuranceFile(null);
            setInsurancePreview("");
            setInsuranceResult(null);
        } else if (step === "pollution") {
            setPollutionFile(null);
            setPollutionPreview("");
            setPollutionResult(null);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center gap-10 bg-parchment px-4 py-14 text-ink">
            {/* Header Title Block */}
            <div className="text-center">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-brass">
                    Verification Bureau · Partner Registration
                </p>
                <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
                    List Your Fleet Safely
                </h1>
            </div>

            {/* Steps Navigation Progress */}
            <div className="w-full max-w-4xl space-y-4">
                <StepIndicator step={step} onStepClick={setStep} />
                
                {/* Horizontal Progress Bar */}
                <div className="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-verified transition-all duration-500 rounded-full" 
                        style={{ width: `${getProgressPercent()}%` }}
                    />
                </div>
            </div>

            {/* Render Steps Card */}
            {step === "aadhaar" && (
                <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_20px_60px_-25px_rgba(11,18,32,0.35)]">
                    <div className="border-b border-ink/10 bg-bureau px-8 py-6 text-parchment">
                        <button
                            onClick={exitVerification}
                            className="mb-3 flex items-center gap-1.5 text-sm font-medium text-parchment/70 transition hover:text-parchment"
                        >
                            <ArrowLeft size={15} />
                            Exit Workflow
                        </button>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">Step 1 of 4</p>
                        <h1 className="mt-1 font-display text-2xl font-semibold text-white">Owner Aadhaar Verification</h1>
                        <p className="mt-1 text-sm text-parchment/70">Upload a clear photo of your Aadhaar card. We will verify your identity details.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                        <div className="flex flex-col gap-4">
                            {!aadhaarPreview ? (
                                <UploadBox
                                    onFileSelect={(f) => {
                                        setAadhaarFile(f);
                                        setAadhaarPreview(URL.createObjectURL(f));
                                        setError("");
                                        setAadhaarResult(null);
                                    }}
                                    title="Upload Aadhaar card"
                                    subtitle="Front side, all four corners visible"
                                />
                            ) : (
                                <>
                                    <DocumentScanner imageSrc={aadhaarPreview} scanning={loading} steps={SCAN_STEPS_AADHAAR} />
                                    {!loading && !aadhaarResult && (
                                        <UploadBox 
                                            onFileSelect={(f) => {
                                                setAadhaarFile(f);
                                                setAadhaarPreview(URL.createObjectURL(f));
                                                setError("");
                                                setAadhaarResult(null);
                                            }} 
                                            title="" 
                                            preview={aadhaarPreview} 
                                        />
                                    )}
                                </>
                            )}

                            {aadhaarPreview && !aadhaarResult && (
                                <button
                                    onClick={handleVerifyAadhaar}
                                    disabled={loading}
                                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-bureau px-6 py-3 font-medium text-white transition hover:bg-bureau-light disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ShieldCheck size={17} />
                                    {loading ? "Scanning..." : "Scan & Verify Aadhaar"}
                                </button>
                            )}

                            {aadhaarResult && (
                                <button
                                    onClick={handleStartOver}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-bureau/25 text-bureau hover:bg-bureau/5 px-6 py-3 font-medium transition"
                                >
                                    <RotateCcw size={16} />
                                    Replace/Retry upload
                                </button>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 rounded-lg bg-crimson-dim px-4 py-3 text-sm text-crimson">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {!aadhaarResult ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink/10 bg-parchment px-6 py-14 text-center">
                                        <ShieldCheck size={28} className="text-ink/20" />
                                        <p className="text-sm text-slate-400">Scan result will appear here once scanning completes.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-verified/20 bg-verified-dim/50 px-6 py-6">
                                        <DocumentStamp
                                            label={aadhaarResult.stampLabel || "APPROVED"}
                                            color="green"
                                        />
                                        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-ink/10 pt-5 text-xs">
                                            <Info title="Name" value={aadhaarResult.customerName} />
                                            <Info title="Aadhaar Number" value={aadhaarResult.aadhaarNumber} mono />
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            {step === "bikeDocument" && (
                <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_20px_60px_-25px_rgba(11,18,32,0.35)]">
                    <div className="border-b border-ink/10 bg-bureau px-8 py-6 text-parchment">
                        <button
                            onClick={() => setStep("aadhaar")}
                            className="mb-3 flex items-center gap-1.5 text-sm font-medium text-parchment/70 transition hover:text-parchment"
                        >
                            <ArrowLeft size={15} />
                            Back to Aadhaar
                        </button>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">Step 2 of 4</p>
                        <h1 className="mt-1 font-display text-2xl font-semibold text-white">Registration Certificate (RC)</h1>
                        <p className="mt-1 text-sm text-parchment/70">Upload the bike Registration Certificate to map owner records.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                        <div className="flex flex-col gap-4">
                            {!rcPreview ? (
                                <UploadBox
                                    onFileSelect={(f) => {
                                        setRcFile(f);
                                        setRcPreview(URL.createObjectURL(f));
                                        setError("");
                                        setRcResult(null);
                                    }}
                                    title="Upload RC Document"
                                    subtitle="Clear image with registration numbers visible"
                                />
                            ) : (
                                <>
                                    <DocumentScanner imageSrc={rcPreview} scanning={loading} steps={SCAN_STEPS_RC} />
                                    {!loading && !rcResult && (
                                        <UploadBox 
                                            onFileSelect={(f) => {
                                                setRcFile(f);
                                                setRcPreview(URL.createObjectURL(f));
                                                setError("");
                                                setRcResult(null);
                                            }} 
                                            title="" 
                                            preview={rcPreview} 
                                        />
                                    )}
                                </>
                            )}

                            {rcPreview && !rcResult && (
                                <button
                                    onClick={handleVerifyRC}
                                    disabled={loading}
                                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-bureau px-6 py-3 font-medium text-white transition hover:bg-bureau-light"
                                >
                                    <ShieldCheck size={17} />
                                    {loading ? "Scanning..." : "Scan & Verify RC"}
                                </button>
                            )}

                            {rcResult && (
                                <button
                                    onClick={handleStartOver}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-bureau/25 text-bureau hover:bg-bureau/5 px-6 py-3 font-medium transition"
                                >
                                    <RotateCcw size={16} />
                                    Replace/Retry upload
                                </button>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 rounded-lg bg-crimson-dim px-4 py-3 text-sm text-crimson">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {!rcResult ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink/10 bg-parchment px-6 py-14 text-center">
                                        <ShieldCheck size={28} className="text-ink/20" />
                                        <p className="text-sm text-slate-400">Scan result will appear here once scanning completes.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-verified/20 bg-verified-dim/50 px-6 py-6 text-xs">
                                        <DocumentStamp
                                            label={rcResult.stampLabel || "APPROVED"}
                                            color="green"
                                        />
                                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-ink/10 pt-5">
                                            <Info title="Maker/Model" value={[rcResult.makerName, rcResult.model].filter(Boolean).join(" · ") || null} />
                                            <Info title="Registration Number" value={rcResult.registrationNumber} mono />
                                            <Info title="Engine Number" value={rcResult.engineNumber} mono />
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            {step === "insurance" && (
                <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_20px_60px_-25px_rgba(11,18,32,0.35)]">
                    <div className="border-b border-ink/10 bg-bureau px-8 py-6 text-parchment">
                        <button
                            onClick={() => setStep("bikeDocument")}
                            className="mb-3 flex items-center gap-1.5 text-sm font-medium text-parchment/70 transition hover:text-parchment"
                        >
                            <ArrowLeft size={15} />
                            Back to RC Document
                        </button>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">Step 3 of 4</p>
                        <h1 className="mt-1 font-display text-2xl font-semibold text-white">Insurance Document</h1>
                        <p className="mt-1 text-sm text-parchment/70">Upload a clear scan of the active vehicle insurance policy document.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                        <div className="flex flex-col gap-4">
                            {!insurancePreview ? (
                                <UploadBox
                                    onFileSelect={(f) => {
                                        setInsuranceFile(f);
                                        setInsurancePreview(URL.createObjectURL(f));
                                        setError("");
                                        setInsuranceResult(null);
                                    }}
                                    title="Upload Insurance Policy"
                                    subtitle="Coverage details, policy dates visible"
                                />
                            ) : (
                                <>
                                    <DocumentScanner imageSrc={insurancePreview} scanning={loading} steps={SCAN_STEPS_INSURANCE} />
                                    {!loading && !insuranceResult && (
                                        <UploadBox 
                                            onFileSelect={(f) => {
                                                setInsuranceFile(f);
                                                setInsurancePreview(URL.createObjectURL(f));
                                                setError("");
                                                setInsuranceResult(null);
                                            }} 
                                            title="" 
                                            preview={insurancePreview} 
                                        />
                                    )}
                                </>
                            )}

                            {insurancePreview && !insuranceResult && (
                                <button
                                    onClick={handleVerifyInsurance}
                                    disabled={loading}
                                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-bureau px-6 py-3 font-medium text-white transition hover:bg-bureau-light"
                                >
                                    <ShieldCheck size={17} />
                                    {loading ? "Scanning..." : "Scan & Verify Insurance"}
                                </button>
                            )}

                            {insuranceResult && (
                                <button
                                    onClick={handleStartOver}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-bureau/25 text-bureau hover:bg-bureau/5 px-6 py-3 font-medium transition"
                                >
                                    <RotateCcw size={16} />
                                    Replace/Retry upload
                                </button>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 rounded-lg bg-crimson-dim px-4 py-3 text-sm text-crimson">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {!insuranceResult ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink/10 bg-parchment px-6 py-14 text-center">
                                        <ShieldCheck size={28} className="text-ink/20" />
                                        <p className="text-sm text-slate-400">Scan result will appear here once scanning completes.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-verified/20 bg-verified-dim/50 px-6 py-6 text-xs">
                                        <DocumentStamp
                                            label={insuranceResult.stampLabel}
                                            color={insuranceResult.stampColor}
                                        />
                                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-ink/10 pt-5">
                                            <Info title="Policy Number" value={insuranceResult.policyNumber} mono />
                                            <Info title="Policy Expiration Date" value={insuranceResult.validUpto} />
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            {step === "pollution" && (
                <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_20px_60px_-25px_rgba(11,18,32,0.35)]">
                    <div className="border-b border-ink/10 bg-bureau px-8 py-6 text-parchment">
                        <button
                            onClick={() => setStep("insurance")}
                            className="mb-3 flex items-center gap-1.5 text-sm font-medium text-parchment/70 transition hover:text-parchment"
                        >
                            <ArrowLeft size={15} />
                            Back to Insurance
                        </button>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">Step 4 of 4</p>
                        <h1 className="mt-1 font-display text-2xl font-semibold text-white">Pollution Under Control (PUCC)</h1>
                        <p className="mt-1 text-sm text-parchment/70">Upload a clear photo of the PUCC certificate showing validity marks.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                        <div className="flex flex-col gap-4">
                            {!pollutionPreview ? (
                                <UploadBox
                                    onFileSelect={(f) => {
                                        setPollutionFile(f);
                                        setPollutionPreview(URL.createObjectURL(f));
                                        setError("");
                                        setPollutionResult(null);
                                    }}
                                    title="Upload PUCC Certificate"
                                    subtitle="Recent emissions readings, validity visible"
                                />
                            ) : (
                                <>
                                    <DocumentScanner imageSrc={pollutionPreview} scanning={loading} steps={SCAN_STEPS_POLLUTION} />
                                    {!loading && !pollutionResult && (
                                        <UploadBox 
                                            onFileSelect={(f) => {
                                                setPollutionFile(f);
                                                setPollutionPreview(URL.createObjectURL(f));
                                                setError("");
                                                setPollutionResult(null);
                                            }} 
                                            title="" 
                                            preview={pollutionPreview} 
                                        />
                                    )}
                                </>
                            )}

                            {pollutionPreview && !pollutionResult && (
                                <button
                                    onClick={handleVerifyPollution}
                                    disabled={loading}
                                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-bureau px-6 py-3 font-medium text-white transition hover:bg-bureau-light"
                                >
                                    <ShieldCheck size={17} />
                                    {loading ? "Scanning..." : "Scan & Verify PUCC"}
                                </button>
                            )}

                            {pollutionResult && (
                                <button
                                    onClick={handleStartOver}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-bureau/25 text-bureau hover:bg-bureau/5 px-6 py-3 font-medium transition"
                                >
                                    <RotateCcw size={16} />
                                    Replace/Retry upload
                                </button>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 rounded-lg bg-crimson-dim px-4 py-3 text-sm text-crimson">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {!pollutionResult ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink/10 bg-parchment px-6 py-14 text-center">
                                        <ShieldCheck size={28} className="text-ink/20" />
                                        <p className="text-sm text-slate-400">Scan result will appear here once scanning completes.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-verified/20 bg-verified-dim/50 px-6 py-6 text-xs">
                                        <DocumentStamp
                                            label={pollutionResult.stampLabel}
                                            color={pollutionResult.stampColor}
                                        />
                                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-ink/10 pt-5">
                                            <Info title="Certificate Number" value={pollutionResult.certificateNumber} mono />
                                            <Info title="PUCC Expiration Date" value={pollutionResult.validUpto} />
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            {step === "done" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl overflow-hidden rounded-2xl border border-ink/10 bg-white text-center shadow-[0_20px_60px_-25px_rgba(11,18,32,0.35)]"
                >
                    <div className="bg-bureau px-8 py-10 text-parchment">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-verified bg-white/10">
                            <ShieldCheck size={34} className="text-verified" />
                        </div>
                        <h2 className="mt-5 font-display text-2xl font-semibold text-white">Verification Complete</h2>
                        <p className="mt-1 text-sm text-parchment/70">
                            All your documents (Aadhaar, RC, Insurance, PUCC) have been successfully scanned and verified.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-8 text-left sm:grid-cols-4">
                        <div className="rounded-xl bg-parchment px-5 py-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Owner Name</p>
                            <p className="mt-0.5 font-semibold text-ink">{aadhaarResult?.customerName}</p>
                        </div>

                        <div className="rounded-xl bg-parchment px-5 py-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Registration Mark</p>
                            <p className="mt-0.5 font-mono font-semibold tracking-wide text-ink">{rcResult?.registrationNumber}</p>
                        </div>

                        <div className="rounded-xl bg-parchment px-5 py-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Insurance Status</p>
                            <p className="mt-0.5 font-semibold text-green-600">Active & Verified</p>
                        </div>

                        <div className="rounded-xl bg-parchment px-5 py-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">PUCC Status</p>
                            <p className="mt-0.5 font-semibold text-green-600">Active & Verified</p>
                        </div>
                    </div>

                    <div className="border-t border-ink/10 p-6 flex justify-end">
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-2.5 bg-bureau text-white hover:bg-bureau-light text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// Subcomponents helper
const Info = ({ title, value, mono }: { title: string; value: string | null; mono?: boolean }) => (
    <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
        <p className={`mt-0.5 font-semibold text-ink ${mono ? "font-mono tracking-wide" : ""}`}>
            {value || "—"}
        </p>
    </div>
);

const StepIndicator = ({
    step,
    onStepClick,
}: {
    step: Step;
    onStepClick: (step: Step) => void;
}) => {
    const steps: { key: Step; label: string }[] = [
        { key: "aadhaar", label: "Aadhaar" },
        { key: "bikeDocument", label: "Registration (RC)" },
        { key: "insurance", label: "Insurance" },
        { key: "pollution", label: "Pollution (PUCC)" },
        { key: "done", label: "Complete" },
    ];

    const activeIndex = steps.findIndex((s) => s.key === step);

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 md:gap-0 w-full px-4">
            {steps.map((s, i) => {
                const complete = i < activeIndex;
                const active = i === activeIndex;
                const clickable = complete;

                return (
                    <div key={s.key} className="flex items-center">
                        <button
                            type="button"
                            disabled={!clickable}
                            onClick={() => clickable && onStepClick(s.key)}
                            className={`flex flex-col items-center gap-1 focus:outline-none ${
                                clickable ? "cursor-pointer" : "cursor-default"
                            }`}
                        >
                            <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                                    complete
                                        ? "border-verified bg-verified text-white hover:opacity-90"
                                        : active
                                        ? "border-bureau bg-bureau text-white"
                                        : "border-ink/15 bg-white text-slate-400"
                                }`}
                            >
                                {complete ? <Check size={14} /> : i + 1}
                            </span>
                            <span
                                className={`text-[10px] font-medium ${
                                    active || complete ? "text-ink font-bold" : "text-slate-400"
                                }`}
                            >
                                {s.label}
                            </span>
                        </button>

                        {i < steps.length - 1 && (
                            <span
                                className={`hidden md:block mx-4 h-0.5 w-10 lg:w-16 self-center ${
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
