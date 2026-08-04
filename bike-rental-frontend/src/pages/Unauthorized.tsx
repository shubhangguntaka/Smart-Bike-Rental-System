import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  const { user } = useAuth();
  const role = (user?.role || "").toUpperCase();

  let dashboardPath = "/customer/dashboard";
  if (role === "ADMIN") {
    dashboardPath = "/admin/dashboard";
  } else if (role === "OWNER") {
    dashboardPath = "/owner/dashboard";
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground p-6">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-lg">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-destructive">403</h1>
        <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You do not have the required permissions to access this page.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to={dashboardPath}
            className="px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-xl cursor-pointer shadow-sm active:scale-95 text-center"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-bold bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-foreground transition-all rounded-xl cursor-pointer shadow-sm active:scale-95 text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
