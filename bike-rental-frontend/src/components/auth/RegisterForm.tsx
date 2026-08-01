import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../common/Input";
import Button from "../common/Button";
import PasswordStrength from "../common/PasswordStrength";

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
        role: "CUSTOMER"
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

        // ==========================
        // Frontend Validation
        // ==========================

        if (!formData.firstName.trim()) {

            toast.error("First Name is required.");

            return;

        }

        if (!formData.lastName.trim()) {

            toast.error("Last Name is required.");

            return;

        }

        if (!formData.email.trim()) {

            toast.error("Email is required.");

            return;

        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {

            toast.error("Please enter a valid email.");

            return;

        }

        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(formData.phoneNumber)) {

            toast.error("Phone number must be a valid 10-digit Indian mobile number.");

            return;

        }

        if (!formData.password.trim()) {

            toast.error("Password is required.");

            return;

        }

        if (formData.password.length < 8) {

            toast.error("Password must be at least 8 characters.");

            return;

        }

        if (formData.password.length > 20) {

            toast.error("Password cannot exceed 20 characters.");

            return;

        }

        try {

            setLoading(true);

            await register(formData);

            toast.success("Registration Successful");

            navigate("/verify-otp", {

                state: {

                    email: formData.email,

                    purpose: "EMAIL_VERIFICATION"

                }

            });

        }

        catch (error: any) {

            const response = error.response?.data;

            // Backend Validation Errors
            if (response?.data) {

                const errors = Object.values(response.data);

                toast.error(errors.join(", "));

            } else {

                toast.error(

                    response?.message ||

                    "Registration Failed"

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

            className="space-y-5"

        >

            <div className="grid grid-cols-2 gap-4">

                <Input

                    label="First Name"

                    name="firstName"

                    value={formData.firstName}

                    onChange={handleChange}

                />

                <Input

                    label="Last Name"

                    name="lastName"

                    value={formData.lastName}

                    onChange={handleChange}

                />

            </div>

            <Input

                label="Email"

                type="email"

                name="email"

                value={formData.email}

                onChange={handleChange}

            />

            <Input

                label="Phone Number"

                name="phoneNumber"

                value={formData.phoneNumber}

                onChange={handleChange}

            />

            <Input

                label="Password"

                type="password"

                name="password"

                value={formData.password}

                onChange={handleChange}

            />

            <PasswordStrength

                password={formData.password}

            />

            <div>

                <label className="block mb-2 font-medium">

                    Register As

                </label>

                <select

                    name="role"

                    value={formData.role}

                    onChange={handleChange}

                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-600 focus:outline-none"

                >

                    <option value="CUSTOMER">

                        Customer

                    </option>

                    <option value="OWNER">

                        Bike Owner

                    </option>

                </select>

            </div>

            <Button

                title="Create Account"

                type="submit"

                loading={loading}

            />

            <p className="text-center text-sm">

                Already have an account?

                <Link

                    to="/login"

                    className="ml-2 font-semibold text-blue-600"

                >

                    Login

                </Link>

            </p>

        </form>

    );

};

export default RegisterForm;