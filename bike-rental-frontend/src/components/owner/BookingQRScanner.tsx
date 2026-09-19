import React, { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import { useOwnerStore } from "../../store/ownerStore";
import { 
    QrCode, 
    Upload, 
    ArrowRight, 
    CheckCircle2, 
    XCircle, 
    User, 
    Bike, 
    Calendar, 
    CreditCard, 
    Camera, 
    Lock, 
    Play, 
    Clock, 
    AlertCircle, 
    CameraOff, 
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { BookingService } from "../../services/bookingService";

interface BookingQRScannerProps {
    onClose?: () => void;
}

type PermissionState = "prompt" | "requesting" | "granted" | "denied";

export default function BookingQRScanner({ onClose }: BookingQRScannerProps) {
    const { fetchDashboard, fetchBookingRequests } = useOwnerStore();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // UI flow states
    const [permission, setPermission] = useState<PermissionState>("prompt");
    const [bookingIdInput, setBookingIdInput] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scannedBooking, setScannedBooking] = useState<any>(null);

    // Verification details
    const [isActioning, setIsActioning] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isExpired, setIsExpired] = useState(false);
    const [isAlreadyUsed, setIsAlreadyUsed] = useState(false);
    const [rideStarted, setRideStarted] = useState(false);

    const stopCamera = () => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
        setPermission("prompt");
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const requestCameraPermission = async () => {
        setPermission("requesting");
        setErrorMsg("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            streamRef.current = stream;
            setPermission("granted");
            toast.success("Camera access granted!");
            startContinuousScanning();
        } catch (err: any) {
            setPermission("denied");
            setErrorMsg("Camera access was denied or is not available on this device.");
            toast.error("Camera permission denied.");
        }
    };

    const startContinuousScanning = () => {
        if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
        }
        setIsScanning(true);

        const scanFrame = () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const canvas = canvasRef.current || document.createElement("canvas");
                canvasRef.current = canvas;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });

                    if (code && code.data) {
                        handleProcessScannedCode(code.data);
                        return;
                    }
                }
            }
            animFrameRef.current = requestAnimationFrame(scanFrame);
        };

        animFrameRef.current = requestAnimationFrame(scanFrame);
    };

    const handleProcessScannedCode = async (rawCode: string) => {
        stopCamera();
        setIsScanning(false);
        setErrorMsg("");
        setIsExpired(false);
        setIsAlreadyUsed(false);
        setScannedBooking(null);
        setRideStarted(false);

        try {
            const data = await BookingService.scanQRCode(rawCode);
            setBookingIdInput(`BK-${data.bookingId}`);
            validateBookingDetails(data);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || err.message || "Invalid or unauthorized QR code.");
            toast.error("Failed to validate scanned QR code.");
        }
    };

    const handleSearchBooking = async (idStr: string) => {
        if (!idStr.trim()) return;
        setErrorMsg("");
        setIsExpired(false);
        setIsAlreadyUsed(false);
        setScannedBooking(null);
        setRideStarted(false);

        const numericId = parseInt(idStr.replace(/[^0-9]/g, ""), 10);
        if (isNaN(numericId)) {
            setErrorMsg("Invalid format. Please enter a valid booking ID (e.g. BK-1 or 1).");
            return;
        }

        setIsScanning(true);
        try {
            const data = await BookingService.scanQRCode(`BOOKING-REF: BK-${numericId}`);
            validateBookingDetails(data);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || err.message || `Booking BK-${numericId} not found or unauthorized.`);
            toast.error("Failed to fetch booking.");
        } finally {
            setIsScanning(false);
        }
    };

    const validateBookingDetails = (booking: any) => {
        setScannedBooking(booking);

        if (booking.bookingStatus === "CANCELLED" || booking.bookingStatus === "REJECTED") {
            setIsAlreadyUsed(true);
            setErrorMsg(`This booking has been ${booking.bookingStatus.toLowerCase()}.`);
            return;
        }

        if (booking.bookingStatus === "COMPLETED") {
            setIsAlreadyUsed(true);
            setErrorMsg("This rental has already been completed.");
            return;
        }

        if (booking.bookingStatus === "ACTIVE") {
            toast.success(`Booking BK-${booking.bookingId} verified! Ready for bike return.`);
            return;
        }

        toast.success(`Booking BK-${booking.bookingId} verified! Ready for handover.`);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setErrorMsg("");
        setIsExpired(false);
        setIsAlreadyUsed(false);
        setScannedBooking(null);
        setRideStarted(false);

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = async () => {
                try {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    if (!ctx) throw new Error("Canvas context not available");

                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });

                    if (code && code.data) {
                        handleProcessScannedCode(code.data);
                    } else {
                        const codeInverted = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: "onlyInvert",
                        });
                        if (codeInverted && codeInverted.data) {
                            handleProcessScannedCode(codeInverted.data);
                        } else {
                            const match = file.name.match(/\d+/);
                            if (match) {
                                const id = match[0];
                                handleProcessScannedCode(`BOOKING-REF: BK-${id}`);
                            } else {
                                setErrorMsg("Could not detect a clear QR Code in the uploaded image. Please try another image.");
                            }
                        }
                    }
                } catch (err: any) {
                    setErrorMsg(err.response?.data?.message || err.message || "Failed to process QR image.");
                } finally {
                    setIsScanning(false);
                }
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleConfirmHandover = async () => {
        if (!scannedBooking) return;
        setIsActioning(true);
        try {
            let updatedBooking;
            if (scannedBooking.bookingStatus === "CONFIRMED" || scannedBooking.bookingStatus === "APPROVED") {
                updatedBooking = await BookingService.handoverBooking(scannedBooking.bookingId);
                setRideStarted(true);
                toast.success("Handover confirmed! Ride started successfully.");
            } else if (scannedBooking.bookingStatus === "ACTIVE") {
                updatedBooking = await BookingService.returnBooking(scannedBooking.bookingId);
                toast.success("Bike return confirmed! Rental completed.");
            } else {
                toast.error(`Handover unavailable for status: ${scannedBooking.bookingStatus}`);
            }

            if (updatedBooking) {
                setScannedBooking(updatedBooking);
                fetchDashboard(true);
                fetchBookingRequests(true);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Handover operation failed.");
        } finally {
            setIsActioning(false);
        }
    };

    const formatDateTime = (dtStr?: string) => {
        try {
            if (!dtStr) return "—";
            const d = new Date(dtStr);
            if (isNaN(d.getTime())) return dtStr;
            return d.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch {
            return dtStr || "—";
        }
    };

    return (
        <div className="w-full space-y-4 sm:space-y-6 text-foreground max-h-[85dvh] overflow-y-auto">
            {/* 2-Column Responsive Grid with Equalized Height */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                
                {/* Left Side: Camera Scanner Viewport Card */}
                <div className="flex flex-col justify-between p-3.5 sm:p-5 bg-muted/20 border border-border/70 rounded-2xl relative">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-foreground">Live QR Scanner</span>
                        </div>
                        {permission === "granted" ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                Camera Live
                            </span>
                        ) : (
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                Standby
                            </span>
                        )}
                    </div>

                    {/* Viewport Box */}
                    <div className="my-3 sm:my-4 flex items-center justify-center">
                        {permission === "granted" ? (
                            <div className="relative w-full h-48 sm:h-56 rounded-xl bg-black overflow-hidden flex items-center justify-center border border-border shadow-inner">
                                <video
                                    ref={videoRef}
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                {/* Reticles & Scan Line */}
                                <div className="absolute inset-4 sm:inset-5 border-2 border-primary/70 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                                    <div className="flex justify-between">
                                        <div className="w-4 h-4 border-t-2 border-l-2 border-primary" />
                                        <div className="w-4 h-4 border-t-2 border-r-2 border-primary" />
                                    </div>
                                    {/* Scanning laser line animation */}
                                    <div className="w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                                    <div className="flex justify-between">
                                        <div className="w-4 h-4 border-b-2 border-l-2 border-primary" />
                                        <div className="w-4 h-4 border-b-2 border-r-2 border-primary" />
                                    </div>
                                </div>
                                <span className="absolute bottom-2 bg-black/75 backdrop-blur-xs text-white text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-md font-mono tracking-wide">
                                    Align Booking QR Pass
                                </span>
                            </div>
                        ) : (
                            <div className="w-full h-48 sm:h-56 rounded-xl bg-card border border-dashed border-border/80 flex flex-col items-center justify-center p-4 sm:p-5 text-center space-y-2.5 sm:space-y-3">
                                {permission === "denied" ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                                            <CameraOff className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-foreground">Camera Access Blocked</p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">Please allow camera permission in your browser.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={requestCameraPermission}
                                            className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            <span>Retry Permission</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                            <QrCode className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-foreground">Camera Access Required</h4>
                                            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">
                                                Scan customer's booking QR pass for vehicle handover and return.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={requestCameraPermission}
                                            disabled={permission === "requesting"}
                                            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-primary/20"
                                        >
                                            <Camera className="w-3.5 h-3.5" />
                                            <span>{permission === "requesting" ? "Opening Camera..." : "Enable Camera Scanner"}</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions / Upload fallback */}
                    <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row gap-2">
                        {permission === "granted" && (
                            <button
                                type="button"
                                onClick={stopCamera}
                                className="flex-1 py-2 px-3 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                            >
                                Stop Camera
                            </button>
                        )}
                        <label className="flex-1 py-2 px-3 border border-border/80 bg-card hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-center shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Upload QR Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                </div>

                {/* Right Side: Manual Lookup & Result Panel */}
                <div className="flex flex-col justify-between space-y-4">
                    
                    {/* Manual Check-in Card */}
                    <div className="bg-card border border-border/80 p-4 rounded-2xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5 text-primary" />
                                <h3 className="text-xs font-bold text-foreground">Manual Lookup</h3>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">e.g. BK-1 or 1</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={bookingIdInput}
                                onChange={(e) => setBookingIdInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSearchBooking(bookingIdInput);
                                    }
                                }}
                                placeholder="Enter Booking ID..."
                                className="flex-1 min-w-0 px-3.5 py-2.5 border border-border/80 bg-background text-foreground text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                            />
                            <button
                                type="button"
                                disabled={isScanning || !bookingIdInput.trim()}
                                onClick={() => handleSearchBooking(bookingIdInput)}
                                className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                            >
                                <span>Lookup</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20 mt-2 animate-in fade-in">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{errorMsg}</span>
                            </div>
                        )}
                    </div>

                    {/* Scanned Booking Result Card / Ready State Card */}
                    {scannedBooking ? (
                        <div className="flex-1 bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between animate-in zoom-in-95 duration-200">
                            {/* Card Header */}
                            <div className="bg-muted/40 p-3.5 border-b border-border/70 flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] font-bold text-primary font-mono block">BK-{scannedBooking.bookingId}</span>
                                    <h4 className="font-extrabold text-xs text-foreground flex items-center gap-1.5 mt-0.5">
                                        <Bike className="w-3.5 h-3.5 text-primary shrink-0" />
                                        <span>{scannedBooking.bikeName}</span>
                                    </h4>
                                    {scannedBooking.registrationNumber && (
                                        <span className="text-[10px] font-mono text-muted-foreground block">
                                            Reg: {scannedBooking.registrationNumber}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                                    isExpired || isAlreadyUsed
                                        ? "bg-destructive/10 text-destructive border-destructive/20"
                                        : rideStarted || scannedBooking.bookingStatus === "ACTIVE"
                                        ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                }`}>
                                    {rideStarted ? "ACTIVE" : scannedBooking.bookingStatus}
                                </span>
                            </div>

                            {/* Details Body */}
                            <div className="p-3.5 space-y-2.5 text-xs flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><User className="w-3.5 h-3.5" /> Customer</span>
                                    <span className="font-bold text-foreground">{scannedBooking.customerName || `Customer #${scannedBooking.customerId}`}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Start Date</span>
                                    <span className="font-medium text-foreground">{formatDateTime(scannedBooking.startTime || scannedBooking.pickupDate)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Return Date</span>
                                    <span className="font-medium text-foreground">{formatDateTime(scannedBooking.returnTime || scannedBooking.returnDate)}</span>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                                    <span className="text-muted-foreground flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Rental Amount</span>
                                    <span className="font-black text-primary text-sm">₹{scannedBooking.rentalAmount || scannedBooking.totalAmount || 0}</span>
                                </div>

                                {/* Handover CTA Button / Result Feedback */}
                                <div className="pt-2">
                                    {rideStarted ? (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl p-2.5 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                                            <span className="font-semibold text-xs">Handover confirmed! Ride is now active.</span>
                                        </div>
                                    ) : (isExpired || isAlreadyUsed) ? (
                                        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-2.5 flex items-center gap-2">
                                            <XCircle className="w-4 h-4 shrink-0" />
                                            <span className="font-semibold text-xs">{errorMsg || "Verification check failed."}</span>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={isActioning}
                                            onClick={handleConfirmHandover}
                                            className="w-full py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
                                        >
                                            {isActioning ? (
                                                <span className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                            )}
                                            <span>
                                                {scannedBooking.bookingStatus === "ACTIVE" ? "Confirm Bike Return" : "Confirm Bike Handover"}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 min-h-[160px] border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center bg-muted/10 p-5 text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground">Ready for Verification</h4>
                            <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                                Align the QR code pass in the camera viewport or enter the Booking ID above to verify details.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Bottom Action */}
            {onClose && (
                <div className="flex justify-end pt-3 border-t border-border/70">
                    <button
                        type="button"
                        onClick={() => {
                            stopCamera();
                            onClose();
                        }}
                        className="px-5 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        Close Scanner
                    </button>
                </div>
            )}
        </div>
    );
}
