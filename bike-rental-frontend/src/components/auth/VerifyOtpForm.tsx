import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import OtpInput from "../common/OtpInput";
import Button from "../common/Button";
import { verifyOtp, resendOtp } from "../../services/authService";

const VerifyOtpForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";
    const purpose = location.state?.purpose || "EMAIL_VERIFICATION";

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);

    const otp = otpDigits.join("");

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleResendOtp = async () => {
        if (countdown > 0 || resendLoading) return;

        if (!email) {
            toast.error("Email address is missing. Please restart the verification process.");
            return;
        }

        try {
            setResendLoading(true);
            await resendOtp({
                email,
                purpose,
            });

            toast.success("A new OTP code has been sent to your email.");
            setCountdown(30);
            setOtpDigits(["", "", "", "", "", ""]);
        } catch (error: any) {
            const response = error.response?.data;
            if (response?.data) {
                const errors = Object.values(response.data);
                toast.error(errors.join(", "));
            } else {
                toast.error(response?.message || "Failed to resend OTP. Please try again.");
            }
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!otp.trim()) {
            toast.error("Please enter the OTP code.");
            return;
        }

        if (otp.trim().length !== 6) {
            toast.error("OTP must be 6 digits.");
            return;
        }

        try {
            setLoading(true);
            await verifyOtp({
                email,
                otp: otp.trim(),
                purpose,
            });

            toast.success("OTP Verified Successfully");

            if (purpose === "FORGOT_PASSWORD") {
                navigate("/reset-password", {
                    state: {
                        email,
                    },
                });
            } else {
                navigate("/login");
            }
        } catch (error: any) {
            const response = error.response?.data;
            if (response?.data) {
                const errors = Object.values(response.data);
                toast.error(errors.join(", "));
            } else {
                toast.error(response?.message || "Invalid or expired OTP code.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="rounded-xl border border-border bg-card/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Verification code sent to</p>
                <h2 className="mt-1 text-sm sm:text-base font-bold text-primary break-all">
                    {email || "your registered email"}
                </h2>
            </div>

            <div className="space-y-2 text-center">
                <label className="block text-xs sm:text-sm font-semibold text-foreground/80">
                    Enter 6-Digit Code
                </label>
                <OtpInput otp={otpDigits} setOtp={setOtpDigits} />
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <span className="text-muted-foreground">Didn't receive the code?</span>
                <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || resendLoading}
                    className="font-semibold text-primary transition-colors hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {resendLoading ? "Resending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
            </div>

            <div className="pt-1 [&>button]:h-10 [&>button]:rounded-lg [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:shadow-md [&>button]:transition-all [&>button]:duration-200 [&>button:hover]:-translate-y-0.5 [&>button:hover]:bg-primary/90 [&>button:hover]:shadow-lg [&>button:focus-visible]:outline-none [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-ring [&>button:focus-visible]:ring-offset-2">
                <Button
                    title="Verify Code"
                    type="submit"
                    loading={loading}
                    disabled={otp.length !== 6}
                />
            </div>

            <p className="pt-2 text-center text-xs sm:text-sm text-muted-foreground">
                Need to sign in with an existing account?
                <Link
                    to="/login"
                    className="ml-2 font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    Back to Sign in
                </Link>
            </p>
        </form>
    );
};

export default VerifyOtpForm;
