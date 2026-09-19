import AuthLayout from "../../layouts/AuthLayout";
import ForgotPasswordForm from "../../components/auth/ForgotpasswordForm";

const ForgotPassword = () => {
    return (
        <AuthLayout
            title="Forgot Password"
            subtitle="Enter your email to receive a recovery code"
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
};

export default ForgotPassword;
