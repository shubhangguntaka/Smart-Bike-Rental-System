import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../common/Input";
import Button from "../common/Button";
import useAuth from "../../hooks/useAuth";
import { login } from "../../services/authService";
import { ROUTES } from "../../constants/routes";

const LoginForm = () => {
    const navigate = useNavigate();
    const { login: saveLogin } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.email.trim()) {
            toast.error("Email is required");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email.");
            return;
        }
        if (!formData.password.trim()) {
            toast.error("Password is required");
            return;
        }
        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        try {
            setLoading(true);
            const response = await login({
                email: formData.email.trim(),
                password: formData.password.trim()
            });
            const authData = response.data?.data || response.data;

            if (!authData || (!authData.accessToken && !authData.token)) {
                throw new Error("Invalid server response on login.");
            }

            const token = authData.accessToken || authData.token;

            await saveLogin({
                token: token,
                refreshToken: authData.refreshToken,
                user: {
                    id: authData.userId,
                    fullName: authData.name || `${authData.firstName || ''} ${authData.lastName || ''}`.trim(),
                    email: authData.email,
                    role: authData.role,
                    phoneNumber: authData.phoneNumber,
                },
            });

            toast.success("Login Successful");

            const userRole = String(authData.role || "CUSTOMER").toUpperCase();
            switch (userRole) {
                case "ADMIN":
                    navigate(ROUTES.ADMIN.DASHBOARD);
                    break;
                case "OWNER":
                    navigate(ROUTES.OWNER.DASHBOARD);
                    break;
                default:
                    navigate(ROUTES.CUSTOMER.DASHBOARD);
            }
        } catch (error: any) {
            console.error("Login attempt failed:", error);
            const response = error.response?.data;
            if (response?.message) {
                toast.error(response.message);
            } else if (response?.data && typeof response.data === "object") {
                const errors = Object.values(response.data);
                toast.error(errors.join(", "));
            } else {
                toast.error(error.message || "Invalid email or password.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 [&_label]:mb-1.5 [&_label]:text-sm [&_label]:font-medium [&_label]:text-foreground [&_input]:h-10 [&_input]:rounded-lg [&_input]:border-border [&_input]:bg-background/50 [&_input]:px-3 [&_input]:text-foreground [&_input]:shadow-xs [&_input]:transition [&_input]:duration-200 [&_input]:focus:border-primary [&_input]:focus:ring-2 [&_input]:focus:ring-ring/25">
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
            </div>

            <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-secondary transition-colors hover:text-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    Forgot password?
                </Link>
            </div>

            <div className="[&>button]:h-10 [&>button]:rounded-lg [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:shadow-md [&>button]:transition-all [&>button]:duration-200 [&>button:hover]:-translate-y-0.5 [&>button:hover]:bg-primary/90 [&>button:hover]:shadow-lg [&>button:focus-visible]:outline-none [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-ring [&>button:focus-visible]:ring-offset-2">
                <Button title="Sign in" type="submit" loading={loading} />
            </div>

            <p className="pt-1 text-center text-sm text-muted-foreground">
                New to Bike Rental?
                <Link to="/register" className="ml-2 font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    Create an account
                </Link>
            </p>
        </form>
    );
};

export default LoginForm;
