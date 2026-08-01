import { Route } from "react-router-dom";

import Login from "../pages/auth/Login";

import Register from "../pages/auth/Register";

import ForgotPassword from "../pages/auth/ForgotPassword";

import VerifyOtp from "../pages/auth/VerifyOtp";

import ResetPassword from "../pages/auth/ResetPassword";

const AuthRoutes=(

<>

<Route

path="/login"

element={

<AuthGuard>

<Login/>

</AuthGuard>

}

/>

<Route

path="/register"

element={<Register/>}

/>

<Route

path="/verify-otp"

element={<VerifyOtp/>}

/>

<Route

path="/forgot-password"

element={<ForgotPassword/>}

/>

<Route

path="/reset-password"

element={<ResetPassword/>}

/>

</>

)

export default AuthRoutes;