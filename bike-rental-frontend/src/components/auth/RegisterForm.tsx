// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// import Input from "../common/Input";
// import Button from "../common/Button";
// import PasswordStrength from "../common/PasswordStrength";

// import { register } from "../../services/authService";
// import type { RegisterRequest } from "../../types/auth";

// const RegisterForm = () => {

//     const navigate = useNavigate();

//     const [loading, setLoading] = useState(false);

//     const [formData, setFormData] = useState<RegisterRequest>({
//         firstName: "",
//         lastName: "",
//         email: "",
//         phoneNumber: "",
//         password: "",
//         role: "CUSTOMER"
//     });

//     const handleChange = (
//         e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//     ) => {

//         setFormData({

//             ...formData,

//             [e.target.name]: e.target.value

//         });

//     };

//     const handleSubmit = async (
//         e: React.FormEvent<HTMLFormElement>
//     ) => {

//         e.preventDefault();

//         // ==========================
//         // Frontend Validation
//         // ==========================

//         if (!formData.firstName.trim()) {

//             toast.error("First Name is required.");

//             return;

//         }

//         if (!formData.lastName.trim()) {

//             toast.error("Last Name is required.");

//             return;

//         }

//         if (!formData.email.trim()) {

//             toast.error("Email is required.");

//             return;

//         }

//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         if (!emailRegex.test(formData.email)) {

//             toast.error("Please enter a valid email.");

//             return;

//         }

//         const phoneRegex = /^[6-9]\d{9}$/;

//         if (!phoneRegex.test(formData.phoneNumber)) {

//             toast.error("Phone number must be a valid 10-digit Indian mobile number.");

//             return;

//         }

//         if (!formData.password.trim()) {

//             toast.error("Password is required.");

//             return;

//         }

//         if (formData.password.length < 8) {

//             toast.error("Password must be at least 8 characters.");

//             return;

//         }

//         if (formData.password.length > 20) {

//             toast.error("Password cannot exceed 20 characters.");

//             return;

//         }

//         try {

//             setLoading(true);

//             await register(formData);

//             toast.success("Registration Successful");

//             navigate("/verify-otp", {

//                 state: {

//                     email: formData.email,

//                     purpose: "EMAIL_VERIFICATION"

//                 }

//             });

//         }

//         catch (error: any) {

//             const response = error.response?.data;

//             // Backend Validation Errors
//             if (response?.data) {

//                 const errors = Object.values(response.data);

//                 toast.error(errors.join(", "));

//             } else {

//                 toast.error(

//                     response?.message ||

//                     "Registration Failed"

//                 );

//             }

//         }

//         finally {

//             setLoading(false);

//         }

//     };

//     return (

//     <form

//         onSubmit={handleSubmit}

//         className="space-y-4"

//     >

//         <div className="grid grid-cols-2 gap-4">

//             <Input

//                 label="First Name"

//                 name="firstName"

//                 value={formData.firstName}

//                 onChange={handleChange}

//             />

//             <Input

//                 label="Last Name"

//                 name="lastName"

//                 value={formData.lastName}

//                 onChange={handleChange}

//             />

//         </div>

//         <Input

//             label="Email Address"

//             type="email"

//             name="email"

//             value={formData.email}

//             onChange={handleChange}

//         />

//         <Input

//             label="Phone Number"

//             name="phoneNumber"

//             value={formData.phoneNumber}

//             onChange={handleChange}

//         />

//         <Input

//             label="Password"

//             type="password"

//             name="password"

//             value={formData.password}

//             onChange={handleChange}

//         />

//         <PasswordStrength

//             password={formData.password}

//         />

//         <div>

//             <h3 className="text-lg font-semibold mb-1">

//                 Choose Your Role

//             </h3>

//             <p className="text-sm text-gray-500 mb-4">

//                 Select how you want to use Bike Rental.

//             </p>

//             <div className="grid grid-cols-2 gap-4">

//                 {/* Customer */}

//                 <div

//                     onClick={() =>
//                         setFormData({
//                             ...formData,
//                             role: "CUSTOMER"
//                         })
//                     }

//                     className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-300

//                     ${formData.role === "CUSTOMER"

//                             ? "border-blue-600 bg-blue-50 shadow-lg"

//                             : "border-gray-200 hover:border-blue-500"

//                         }`}

//                 >

//                     <div className="text-4xl">

//                         👤

//                     </div>

//                     <h2 className="mt-3 font-bold">

//                         Customer

//                     </h2>

//                     <p className="text-sm text-gray-500 mt-2">

//                         Rent bikes anywhere, anytime.

//                     </p>

//                 </div>

//                 {/* Bike Owner */}

//                 <div

//                     onClick={() =>
//                         setFormData({
//                             ...formData,
//                             role: "OWNER"
//                         })
//                     }

//                     className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-300

//                     ${formData.role === "OWNER"

