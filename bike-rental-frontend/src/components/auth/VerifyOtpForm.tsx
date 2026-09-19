import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import OtpInput from "../common/OtpInput";
import Button from "../common/Button";
import { verifyOtp } from "../../services/authService";

const VerifyOtpForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";
    const purpose = location.state?.purpose || "EMAIL_VERIFICATION";

    const [loading, setLoading] = useState(false);
    const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);

    const otp = otpDigits.join("");

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

            <div className="pt-1 [&>button]:h-10 [&>button]:rounded-lg [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:shadow-md [&>button]:transition-all [&>button]:duration-200 [&>button:hover]:-translate-y-0.5 [&>button:hover]:bg-primary/90 [&>button:hover]:shadow-lg [&>button:focus-visible]:outline-none [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-ring [&>button:focus-visible]:ring-offset-2">
                <Button
                    title="Verify Code"
                    type="submit"
                    loading={loading}
                    disabled={otp.length !== 6}
                />
            </div>

            <p className="pt-2 text-center text-xs sm:text-sm text-muted-foreground">
                Didn't receive the code or need to sign in?
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
