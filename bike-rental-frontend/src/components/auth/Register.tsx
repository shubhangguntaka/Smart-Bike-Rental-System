import AuthLayout from "../../layouts/AuthLayout";
import RegisterForm from "../../components/auth/RegisterForm";

const Register = () => {

    return (

        <AuthLayout

            title="Create Account"

            subtitle="Register your Bike Rental account"

        >

            <RegisterForm />

        </AuthLayout>

    );

};

export default Register;