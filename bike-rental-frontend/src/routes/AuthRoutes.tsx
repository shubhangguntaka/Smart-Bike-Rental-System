import { Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import AuthGuard from "./AuthGuard";
import Reviews from "../pages/customer/Reviews";
import Notifications from "../pages/customer/Notifications";
const AuthRoutes = (
  <>
    <Route
      path="/login"
      element={
        <AuthGuard>
          <Login />
        </AuthGuard>
      }
    />
    <Route
      path="/register"
      element={
        <AuthGuard>
          <Register />
        </AuthGuard>
      }
    />
    <Route
      path="/verify-otp"
      element={
        <AuthGuard>
          <VerifyOtp />
        </AuthGuard>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <AuthGuard>
          <ForgotPassword />
        </AuthGuard>
      }
    />
    <Route
      path="/reset-password"
      element={
        <AuthGuard>
          <ResetPassword />
        </AuthGuard>
      }
    />
    <Route path="/reviews" element={<Reviews />} />

<Route path="/notifications" element={<Notifications />} />
  </>
);

export default AuthRoutes;