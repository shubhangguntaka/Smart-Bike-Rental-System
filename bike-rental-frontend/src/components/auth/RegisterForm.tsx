import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Bike, UserRound } from "lucide-react";

import Input from "../common/Input";
import Button from "../common/Button";
import PasswordStrength from "../common/PasswordStrength";
import PasswordInput from "../common/PasswordInput";
import { register } from "../../services/authService";
import type { RegisterRequest } from "../../types/auth";

const RegisterForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<RegisterRequest>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "CUSTOMER",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRole = (role: "CUSTOMER" | "OWNER") => {
        setFormData({ ...formData, role });
    };

    const validate = () => {
        if (!formData.firstName.trim()) {
            toast.error("First Name is required");
            return false;
        }
        if (!formData.lastName.trim()) {
            toast.error("Last Name is required");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Invalid Email");
            return false;
        }
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            toast.error("Invalid Phone Number (10 digits starting with 6-9)");
            return false;
        }
        if (formData.password.length < 8) {
            toast.error("Password should be at least 8 characters");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            await register(formData);
            toast.success("Registration Successful. Please verify OTP.");
            navigate("/verify-otp", {
                state: { email: formData.email, purpose: "EMAIL_VERIFICATION" },
            });
        } catch (error: any) {
            const response = error.response?.data;
            if (response?.data) {
                toast.error(Object.values(response.data).join(", "));
            } else {
                toast.error(response?.message || "Registration Failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 [&_label]:mb-1 [&_label]:text-xs sm:[&_label]:text-sm [&_label]:font-medium [&_label]:text-foreground [&_input]:h-9.5 sm:[&_input]:h-10 [&_input]:rounded-lg [&_input]:border-border [&_input]:bg-background/50 [&_input]:px-3 [&_input]:text-foreground [&_input]:shadow-xs [&_input]:transition [&_input]:duration-200 [&_input]:focus:border-primary [&_input]:focus:ring-2 [&_input]:focus:ring-ring/25">
                <Input
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="space-y-2.5 [&_label]:mb-1 [&_label]:text-xs sm:[&_label]:text-sm [&_label]:font-medium [&_label]:text-foreground [&_input]:h-9.5 sm:[&_input]:h-10 [&_input]:rounded-lg [&_input]:border-border [&_input]:bg-background/50 [&_input]:px-3 [&_input]:text-foreground [&_input]:shadow-xs [&_input]:transition [&_input]:duration-200 [&_input]:focus:border-primary [&_input]:focus:ring-2 [&_input]:focus:ring-ring/25 [&_button]:text-muted-foreground [&_button]:transition-colors [&_button:hover]:text-primary [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-ring">
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Phone Number"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                />
                <PasswordInput
                    label="Password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <PasswordStrength password={formData.password} />
            </div>

            <fieldset className="rounded-lg border border-border bg-muted/35 p-2.5 sm:p-3">
                <legend className="sr-only">Choose your role</legend>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">Choose your role</h3>
                <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground">Select how you want to use Bike Rental.</p>
                <div className="mt-2 grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => handleRole("CUSTOMER")}
                        aria-pressed={formData.role === "CUSTOMER"}
                        className={`flex items-center gap-2.5 rounded-lg border p-2 sm:p-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${formData.role === "CUSTOMER" ? "border-primary bg-primary/40 shadow-sm" : "border-border bg-card/40 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"}`}
                    >
                        <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                            <UserRound size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-xs sm:text-sm font-semibold text-foreground truncate">Customer</span>
                            <span className="mt-0.5 block text-[11px] sm:text-xs text-muted-foreground truncate">Rent bikes instantly</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRole("OWNER")}
                        aria-pressed={formData.role === "OWNER"}
                        className={`flex items-center gap-2.5 rounded-lg border p-2 sm:p-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${formData.role === "OWNER" ? "border-primary bg-primary/40 shadow-sm" : "border-border bg-card/40 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"}`}
                    >
                        <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                            <Bike size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-xs sm:text-sm font-semibold text-foreground truncate">Bike Owner</span>
                            <span className="mt-0.5 block text-[11px] sm:text-xs text-muted-foreground truncate">List bikes and earn</span>
                        </span>
                    </button>
                </div>
            </fieldset>

            <div className="pt-1 [&>button]:h-10 [&>button]:rounded-lg [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:shadow-md [&>button]:transition-all [&>button]:duration-200 [&>button:hover]:-translate-y-0.5 [&>button:hover]:bg-primary/90 [&>button:hover]:shadow-lg [&>button:focus-visible]:outline-none [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-ring [&>button:focus-visible]:ring-offset-2">
                <Button
                    title={formData.role === "OWNER" ? "Register as Bike Owner" : "Register as Customer"}
                    type="submit"
                    loading={loading}
                />
            </div>

            <p className="pt-1 text-center text-xs sm:text-sm text-muted-foreground">
                Already have an account?
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

export default RegisterForm;