//                             ? "border-green-600 bg-green-50 shadow-lg"

//                             : "border-gray-200 hover:border-green-500"

//                         }`}

//                 >

//                     <div className="text-4xl">

//                         🏍️

//                     </div>

//                     <h2 className="mt-3 font-bold">

//                         Bike Owner

//                     </h2>

//                     <p className="text-sm text-gray-500 mt-2">

//                         List your bikes and earn money.

//                     </p>

//                 </div>

//             </div>

//         </div>

//         <Button

//             title={

//                 formData.role === "OWNER"

//                     ? "Register as Bike Owner"

//                     : "Register as Customer"

//             }

//             type="submit"

//             loading={loading}

//         />

//         <p className="text-center text-sm">

//             Already have an account?

//             <Link

//                 to="/login"

//                 className="ml-2 text-blue-600 font-semibold hover:underline"

//             >

//                 Login

//             </Link>

//         </p>

//     </form>

// );
// };

// export default RegisterForm;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Input from "../common/Input";
import Button from "../common/Button";
import PasswordStrength from "../common/PasswordStrength";
import PasswordInput from "../common/PasswordInput";
import { register } from "../../services/authService";
import type { RegisterRequest } from "../../types/auth";

const RegisterForm = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<RegisterRequest>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "CUSTOMER",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,

        });

    };

    const handleRole = (role: "CUSTOMER" | "OWNER") => {

        setFormData({

            ...formData,

            role,

        });

    };

    const validate = () => {

        if (!formData.firstName.trim()) {
            toast.error("First Name is required");
            return false;
        }

        if (!formData.lastName.trim()) {
            toast.error("Last Name is required");
            return false;
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            toast.error("Invalid Email");
            return false;
        }

        const phoneRegex =
            /^[6-9]\d{9}$/;

        if (!phoneRegex.test(formData.phoneNumber)) {
            toast.error("Invalid Phone Number");
            return false;
        }

        if (formData.password.length < 8) {
            toast.error("Password should be at least 8 characters");
            return false;
        }

        return true;

    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!validate()) return;

        try {

            setLoading(true);

            await register(formData);

            toast.success("Registration Successful");

            navigate("/verify-otp", {

                state: {

                    email: formData.email,

                    purpose: "EMAIL_VERIFICATION",

                },

            });

        }

        catch (error: any) {

            const response = error.response?.data;

            if (response?.data) {

                toast.error(

                    Object.values(response.data).join(",")

                );

            }

            else {

                toast.error(

                    response?.message ||

                    "Registration Failed"

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
            className="space-y-4"
        >

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">

                <Input
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                />

                <Input
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                />

            </div>

            <div className="space-y-2.5">

                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <Input
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                />

                <PasswordInput
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <PasswordStrength
                    password={formData.password}
                />

            </div>

            <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3">

                <h3 className="text-sm font-semibold text-slate-900">

                    Choose Your Role

                </h3>

                <p className="mt-1 text-xs text-slate-500 mb-2">

                    Select how you want to use Bike Rental

                </p>

                <div className="grid gap-2.5 sm:grid-cols-2">
                                        {/* Customer */}

                    <div
                        onClick={() => handleRole("CUSTOMER")}
                        className={`group cursor-pointer transform rounded-[16px] border-2 p-2.5 transition duration-300 ${
                            formData.role === "CUSTOMER"
                                ? "border-blue-600 bg-blue-50 shadow-lg"
                                : "border-slate-200 bg-white hover:-translate-y-1 hover:shadow-xl"
                        }`}
                    >

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xl">

                                👤

                            </div>

                            <div>

                                <h4 className="font-semibold text-gray-800">

                                    Customer

                                </h4>

                                <p className="text-xs text-gray-500">

                                    Rent bikes instantly

                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Bike Owner */}

                    <div
                        onClick={() => handleRole("OWNER")}
                        className={`group cursor-pointer transform rounded-[16px] border-2 p-2.5 transition duration-300 ${
                            formData.role === "OWNER"
                                ? "border-emerald-600 bg-emerald-50 shadow-lg"
                                : "border-slate-200 bg-white hover:-translate-y-1 hover:shadow-xl"
                        }`}
                    >

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-xl">

                                🏍️

                            </div>

                            <div>

                                <h4 className="font-semibold text-gray-800">

                                    Bike Owner

                                </h4>

                                <p className="text-xs text-gray-500">

                                    Rent out your bikes

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <Button
                title={
                    formData.role === "OWNER"
                        ? "Register as Bike Owner"
                        : "Register as Customer"
                }
                type="submit"
                loading={loading}
            />

            <div className="text-center">

                <span className="text-sm text-gray-600">

                    Already have an account?

                </span>

                <Link
                    to="/login"
                    className="ml-2 font-semibold text-blue-600 hover:text-blue-700"
                >

                    Login

                </Link>

            </div>

        </form>

    );

};

export default RegisterForm;