import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../common/Input";
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

        // ==========================
        // Frontend Validation
        // ==========================

        if (!formData.otp.trim()) {

            toast.error("OTP is required.");

            return;

        }

        if (formData.otp.length !== 6) {

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

                otp: formData.otp,

                newPassword: formData.newPassword

            });

            toast.success("Password Reset Successfully.");

            navigate("/login");

        }

        catch (error: any) {

            const response = error.response?.data;

            if (response?.data) {

                const errors = Object.values(response.data);

                toast.error(errors.join(", "));

            } else {

                toast.error(

                    response?.message ||

                    "Password Reset Failed"

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

            <Input

                label="OTP"

                name="otp"

                value={formData.otp}

                onChange={handleChange}

            />

            <Input

                label="New Password"

                type="password"

                name="newPassword"

                value={formData.newPassword}

                onChange={handleChange}

            />

            <Input

                label="Confirm Password"

                type="password"

                name="confirmPassword"

                value={formData.confirmPassword}

                onChange={handleChange}

            />

            <Button

                title="Reset Password"

                type="submit"

                loading={loading}

            />

        </form>

    );

};

export default ResetPasswordForm;