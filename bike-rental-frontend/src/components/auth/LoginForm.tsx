import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../common/Input";
import Button from "../common/Button";
import useAuth from "../../hooks/useAuth";
import { login } from "../../services/authService";

const LoginForm = () => {

    const navigate = useNavigate();

    const { login: saveLogin } = useAuth();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({

        email: "",

        password: ""

    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        // ===========================
        // Frontend Validation
        // ===========================

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

        // ===========================
        // API Call
        // ===========================

        try {

            setLoading(true);

            const response = await login(formData);

            saveLogin({

                token: response.data.token,

                user: {

                    id: response.data.userId,

                    firstName: response.data.firstName,

                    lastName: response.data.lastName,

                    email: response.data.email,

                    role: response.data.role

                }

            });

            toast.success("Login Successful");

            switch (response.data.role) {

                case "ADMIN":

                    navigate("/admin/dashboard");

                    break;

                case "OWNER":

                    navigate("/owner/dashboard");

                    break;

                default:

                    navigate("/customer/dashboard");

            }

        }

        catch (error: any) {

            const response = error.response?.data;

            if (response?.data) {

                const errors = Object.values(response.data);

                toast.error(errors.join(", "));

            } else {

                toast.error(

                    response?.message ||

                    "Login Failed"

                );

            }

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <form

            onSubmit={handleSubmit}

            className="space-y-3"

        >

            <Input

                label="Email"

                name="email"

                type="email"

                value={formData.email}

                onChange={handleChange}

            />

            <Input

                label="Password"

                name="password"

                type="password"

                value={formData.password}

                onChange={handleChange}

            />

            <div className="text-right">

                <Link

                    to="/forgot-password"

                    className="text-sm text-blue-600 hover:underline"

                >

                    Forgot Password?

                </Link>

            </div>

            <Button

                title="Login"

                type="submit"

                loading={loading}

            />

            <p className="text-center text-sm">

                Don't have an account?

                <Link

                    to="/register"

                    className="ml-2 font-semibold text-blue-600"

                >

                    Register

                </Link>

            </p>

        </form>

    );

};

export default LoginForm;