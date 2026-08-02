import AuthLayout from "../../layouts/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";

const Login = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to your Bike Rental account"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;