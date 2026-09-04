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
import CustomerBookings from "../pages/customer/Bookings";
import CustomerBikeDetails from "../pages/customer/BikeDetails";
import CustomerProfile from "../pages/customer/Profile";
import CustomerSettings from "../pages/customer/Settings";
import BookingDetails from "../pages/customer/BookingDetails";
import BookingHistory from "../pages/customer/BookingHistory";
import RideTracking from "../pages/customer/RideTracking";
import BookingQRCodePage from "../pages/customer/BookingQRCodePage";
import Payment from "../pages/customer/Payment";
import PaymentSuccess from "@/pages/customer/PaymentSuccess";
import PaymentFailed from "@/pages/customer/PaymentFailed";
import PaymentHistory from "@/pages/customer/PaymentHistory";
import PaymentDetails from "@/pages/customer/PaymentDetails";
import InvoicePage from "@/pages/customer/InvoicePage";
import Notifications from "../pages/customer/Notifications";
import LiveGPS from "../pages/customer/LiveGPS";
import RideHistory from "../pages/customer/RideHistory";

// Owner Pages
import OwnerDashboard from "@/pages/owner/Dashboard";
import OwnerBikes from "@/pages/owner/Bikes";
import AddBike from "@/pages/owner/AddBike";
import EditBike from "@/pages/owner/EditBike";
import BikeDetails from "@/pages/owner/BikeDetails";
import OwnerBookings from "@/pages/owner/Bookings";
import OwnerPayments from "@/pages/owner/Payments";
import OwnerProfile from "@/pages/owner/Profile";
import OwnerSettings from "@/pages/owner/Settings";
import TrackBike from "@/pages/owner/TrackBike";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminBikes from "@/pages/admin/Bikes";
import AdminPayments from "@/pages/admin/Payments";
import AdminVerification from "@/pages/admin/Verification";
import AdminSettings from "@/pages/admin/Settings";
import AdminProfile from "@/pages/admin/Profile";
import AdminReports from "@/pages/admin/Reports";

// Map Pages
import MapPage from "@/pages/maps/MapPage";

// Error Pages
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "../pages/errors/NotFound";

// Static Info Pages
import { PricingPage, FAQPage, HelpPage, PrivacyPolicyPage, TermsPage } from "@/pages/StaticPages";
import AdminOwners from "@/pages/admin/Owners";
import AdminBookings from "@/pages/admin/Bookings";
import AdminCustomers from "@/pages/admin/Customers";
import AdminActivity from "@/pages/admin/Activity";
import ComingSoon from "@/pages/ComingSoon";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="bikes" element={<Bikes />} />
          <Route path="nearby-bikes" element={<Bikes />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="maps" element={<MapPage />} />
          <Route path="bikes/:bikeId" element={<CustomerBikeDetails />} />
          <Route path="bike/:bikeId" element={<CustomerBikeDetails />} />
          {/* <Route path="pricing" element={<PricingPage />} /> */}
          {/* <Route path="faq" element={<FAQPage />} /> */}
          {/* <Route path="help" element={<HelpPage />} /> */}
          {/* <Route path="privacy" element={<PrivacyPolicyPage />} /> */}
          {/* <Route path="terms" element={<TermsPage />} /> */}
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
          <Route index element={<Navigate to="/customer/bikes" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="explore-bikes" element={<Bikes />} />
          <Route path="nearby-bikes" element={<MapPage />} />
          <Route path="bookings" element={<CustomerBookings />} />
          <Route path="book/:bikeId" element={<Navigate to="/customer/explore-bikes" replace />} />
          <Route path="booking/:id" element={<BookingDetails />} />
          <Route path="payment/:bookingId" element={<Payment />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/failed" element={<PaymentFailed />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="settings" element={<CustomerSettings />} />
          <Route path="book-bike" element={<Navigate to="/customer/explore-bikes" replace />} />
          <Route path="booking-history" element={<BookingHistory />} />

          <Route
            path="ride-tracking"
            element={<RideTracking />}
          />

          <Route
            path="live-gps"
            element={<LiveGPS />}
          />

          <Route
            path="ride-history"
            element={<RideHistory />}
          />

          <Route
            path="booking-qr/:id"
            element={<BookingQRCodePage />}
          />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="payments/:id" element={<PaymentDetails />} />
          <Route path="payments/:id/invoice" element={<InvoicePage />} />
          <Route path="invoice/:id" element={<InvoicePage />} />
          <Route path="payment-history" element={<Navigate to="/customer/payments" replace />} />
          <Route path="bikes/:bikeId" element={<CustomerBikeDetails />} />
          <Route path="bike/:bikeId" element={<CustomerBikeDetails />} />
          <Route path="verification" element={<DocumentVerification />} />
          <Route path="notifications" element={<Notifications />} />
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
          <Route path="bikes/:bikeId" element={<BikeDetails />} />
          <Route path="bike/:bikeId" element={<BikeDetails />} />
          <Route path="add-bike" element={<AddBike />} />
          <Route path="edit-bike/:bikeId" element={<EditBike />} />
          <Route path="bookings" element={<OwnerBookings />} />
          <Route path="payments" element={<ComingSoon />} />
          <Route path="earnings" element={<OwnerPayments />} />
          <Route path="documents" element={<OwnerVerification />} />
          <Route path="profile" element={<OwnerProfile />} />
          <Route path="settings" element={<OwnerSettings />} />
          <Route path="scan-booking" element={<Navigate to="/owner/bookings" replace />} />
          <Route path="track-bike/:rideId" element={<TrackBike />} />
          <Route path="notifications" element={<Notifications />} />
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
          <Route path="owners" element={<AdminOwners />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Route Aliases */}
        <Route path="/verification" element={<Navigate to="/customer/verification" replace />} />
        <Route path="/dashboard" element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="/booking-history" element={<Navigate to="/customer/booking-history" replace />} />
        <Route path="/ride-tracking" element={<Navigate to="/customer/ride-tracking" replace />} />

        {/* Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
