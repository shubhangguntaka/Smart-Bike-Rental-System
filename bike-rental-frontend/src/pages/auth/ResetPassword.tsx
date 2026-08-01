import AuthLayout from "../../layouts/AuthLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

const ResetPassword = () => {

    return (

        <AuthLayout

            title="Reset Password"

            subtitle="Create a new password"

        >

            <ResetPasswordForm />

        </AuthLayout>

    );

};

export default ResetPassword;