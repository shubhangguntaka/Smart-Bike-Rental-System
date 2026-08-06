import React, { useState } from "react";
import { useOwnerStore } from "../../store/ownerStore";
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
    Play
} from "lucide-react";
import toast from "react-hot-toast";

interface BookingQRScannerProps {
    onClose?: () => void;
}

type PermissionState = "prompt" | "requesting" | "granted" | "denied";

export default function BookingQRScanner({ onClose }: BookingQRScannerProps) {
    const { bookingRequests, approveBooking } = useOwnerStore();
    
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
        }, 1200);
    };

    const handleSearchBooking = (idStr: string) => {
        setErrorMsg("");
        setIsExpired(false);
        setIsAlreadyUsed(false);
        setScannedBooking(null);
        setRideStarted(false);
        
        // Clean booking ID string (e.g. BR-12 -> 12)
        const numericId = parseInt(idStr.replace(/[^0-9]/g, ""), 10);
        if (isNaN(numericId)) {
            setErrorMsg("Invalid QR Code format. Please use a numeric ID or format like BR-XXX.");
            return;
        }

        const found = bookingRequests.find(b => b.bookingId === numericId);
        if (found) {
            validateBookingDetails(found);
        } else {
            setErrorMsg(`Booking reference BR-${numericId} not found in this owner's fleet.`);
        }
    };

    const validateBookingDetails = (booking: any) => {
        setScannedBooking(booking);

        // Check if Return date is in the past (Expired QR)
        const returnDate = new Date(booking.returnDate);
        if (returnDate < new Date()) {
            setIsExpired(true);
            setErrorMsg("This booking period has expired. The return date is in the past.");
            return;
        }

        // Check if booking is already completed or cancelled (Already Used)
        if (booking.bookingStatus === "COMPLETED" || booking.bookingStatus === "CANCELLED") {
            setIsAlreadyUsed(true);
            setErrorMsg(`This booking QR has already been used or closed. Status: ${booking.bookingStatus}`);
            return;
        }

        toast.success(`Booking BR-${booking.bookingId} validated! Ready for handover.`);
    };

    const handleSimulateScan = (type: "valid" | "expired" | "used" | "invalid") => {
        setIsScanning(true);
        setErrorMsg("");
        setIsExpired(false);
        setIsAlreadyUsed(false);
        setScannedBooking(null);
        setRideStarted(false);

        setTimeout(() => {
            setIsScanning(false);

            if (type === "invalid") {
                setErrorMsg("Decoded QR metadata check: Invalid format. Secure signature mismatch.");
                return;
            }

            if (type === "expired") {
                // Simulate an expired booking details
                const expiredMock = {
                    bookingId: 999,
                    bikeName: "Royal Enfield Classic 350",
                    customerName: "Rohan Sharma",
                    pickupDate: "2026-08-01",
                    returnDate: "2026-08-05", // past date
                    rentalAmount: 3200,
                    bookingStatus: "APPROVED"
                };
                setScannedBooking(expiredMock);
                setIsExpired(true);
                setErrorMsg("This booking period has expired. The return date is in the past.");
                return;
            }

            if (type === "used") {
                // Simulate an already completed booking
                const usedMock = {
                    bookingId: 888,
                    bikeName: "KTM Duke 250",
                    customerName: "Sneha Patel",
                    pickupDate: "2026-08-05",
                    returnDate: "2026-08-10",
                    rentalAmount: 4500,
                    bookingStatus: "COMPLETED"
                };
                setScannedBooking(usedMock);
                setIsAlreadyUsed(true);
                setErrorMsg("This booking QR has already been checked-in/used.");
                return;
            }

            // Grab a pending/approved request if exists
            const activeBookings = bookingRequests.filter(b => b.bookingStatus === "PENDING" || b.bookingStatus === "APPROVED");
            const target = activeBookings.length > 0 ? activeBookings[0] : (bookingRequests.length > 0 ? bookingRequests[0] : null);

            if (target) {
                setBookingIdInput(`BR-${target.bookingId}`);
                validateBookingDetails(target);
            } else {
                setErrorMsg("No bookings found in database to simulate scanning.");
            }
        }, 2000);
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

        setTimeout(() => {
            setIsScanning(false);
            const target = bookingRequests[Math.floor(Math.random() * bookingRequests.length)];
            if (target) {
                setBookingIdInput(`BR-${target.bookingId}`);
                validateBookingDetails(target);
            } else {
                setErrorMsg("Simulated QR decoder could not resolve image metadata.");
            }
        }, 1500);
    };

    const handleConfirmHandover = async () => {
        if (!scannedBooking) return;
        setIsActioning(true);
        try {
            // TODO: Replace with Member 1 QR Validation / checkin API integration
            const success = await approveBooking(scannedBooking.bookingId);
            if (success) {
                setRideStarted(true);
                toast.success("Handover confirmed! Ride started successfully.");
                // Update local status representation
                setScannedBooking((prev: any) => prev ? { ...prev, bookingStatus: "COMPLETED" } : null);
            } else {
                toast.error("Failed to confirm handover.");
            }
        } catch (err) {
            toast.error("Error occurred while starting ride.");
        } finally {
            setIsActioning(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    // Render Camera Permission State
    if (permission === "prompt" || permission === "requesting") {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 bg-card border border-border rounded-2xl min-h-[350px]">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Camera className="h-8 w-8" />
                </div>
                <div className="space-y-2 max-w-sm">
                    <h3 className="text-base font-bold text-foreground">Camera Access Required</h3>
                    <p className="text-xs text-muted-foreground">The Booking QR Scanner requires camera permissions to detect customer barcodes and code tickets.</p>
                </div>
                <button
                    type="button"
                    onClick={requestCameraPermission}
                    disabled={permission === "requesting"}
                    className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                    {permission === "requesting" ? (
                        <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Requesting Access...</span>
                        </>
                    ) : (
                        <>
                            <Lock className="h-4 w-4" />
                            <span>Grant Camera Permission</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Side: QR Scanner Simulator Viewport */}
                <div className="flex flex-col items-center justify-center p-6 bg-muted/20 border border-border rounded-2xl relative overflow-hidden min-h-[340px]">
                    {isScanning ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-10">
                            <QrCode className="h-14 w-14 text-primary animate-pulse" />
                            <p className="text-xs font-bold text-foreground mt-4 animate-bounce">Analyzing QR Code Matrix...</p>
                            <div className="absolute left-0 right-0 h-0.5 bg-primary/80 top-1/2 -translate-y-1/2 animate-[bounce_2s_infinite]"></div>
                        </div>
                    ) : null}

                    <div className="w-48 h-48 border-4 border-dashed border-primary/40 rounded-3xl flex flex-col items-center justify-center bg-card relative shadow-inner group hover:border-primary transition-all duration-300">
                        <QrCode className="h-16 w-16 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                        <div className="absolute inset-3 border border-muted-foreground/10 rounded-2xl flex items-center justify-center">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Scanner Target</span>
                        </div>
                    </div>

                    <div className="mt-6 w-full max-w-xs space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleSimulateScan("valid")}
                                className="py-2 px-3 bg-primary text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                                <QrCode className="h-3.5 w-3.5" />
                                <span>Scan Valid QR</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSimulateScan("expired")}
                                className="py-2 px-3 bg-amber-600 text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                                <QrCode className="h-3.5 w-3.5" />
                                <span>Scan Expired QR</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleSimulateScan("used")}
                                className="py-2 px-3 bg-slate-600 text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                                <QrCode className="h-3.5 w-3.5" />
                                <span>Scan Used QR</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSimulateScan("invalid")}
                                className="py-2 px-3 bg-destructive text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                                <QrCode className="h-3.5 w-3.5" />
                                <span>Scan Invalid QR</span>
                            </button>
                        </div>
                        
                        <label className="py-2 px-4 border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload QR Image file</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                </div>

                {/* Right Side: Manual Checkin and details display */}
                <div className="space-y-4">
                    <div className="bg-card border border-border p-5 rounded-2xl space-y-3">
                        <h3 className="text-sm font-bold text-foreground">Manual Check-In Lookup</h3>
                        <p className="text-xs text-muted-foreground font-light">Enter the Customer Booking reference ID to validate manually.</p>
                        
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={bookingIdInput}
                                onChange={(e) => setBookingIdInput(e.target.value)}
                                placeholder="e.g. BR-12"
                                className="flex-1 px-3.5 py-2 border border-border bg-background text-foreground text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                type="button"
                                onClick={() => handleSearchBooking(bookingIdInput)}
                                className="px-4 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 mt-2">
                                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>{errorMsg}</span>
                            </div>
                        )}
                    </div>

                    {/* Result and Validation Details Card */}
                    {scannedBooking ? (
                        <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300">
                            <div className="bg-muted/40 p-4 border-b border-border flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] font-bold text-muted-foreground font-mono">REFERENCE: BR-{scannedBooking.bookingId}</span>
                                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                        <Bike className="h-4 w-4 text-primary shrink-0" />
                                        {scannedBooking.bikeName}
                                    </h4>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    isExpired || isAlreadyUsed
                                        ? "bg-destructive/10 text-destructive"
                                        : rideStarted
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-amber-500/10 text-amber-500"
                                }`}>
                                    {rideStarted ? "RIDE STARTED" : scannedBooking.bookingStatus}
                                </span>
                            </div>

                            <div className="p-4 space-y-3.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><User className="h-3.5 w-3.5" /> Customer</span>
                                    <span className="font-semibold text-foreground">{scannedBooking.customerName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Duration</span>
                                    <span className="font-semibold text-foreground">{scannedBooking.pickupDate} to {scannedBooking.returnDate}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Rental Cost</span>
                                    <span className="font-bold text-primary">{formatCurrency(scannedBooking.rentalAmount)}</span>
                                </div>

                                {rideStarted ? (
                                    <div className="mt-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl p-3 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                                        <span className="font-semibold">Handover confirmed! Customer ride started.</span>
                                    </div>
                                ) : (isExpired || isAlreadyUsed) ? (
                                    <div className="mt-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3 flex items-center gap-2">
                                        <XCircle className="h-5 w-5 shrink-0" />
                                        <span className="font-semibold">Verification failed. Bike cannot be handed over.</span>
                                    </div>
                                ) : (
                                    <div className="pt-3 border-t border-border mt-2">
                                        <button
                                            type="button"
                                            disabled={isActioning}
                                            onClick={handleConfirmHandover}
                                            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            {isActioning ? (
                                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                <Play className="h-4 w-4" />
                                            )}
                                            <span>Confirm Bike Handover</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-36 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center bg-card text-muted-foreground text-xs text-center p-6 gap-1.5">
                            <QrCode className="h-6 w-6 text-muted-foreground/30" />
                            <span>Scan booking QR code or select simulation to process handover check-in.</span>
                        </div>
                    )}
                </div>
            </div>
            
            {onClose && (
                <div className="flex justify-end pt-2 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer focus:outline-none"
                    >
                        Close Scanner
                    </button>
                </div>
            )}
        </div>
    );
}
