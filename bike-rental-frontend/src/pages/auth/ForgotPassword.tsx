import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        try {

            setLoading(true);

            await forgotPassword({

                email

            });

            alert("OTP Sent Successfully");

            navigate("/reset-password", {

                state: {

                    email

                }

            });

        }

        catch (error: any) {

            alert(error.response?.data?.message);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <AuthLayout

            title="Forgot Password"

            subtitle="Reset your password"

        >

            <form
                onSubmit={handleSubmit}
                className="auth-recovery-form"
            >

                <Input

                    label="Email"

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

        </AuthLayout>

    );

};

export default ForgotPassword;
