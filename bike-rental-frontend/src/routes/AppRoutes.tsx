import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

// Guards
import ProtectedRoute from "./ProtectedRoute";
import AuthRoutes from "./AuthRoutes";

// Public Pages
import Home from "@/pages/Home";
import Bikes from "@/pages/Bikes";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Test from "@/pages/Test";
import DocumentVerification from "@/pages/verification/DocumentVerification";
import OwnerVerification from "@/pages/owner/OwnerVerification";

// Customer Pages
import CustomerDashboard from "../pages/customer/Dashboard";
import CustomerBikes from "../pages/customer/Bikes";
import CustomerBookings from "../pages/customer/Bookings";
import CustomerProfile from "../pages/customer/Profile";
import CustomerSettings from "../pages/customer/Settings";

// Owner Pages
import OwnerDashboard from "@/pages/owner/Dashboard";
import OwnerBikes from "@/pages/owner/Bikes";
import OwnerBookings from "@/pages/owner/Bookings";
import OwnerPayments from "@/pages/owner/Payments";
import OwnerProfile from "@/pages/owner/Profile";
import OwnerSettings from "@/pages/owner/Settings";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminBikes from "@/pages/admin/Bikes";
import AdminPayments from "@/pages/admin/Payments";
import AdminVerification from "@/pages/admin/Verification";
import AdminSettings from "@/pages/admin/Settings";
import AdminProfile from "@/pages/admin/Profile";
import AdminReports from "@/pages/admin/Reports";

// Error Pages
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "../pages/errors/NotFound";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="bikes" element={<Bikes />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="test" element={<Test />} />
          {/* Public testing routes (intentionally bypass auth guards) */}
          <Route path="verification" element={<DocumentVerification />} />
          <Route path="bike-verification" element={<OwnerVerification />} />
        </Route>

        {/* Auth Routes */}
        {AuthRoutes}

        {/* Customer Dashboard Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="bikes" element={<CustomerBikes />} />
          <Route path="bookings" element={<CustomerBookings />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>

        {/* Owner Dashboard Routes */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="bikes" element={<OwnerBikes />} />
          <Route path="bookings" element={<OwnerBookings />} />
          <Route path="payments" element={<OwnerPayments />} />
          <Route path="profile" element={<OwnerProfile />} />
          <Route path="settings" element={<OwnerSettings />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="bikes" element={<AdminBikes />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="verification" element={<AdminVerification />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;