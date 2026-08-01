import AuthLayout from "../../layouts/AuthLayout";
import VerifyOtpForm from "../../components/auth/VerifyOtpForm";

const VerifyOtp = () => {

    return (

        <AuthLayout

            title="Verify OTP"

            subtitle="Email Verification"

        >

            <VerifyOtpForm />

        </AuthLayout>

    );

};

export default VerifyOtp;