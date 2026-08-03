import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  const { user } = useAuth();
  const role = (user?.role || "").toUpperCase();

  let dashboardPath = "/login";
  if (user) {
    if (role === "ADMIN") {
      dashboardPath = "/admin/dashboard";
    } else if (role === "OWNER") {
      dashboardPath = "/owner/dashboard";
    } else {
      dashboardPath = "/customer/dashboard";
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground p-6">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-lg">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2 animate-bounce">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-destructive">403</h1>
        <h2 className="text-lg font-bold text-foreground">Forbidden Access</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your account is authenticated, but you do not hold the required role credentials to access this secure resource.
        </p>

        <div className="pt-2">
          {user ? (
            <Link
              to={dashboardPath}
              className="inline-block px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-xl cursor-pointer shadow-sm active:scale-95"
            >
              Back to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-block px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-xl cursor-pointer shadow-sm active:scale-95"
            >
              Return to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}