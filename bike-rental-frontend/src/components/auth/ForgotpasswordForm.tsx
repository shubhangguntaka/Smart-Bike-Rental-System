import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../common/Button";
import Input from "../common/Input";
import { forgotPassword } from "../../services/authService";

const ForgotPasswordForm = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        // ==========================
        // Frontend Validation
        // ==========================

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

                email

            });

            toast.success("OTP sent successfully.");

            navigate("/verify-otp", {

                state: {

                    email,

                    purpose: "FORGOT_PASSWORD"

                }

            });

        }

        catch (error: any) {

            const response = error.response?.data;

            if (response?.data) {

                const errors = Object.values(response.data);

                toast.error(errors.join(", "));

            } else {

                toast.error(

                    response?.message ||

                    "Unable to send OTP."

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

            className="auth-recovery-form"

        >

            <Input

                label="Registered Email"

                type="email"

                name="email"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

            />

            <Button

                title="Send OTP"

                loading={loading}

                type="submit"

            />

        </form>

    );

};

export default ForgotPasswordForm;
