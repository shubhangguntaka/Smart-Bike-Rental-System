import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

import { register } from "../../services/authService";

const Register = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({

        firstName: "",

        lastName: "",

        email: "",

        phoneNumber: "",

        password: "",

        role: "CUSTOMER"

    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        try {

            setLoading(true);

            await register(formData);

            alert("Registration successful. Verify OTP.");

            navigate("/verify-otp", {
                state: {
                    email: formData.email
                }
            });

        } catch (error: any) {

            alert(error.response?.data?.message || "Registration Failed");

        } finally {

            setLoading(false);

        }

    };

    return (

        <AuthLayout

            title="Create Account"

            subtitle="Register to continue"

        >

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >

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

                <Button

                    type="submit"

                    title="Register"

                    loading={loading}

                />

            </form>

            <p className="mt-6 text-center">

                Already have an account?

                <Link

                    className="ml-2 text-blue-600"

                    to="/login"

                >

                    Login

                </Link>

            </p>

        </AuthLayout>

    );

};

export default Register;