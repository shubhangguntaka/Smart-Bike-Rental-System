import {

BrowserRouter,

Routes,

Route,

Navigate

} from "react-router-dom";


import Register from "../pages/auth/Register";

import ForgotPassword from "../pages/auth/ForgotPassword";

import VerifyOtp from "../pages/auth/VerifyOtp";

import ResetPassword from "../pages/auth/ResetPassword";

import Dashboard from "../pages/customer/Dashboard";

import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/auth/Login";

const AppRoutes=()=>{

return(

<BrowserRouter>

<Routes>

<Route

path="/"

element={<Navigate to="/login"/>}

/>

<Route

path="/login"

element={<Login/>}

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

<Route

path="/dashboard"

element={

<ProtectedRoute>

<Dashboard/>

</ProtectedRoute>

}

/>

</Routes>

</BrowserRouter>

)

}

export default AppRoutes;