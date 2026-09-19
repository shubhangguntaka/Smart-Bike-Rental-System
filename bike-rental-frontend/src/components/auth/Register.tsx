// import AuthLayout from "../../layouts/AuthLayout";
// import RegisterForm from "../../components/auth/RegisterForm";

// const Register = () => {

//     return (

//         <AuthLayout

//             title="Create Account"

//             subtitle="Register your Bike Rental account"

//         >

//             <RegisterForm />

//         </AuthLayout>

//     );

// };

// export default Register;


import AuthLayout from "../../layouts/AuthLayout";
import RegisterForm from "./RegisterForm";

const Register = () => {
    return (
        <AuthLayout
            title="Create Account"
            subtitle="Register as a Customer or Bike Owner"
        >
            <RegisterForm />
        </AuthLayout>
    );
};

export default Register;