import React, { useState } from "react";
import jsQR from "jsqr";
import { useOwnerStore } from "../../store/ownerStore";
import { ownerService } from "../../services/ownerService";
import { 
    QrCode, 
    Upload, 
    ArrowRight, 
    ShieldCheck, 
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
    Sparkles,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { BookingService } from "../../services/bookingService";

interface BookingQRScannerProps {
    onClose?: () => void;
}

type PermissionState = "prompt" | "requesting" | "granted" | "denied";

export default function BookingQRScanner({ onClose }: BookingQRScannerProps) {
    const { bookingRequests } = useOwnerStore();
    
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

    const requestCameraPermission = () => {
        setPermission("requesting");
        setTimeout(() => {
            setPermission("granted");
            toast.success("Camera access granted!");
        }, 800);
    };

    const handleSearchBooking = async (idStr: string) => {
        setErrorMsg("");
        setIsExpired(false);
        setIsAlreadyUsed(false);
        setScannedBooking(null);
        setRideStarted(false);
        
        // Clean booking ID string (e.g. BK-1 -> 1)
        const numericId = parseInt(idStr.replace(/[^0-9]/g, ""), 10);
        if (isNaN(numericId)) {
            setErrorMsg("Invalid format. Please use format like BK-1 or enter number.");
            return;
        }

        setIsScanning(true);
        try {
            const data = await BookingService.scanQRCode(`BOOKING-REF: BK-${numericId}`);
            validateBookingDetails(data);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || err.message || `Booking reference BK-${numericId} not found or unauthorized.`);
            toast.error("Failed to scan booking.");
        } finally {
            setIsScanning(false);
        }
    };

    const validateBookingDetails = (booking: any) => {
        setScannedBooking(booking);

        if (booking.bookingStatus === "CANCELLED") {
            setIsAlreadyUsed(true);
            setErrorMsg("This booking has been cancelled.");
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

    const handleSimulateScan = (type: "valid" | "expired" | "used" | "invalid") => {
        setIsScanning(true);
        setErrorMsg("");
        setIsExpired(false);
        setIsAlreadyUsed(false);
        setScannedBooking(null);
        setRideStarted(false);

        setTimeout(async () => {
            setIsScanning(false);

            if (type === "invalid") {
                setErrorMsg("Decoded QR metadata check: Invalid format or signature mismatch.");
                return;
            }

            if (type === "expired") {
                const expiredMock = {
                    bookingId: 999,
                    bikeName: "Royal Enfield Classic 350",
                    registrationNumber: "TS09AB9999",
                    customerName: "Rohan Sharma",
                    startTime: "2026-08-01T10:00:00",
                    returnTime: "2026-08-05T12:00:00",
                    rentalAmount: 3200,
                    bookingStatus: "APPROVED",
                    paymentStatus: "SUCCESS"
                };
                setScannedBooking(expiredMock);
                setIsExpired(true);
                setErrorMsg("This booking period has expired. The return date is in the past.");
                return;
            }

            if (type === "used") {
                const usedMock = {
                    bookingId: 888,
                    bikeName: "KTM Duke 250",
                    registrationNumber: "TS09AB8888",
                    customerName: "Sneha Patel",
                    startTime: "2026-08-05T10:00:00",
                    returnTime: "2026-08-10T12:00:00",
                    actualPickupTime: "2026-08-05T10:05:00",
                    actualReturnTime: "2026-08-10T11:45:00",
                    rentalAmount: 4500,
                    bookingStatus: "COMPLETED",
                    paymentStatus: "SUCCESS"
                };
                setScannedBooking(usedMock);
                setIsAlreadyUsed(true);
                setErrorMsg("This booking QR has already been completed.");
                return;
            }

            // Grab a real owner booking from DB to simulate scanning
            try {
                const res = await ownerService.getBookingRequests();
                const list = (res?.data && Array.isArray(res.data.data)) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                const target = list.find((b: any) => b.bookingStatus === "CONFIRMED" || b.bookingStatus === "ACTIVE" || b.bookingStatus === "PENDING") || list[0];
                if (target) {
                    setBookingIdInput(`BK-${target.bookingId}`);
                    const scanned = await BookingService.scanQRCode(`BOOKING-REF: BK-${target.bookingId}`);
                    validateBookingDetails(scanned);
                } else {
                    setErrorMsg("No bookings found for your bikes to simulate scanning.");
                }
            } catch (err: any) {
                setErrorMsg(err.response?.data?.message || err.message || "No bookings found for your bikes.");
            }
        }, 800);
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
                        const scannedData = await BookingService.scanQRCode(code.data);
                        setBookingIdInput(`BK-${scannedData.bookingId}`);
                        validateBookingDetails(scannedData);
                    } else {
                        const codeInverted = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: "onlyInvert",
                        });
                        if (codeInverted && codeInverted.data) {
                            const scannedData = await BookingService.scanQRCode(codeInverted.data);
                            setBookingIdInput(`BK-${scannedData.bookingId}`);
                            validateBookingDetails(scannedData);
                        } else {
                            const match = file.name.match(/\d+/);
                            if (match) {
                                const id = match[0];
                                const scannedData = await BookingService.scanQRCode(`BOOKING-REF: BK-${id}`);
                                setBookingIdInput(`BK-${scannedData.bookingId}`);
                                validateBookingDetails(scannedData);
                            } else {
                                setErrorMsg("Could not detect a clear QR Code in the uploaded image. Please try again with a clear photo.");
                            }
                        }
                    }
                } catch (err: any) {
                    setErrorMsg(err.response?.data?.message || err.message || "Failed to scan QR code from image.");
                } finally {
                    setIsScanning(false);
                }
            };
            img.onerror = () => {
                setIsScanning(false);
                setErrorMsg("Failed to process image file.");
            };
            img.src = reader.result as string;
        };
        reader.onerror = () => {
            setIsScanning(false);
            setErrorMsg("Failed to read file.");
        };
        reader.readAsDataURL(file);
    };

    const handleConfirmHandover = async () => {
        if (!scannedBooking) return;
        setIsActioning(true);
        try {
            let success = false;
            let updatedBooking;
            if (scannedBooking.bookingStatus === "CONFIRMED") {
                updatedBooking = await BookingService.handoverBooking(scannedBooking.bookingId);
                setRideStarted(true);
                toast.success("Handover confirmed! Ride started successfully.");
                success = true;
            } else if (scannedBooking.bookingStatus === "ACTIVE") {
                updatedBooking = await BookingService.returnBooking(scannedBooking.bookingId);
                toast.success("Bike return confirmed! Rental completed.");
                success = true;
            } else {
                toast.error(`Invalid booking status: ${scannedBooking.bookingStatus}`);
            }

            if (success && updatedBooking) {
                setScannedBooking(updatedBooking);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Error occurred during transaction.");
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
                hour12: true
            });
        } catch {
            return dtStr || "—";
        }
    };

    // Render Camera Permission Prompt
    if (permission === "prompt" || permission === "requesting") {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-5 bg-card/90 border border-border/80 rounded-3xl min-h-[300px]">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
                    <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                    <h3 className="text-base font-extrabold text-foreground tracking-tight">Camera Access Required</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Grant camera access to scan customer QR passes directly for handover and returns.</p>
                </div>
                <button
                    type="button"
                    onClick={requestCameraPermission}
                    disabled={permission === "requesting"}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-primary/20"
                >
                    {permission === "requesting" ? (
                        <>
                            <span className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            <span>Requesting Access...</span>
                        </>
                    ) : (
                        <>
                            <Lock className="w-4 h-4" />
                            <span>Enable Scanner Camera</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full space-y-5 text-foreground overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                
                {/* Left Side: QR Scanner Viewport */}
                <div className="flex flex-col items-center justify-center p-5 bg-muted/20 border border-border/70 rounded-3xl relative overflow-hidden">
                    {/* Active Scanning Animation Overlay */}
                    {isScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 backdrop-blur-xs z-20 space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-extrabold text-foreground tracking-wide">Decoding QR Matrix...</p>
                            <div className="absolute inset-x-4 h-0.5 bg-primary/80 top-1/2 -translate-y-1/2 animate-scan-sweep" />
                        </div>
                    )}

                    {/* Viewfinder Target Box */}
                    <div className="relative w-44 h-44 rounded-2xl bg-background/80 border border-border/80 flex flex-col items-center justify-center shadow-inner group">
                        {/* Brass Viewfinder Reticles */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-sm" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-sm" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-sm" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-sm" />

                        <QrCode className="w-14 h-14 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                        <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest mt-2">
                            Scanner Target
                        </span>
                    </div>

                    {/* Scan Simulation Pills */}
                    <div className="mt-4 w-full space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleSimulateScan("valid")}
                                className="py-2 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>Valid Scan</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSimulateScan("expired")}
                                className="py-2 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>Expired QR</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleSimulateScan("used")}
                                className="py-2 px-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span>Used / Return</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSimulateScan("invalid")}
                                className="py-2 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>Invalid QR</span>
                            </button>
                        </div>
                        
                        <label className="w-full py-2 px-3 border border-border/80 bg-card hover:bg-muted/70 text-foreground text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-primary" />
                            <span>Upload QR Pass Image</span>
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
                <div className="space-y-4">
                    {/* Manual Check-in */}
                    <div className="bg-card/95 border border-border/80 p-4 rounded-3xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-foreground tracking-tight">Manual Lookup</h3>
                            <span className="text-[10px] text-muted-foreground">Type ID or BK-XXX</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={bookingIdInput}
                                onChange={(e) => setBookingIdInput(e.target.value)}
                                placeholder="e.g. BK-1 or 1"
                                className="flex-1 px-3.5 py-2 border border-border/80 bg-background text-foreground text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => handleSearchBooking(bookingIdInput)}
                                className="px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center justify-center"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20 mt-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{errorMsg}</span>
                            </div>
                        )}
                    </div>

                    {/* Scanned Booking Result Card */}
                    {scannedBooking ? (
                        <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-md transition-all duration-300">
                            {/* Card Header */}
                            <div className="bg-muted/40 p-4 border-b border-border/70 flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] font-bold text-primary font-mono block">BK-{scannedBooking.bookingId}</span>
                                    <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                                        <Bike className="w-4 h-4 text-primary shrink-0" />
                                        {scannedBooking.bikeName}
                                    </h4>
                                    {scannedBooking.registrationNumber && (
                                        <span className="text-[10px] font-mono font-bold text-muted-foreground block">
                                            Reg: {scannedBooking.registrationNumber}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                    isExpired || isAlreadyUsed
                                        ? "bg-destructive/10 text-destructive border-destructive/20"
                                        : rideStarted || scannedBooking.bookingStatus === "ACTIVE"
                                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                }`}>
                                    {rideStarted ? "ACTIVE" : scannedBooking.bookingStatus}
                                </span>
                            </div>

                            {/* Details Body */}
                            <div className="p-4 space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><User className="w-3.5 h-3.5" /> Customer</span>
                                    <span className="font-bold text-foreground">{scannedBooking.customerName || `Customer #${scannedBooking.customerId}`}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Scheduled</span>
                                    <span className="font-medium text-foreground">{formatDateTime(scannedBooking.startTime || scannedBooking.pickupDate)}</span>
                                </div>
                                {scannedBooking.actualPickupTime && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Actual Pickup</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatDateTime(scannedBooking.actualPickupTime)}</span>
                                    </div>
                                )}
                                {scannedBooking.actualReturnTime && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Actual Return</span>
                                        <span className="font-bold text-blue-600 dark:text-blue-400">{formatDateTime(scannedBooking.actualReturnTime)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                                    <span className="text-muted-foreground flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Amount</span>
                                    <span className="font-black text-foreground text-sm">₹{scannedBooking.rentalAmount || scannedBooking.totalAmount || 0}</span>
                                </div>

                                {/* Actions & Status Banners */}
                                {rideStarted ? (
                                    <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl p-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                                        <span className="font-semibold text-xs">Handover confirmed! Ride is active.</span>
                                    </div>
                                ) : (isExpired || isAlreadyUsed) ? (
                                    <div className="mt-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-3 flex items-center gap-2">
                                        <XCircle className="w-4 h-4 shrink-0" />
                                        <span className="font-semibold text-xs">{errorMsg || "Verification check failed."}</span>
                                    </div>
                                ) : (
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            disabled={isActioning}
                                            onClick={handleConfirmHandover}
                                            className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 active:scale-98"
                                        >
                                            {isActioning ? (
                                                <span className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                            ) : (
                                                <Play className="w-4 h-4" />
                                            )}
                                            <span>
                                                {scannedBooking.bookingStatus === "CONFIRMED" ? "Confirm Bike Handover" : "Confirm Bike Return"}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-32 border-2 border-dashed border-border/80 rounded-3xl flex flex-col items-center justify-center bg-muted/10 text-muted-foreground text-xs text-center p-4 gap-1.5">
                            <QrCode className="w-6 h-6 text-muted-foreground/30" />
                            <span className="text-[11px] font-medium">Scan pass QR or use manual lookup to inspect booking.</span>
                        </div>
                    )}
                </div>
            </div>
            
            {onClose && (
                <div className="flex justify-end pt-3 border-t border-border/70">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        Close Scanner
                    </button>
                </div>
            )}
        </div>
    );
}
