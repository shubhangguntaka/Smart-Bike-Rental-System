import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../common/Input";
import Button from "../common/Button";

import { verifyOtp } from "../../services/authService";

const VerifyOtpForm = () => {

    const navigate = useNavigate();

    const location = useLocation();

    const email = location.state?.email || "";

    const purpose = location.state?.purpose || "EMAIL_VERIFICATION";

    const [loading, setLoading] = useState(false);

    const [otp, setOtp] = useState("");

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        // ======================
        // Validation
        // ======================

        if (!otp.trim()) {

            toast.error("OTP is required.");

            return;

        }

        if (otp.length !== 6) {

            toast.error("OTP must be 6 digits.");

            return;

        }

        try {

            setLoading(true);

            await verifyOtp({

                email,

                otp,

                purpose

            });

            toast.success("OTP Verified Successfully");

            if (purpose === "FORGOT_PASSWORD") {

                navigate("/reset-password", {

                    state: {

                        email

                    }

                });

            } else {

                navigate("/login");

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

                    "Invalid OTP"

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

            className="space-y-6"

        >

            <div className="text-center">

                <p className="text-gray-500">

                    OTP sent to

                </p>

                <h2 className="font-semibold text-blue-600">

                    {email}

                </h2>

            </div>

            <Input

                label="Enter OTP"

                name="otp"

                value={otp}

                onChange={(e) => setOtp(e.target.value)}

            />

            <Button

                title="Verify OTP"

                type="submit"

                loading={loading}

            />

        </form>

    );

};

export default VerifyOtpForm;