import Footer from "@/components/layouts/Footer/Footer";
import Navbar from "@/components/layouts/Navbar";
import { Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-background text-foreground">
      <Navbar />

      <main className={`flex-1 w-full max-w-full overflow-x-hidden ${isHomePage ? "" : "pt-16"}`}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}