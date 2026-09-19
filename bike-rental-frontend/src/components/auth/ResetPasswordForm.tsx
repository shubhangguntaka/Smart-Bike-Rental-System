import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../common/Input";
import PasswordInput from "../common/PasswordInput";
import PasswordStrength from "../common/PasswordStrength";
import Button from "../common/Button";
import { resetPassword } from "../../services/authService";

const ResetPasswordForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.otp.trim()) {
            toast.error("OTP is required.");
            return;
        }

        if (formData.otp.trim().length !== 6) {
            toast.error("OTP must be 6 digits.");
            return;
        }

        if (!formData.newPassword.trim()) {
            toast.error("New Password is required.");
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            await resetPassword({
                email,
                otp: formData.otp.trim(),
                newPassword: formData.newPassword
            });

            toast.success("Password Reset Successfully. Please sign in.");
            navigate("/login");
        } catch (error: any) {
            const response = error.response?.data;
            if (response?.data) {
                const errors = Object.values(response.data);
                toast.error(errors.join(", "));
            } else {
                toast.error(response?.message || "Password Reset Failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
            {email && (
                <div className="rounded-lg border border-border bg-card/40 p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Resetting password for</p>
                    <p className="mt-0.5 text-xs sm:text-sm font-semibold text-primary break-all">{email}</p>
                </div>
            )}

            <div className="space-y-3 [&_label]:mb-1.5 [&_label]:text-sm [&_label]:font-medium [&_label]:text-foreground [&_input]:h-10 [&_input]:rounded-lg [&_input]:border-border [&_input]:bg-background/50 [&_input]:px-3 [&_input]:text-foreground [&_input]:shadow-xs [&_input]:transition [&_input]:duration-200 [&_input]:focus:border-primary [&_input]:focus:ring-2 [&_input]:focus:ring-ring/25">
                <Input
                    label="6-Digit OTP"
                    name="otp"
                    inputMode="numeric"
                    placeholder="Enter 6-digit OTP code"
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleChange}
                    required
                />
                <PasswordInput
                    label="New Password"
                    name="newPassword"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                />
                <PasswordStrength password={formData.newPassword} />
                <PasswordInput
                    label="Confirm Password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="pt-1 [&>button]:h-10 [&>button]:rounded-lg [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:shadow-md [&>button]:transition-all [&>button]:duration-200 [&>button:hover]:-translate-y-0.5 [&>button:hover]:bg-primary/90 [&>button:hover]:shadow-lg [&>button:focus-visible]:outline-none [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-ring [&>button:focus-visible]:ring-offset-2">
                <Button
                    title="Reset Password"
                    type="submit"
                    loading={loading}
                />
            </div>

            <p className="pt-1 text-center text-xs sm:text-sm text-muted-foreground">
                Remember your password?
                <Link
                    to="/login"
                    className="ml-2 font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    Sign in
                </Link>
            </p>
        </form>
    );
};

export default ResetPasswordForm;
