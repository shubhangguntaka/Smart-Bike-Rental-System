import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../common/Button";
import Input from "../common/Input";
import { forgotPassword } from "../../services/authService";

const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Email is required.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);
            await forgotPassword({
                email: email.trim(),
            });

            toast.success("OTP sent successfully to your email.");
            navigate("/verify-otp", {
                state: {
                    email: email.trim(),
                    purpose: "FORGOT_PASSWORD",
                },
            });
        } catch (error: any) {
            const response = error.response?.data;
            if (response?.data) {
                const errors = Object.values(response.data);
                toast.error(errors.join(", "));
            } else {
                toast.error(response?.message || "Unable to send OTP. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-4 [&_label]:mb-1.5 [&_label]:text-sm [&_label]:font-medium [&_label]:text-foreground [&_input]:h-10 [&_input]:rounded-lg [&_input]:border-border [&_input]:bg-background/50 [&_input]:px-3 [&_input]:text-foreground [&_input]:shadow-xs [&_input]:transition [&_input]:duration-200 [&_input]:focus:border-primary [&_input]:focus:ring-2 [&_input]:focus:ring-ring/25">
                <Input
                    label="Registered Email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="pt-1 [&>button]:h-10 [&>button]:rounded-lg [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:shadow-md [&>button]:transition-all [&>button]:duration-200 [&>button:hover]:-translate-y-0.5 [&>button:hover]:bg-primary/90 [&>button:hover]:shadow-lg [&>button:focus-visible]:outline-none [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-ring [&>button:focus-visible]:ring-offset-2">
                <Button
                    title="Send OTP"
                    loading={loading}
                    type="submit"
                />
            </div>

            <p className="pt-2 text-center text-xs sm:text-sm text-muted-foreground">
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

export default ForgotPasswordForm;
