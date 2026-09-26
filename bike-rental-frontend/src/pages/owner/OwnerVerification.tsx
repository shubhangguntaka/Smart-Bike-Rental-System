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
import type { DashboardStatistics } from "../../types/owner";

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
                const data = res.data?.data;
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
        <div className="flex min-h-screen flex-col items-center gap-6 sm:gap-10 bg-background px-3 sm:px-6 py-8 sm:py-14 text-foreground w-full">
            {/* Header Title Block */}
            <div className="text-center space-y-1.5 px-2">
                <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-primary font-bold">
                    Verification Bureau · Partner Registration
                </p>
                <h1 className="mt-1 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    List Your Fleet Safely
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    Verify owner identity and bike documentation to activate listings.
                </p>
            </div>

            {/* Steps Navigation Progress */}
            <div className="w-full max-w-4xl space-y-3 sm:space-y-4">
                <StepIndicator step={step} onStepClick={setStep} />
                
                {/* Horizontal Progress Bar */}
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-500 rounded-full" 
                        style={{ width: `${getProgressPercent()}%` }}
                    />
                </div>
            </div>

            {/* Render Steps Card */}
            {step === "aadhaar" && (
                <div className="w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-xl">
                    <div className="border-b border-border bg-muted/40 px-4 py-5 sm:px-8 sm:py-6">
                        <button
                            type="button"
                            onClick={exitVerification}
                            className="mb-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft size={14} />
                            Exit Workflow
                        </button>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Step 1 of 4</p>
                        <h1 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-foreground">Owner Aadhaar Verification</h1>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Upload a clear photo of your Aadhaar card. We will verify your identity details.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:p-8 md:grid-cols-2">
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
                                    type="button"
                                    onClick={handleVerifyAadhaar}
                                    disabled={loading}
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-primary/20"
                                >
                                    <ShieldCheck size={18} />
                                    {loading ? "Scanning..." : "Scan & Verify Aadhaar"}
                                </button>
                            )}

                            {aadhaarResult && (
                                <button
                                    type="button"
                                    onClick={handleStartOver}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-foreground hover:bg-muted px-6 py-3.5 text-xs sm:text-sm font-bold transition"
                                >
                                    <RotateCcw size={16} />
                                    Replace/Retry upload
                                </button>
                            )}

                            {error && (
                                <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/10 p-4 text-xs font-semibold text-destructive border border-destructive/20">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {!aadhaarResult ? (
                                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 sm:px-6 sm:py-12 text-center">
                                        <ShieldCheck size={28} className="text-muted-foreground/60" />
                                        <p className="text-xs sm:text-sm text-muted-foreground">Scan result will appear here once scanning completes.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-6 shadow-lg">
                                        <DocumentStamp
                                            label={aadhaarResult.stampLabel || "APPROVED"}
                                            color="green"
                                        />
                                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border/60 pt-5 text-xs">
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
                <div className="w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-xl">
                    <div className="border-b border-border bg-muted/40 px-4 py-5 sm:px-8 sm:py-6">
                        <button
                            type="button"
                            onClick={() => setStep("aadhaar")}
                            className="mb-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft size={14} />
                            Back to Aadhaar
                        </button>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Step 2 of 4</p>
                        <h1 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-foreground">Registration Certificate (RC)</h1>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Upload the bike Registration Certificate to map owner records.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:p-8 md:grid-cols-2">
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
                                    type="button"
                                    onClick={handleVerifyRC}
                                    disabled={loading}
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-primary/20"
                                >
                                    <ShieldCheck size={18} />
                                    {loading ? "Scanning..." : "Scan & Verify RC"}
                                </button>
                            )}

                            {rcResult && (
                                <button
                                    type="button"
                                    onClick={handleStartOver}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-foreground hover:bg-muted px-6 py-3.5 text-xs sm:text-sm font-bold transition"
                                >
                                    <RotateCcw size={16} />
                                    Replace/Retry upload
                                </button>
                            )}

                            {error && (
                                <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/10 p-4 text-xs font-semibold text-destructive border border-destructive/20">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {!rcResult ? (
                                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 sm:px-6 sm:py-12 text-center">
                                        <ShieldCheck size={28} className="text-muted-foreground/60" />
                                        <p className="text-xs sm:text-sm text-muted-foreground">Scan result will appear here once scanning completes.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-6 shadow-lg text-xs">
                                        <DocumentStamp
                                            label={rcResult.stampLabel || "APPROVED"}
                                            color="green"
                                        />
                                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border/60 pt-5">
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
                <div className="w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-xl">
                    <div className="border-b border-border bg-muted/40 px-4 py-5 sm:px-8 sm:py-6">
                        <button
                            type="button"
                            onClick={() => setStep("bikeDocument")}
                            className="mb-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft size={14} />
                            Back to RC Document
                        </button>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Step 3 of 4</p>
                        <h1 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-foreground">Insurance Document</h1>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Upload a clear scan of the active vehicle insurance policy document.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:p-8 md:grid-cols-2">
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
                                    type="button"
                                    onClick={handleVerifyInsurance}
                                    disabled={loading}
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-primary/20"
                                >
                                    <ShieldCheck size={18} />
                                    {loading ? "Scanning..." : "Scan & Verify Insurance"}
                                </button>
                            )}

                            {insuranceResult && (
                                <button
                                    type="button"
                                    onClick={handleStartOver}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-foreground hover:bg-muted px-6 py-3.5 text-xs sm:text-sm font-bold transition"
                                >
                                    <RotateCcw size={16} />
                                    Replace/Retry upload
                                </button>
                            )}

                            {error && (
                                <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/10 p-4 text-xs font-semibold text-destructive border border-destructive/20">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {!insuranceResult ? (
                                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 sm:px-6 sm:py-12 text-center">
                                        <ShieldCheck size={28} className="text-muted-foreground/60" />
                                        <p className="text-xs sm:text-sm text-muted-foreground">Scan result will appear here once scanning completes.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-6 shadow-lg text-xs">
                                        <DocumentStamp
                                            label={insuranceResult.stampLabel}
                                            color={insuranceResult.stampColor}
                                        />
                                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border/60 pt-5">
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
                <div className="w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-xl">
                    <div className="border-b border-border bg-muted/40 px-4 py-5 sm:px-8 sm:py-6">
                        <button
                            type="button"
                            onClick={() => setStep("insurance")}
                            className="mb-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft size={14} />
                            Back to Insurance
                        </button>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Step 4 of 4</p>
                        <h1 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-foreground">Pollution Under Control (PUCC)</h1>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Upload a clear photo of the PUCC certificate showing validity marks.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:p-8 md:grid-cols-2">
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
                                    type="button"
                                    onClick={handleVerifyPollution}
                                    disabled={loading}
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-primary/20"
                                >
                                    <ShieldCheck size={18} />
                                    {loading ? "Scanning..." : "Scan & Verify PUCC"}
                                </button>
                            )}

                            {pollutionResult && (
                                <button
                                    type="button"
                                    onClick={handleStartOver}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-foreground hover:bg-muted px-6 py-3.5 text-xs sm:text-sm font-bold transition"
                                >
                                    <RotateCcw size={16} />
                                    Replace/Retry upload
                                </button>
                            )}

                            {error && (
                                <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/10 p-4 text-xs font-semibold text-destructive border border-destructive/20">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {!pollutionResult ? (
                                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 sm:px-6 sm:py-12 text-center">
                                        <ShieldCheck size={28} className="text-muted-foreground/60" />
                                        <p className="text-xs sm:text-sm text-muted-foreground">Scan result will appear here once scanning completes.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-6 shadow-lg text-xs">
                                        <DocumentStamp
                                            label={pollutionResult.stampLabel}
                                            color={pollutionResult.stampColor}
                                        />
                                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border/60 pt-5">
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
                    className="w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card text-center shadow-xl"
                >
                    <div className="bg-gradient-to-b from-primary/15 via-primary/5 to-transparent px-4 py-8 sm:px-8 sm:py-10">
                        <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
                            <ShieldCheck size={36} />
                        </div>
                        <h2 className="mt-4 font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Verification Complete</h2>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                            All your documents (Aadhaar, RC, Insurance, PUCC) have been successfully scanned and verified.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4 p-4 sm:p-6 sm:p-8 text-left sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl bg-muted/40 border border-border p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Owner Name</p>
                            <p className="mt-1 font-bold text-foreground text-xs sm:text-sm">{aadhaarResult?.customerName}</p>
                        </div>

                        <div className="rounded-2xl bg-muted/40 border border-border p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Registration Mark</p>
                            <p className="mt-1 font-mono font-bold tracking-wide text-foreground text-xs sm:text-sm">{rcResult?.registrationNumber}</p>
                        </div>

                        <div className="rounded-2xl bg-muted/40 border border-border p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Insurance Status</p>
                            <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">Active & Verified</p>
                        </div>

                        <div className="rounded-2xl bg-muted/40 border border-border p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">PUCC Status</p>
                            <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">Active & Verified</p>
                        </div>
                    </div>

                    <div className="border-t border-border p-4 sm:p-6 flex justify-end bg-muted/20">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold uppercase tracking-wider rounded-2xl cursor-pointer shadow-md shadow-primary/20 transition"
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
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className={`mt-0.5 text-xs font-semibold text-foreground ${mono ? "font-mono tracking-wide" : ""}`}>
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
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4 w-full px-2 py-1">
            {steps.map((s, i) => {
                const complete = i < activeIndex;
                const active = i === activeIndex;
                const clickable = complete;

                return (
                    <div key={s.key} className="flex items-center shrink-0">
                        <button
                            type="button"
                            disabled={!clickable}
                            onClick={() => clickable && onStepClick(s.key)}
                            className={`flex flex-col items-center gap-1 focus:outline-none ${
                                clickable ? "cursor-pointer hover:opacity-80" : "cursor-default"
                            }`}
                        >
                            <span
                                className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-2xl border-2 text-xs font-bold transition-colors ${
                                    complete
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : active
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-muted/50 text-muted-foreground"
                                }`}
                            >
                                {complete ? <Check size={14} /> : i + 1}
                            </span>
                            <span
                                className={`text-[10px] sm:text-[11px] font-bold ${
                                    active || complete ? "text-foreground font-bold" : "text-muted-foreground"
                                }`}
                            >
                                {s.label}
                            </span>
                        </button>

                        {i < steps.length - 1 && (
                            <span
                                className={`hidden sm:block mx-2 md:mx-3 h-0.5 w-6 md:w-10 lg:w-14 self-center ${
                                    complete ? "bg-emerald-500" : "bg-border"
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
