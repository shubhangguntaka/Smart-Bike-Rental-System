import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { Bike, PlusCircle, ArrowRight, LayoutDashboard, LogIn, UserPlus } from "lucide-react";

interface HeroActionsProps {
  className?: string;
}

export default function HeroActions({ className = "" }: HeroActionsProps) {
  const { isAuthenticated, user } = useAuth();

  const role = user?.role?.toUpperCase();
  const dashboardPath =
    role === "ADMIN"
      ? ROUTES.ADMIN.DASHBOARD
      : role === "OWNER"
      ? ROUTES.OWNER.DASHBOARD
      : ROUTES.CUSTOMER.DASHBOARD;

  const listBikePath = isAuthenticated
    ? (role === "OWNER" ? ROUTES.OWNER.ADD_BIKE : "/owner/add-bike")
    : `${ROUTES.REGISTER}?role=OWNER`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary Marketplace CTAs (Renter & Owner) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Primary CTA: Explore Bikes */}
        <Link
          to={ROUTES.BIKES}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200"
        >
          <Bike className="h-4 w-4" />
          <span>Explore Bikes</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>

        {/* Secondary CTA: List Your Bike */}
        <Link
          to={listBikePath}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-card hover:bg-muted/80 text-foreground border border-border/80 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all duration-200"
        >
          <PlusCircle className="h-4 w-4 text-primary" />
          <span>List Your Bike & Earn</span>
        </Link>
      </div>

      {/* Contextual Authentication / Dashboard Links */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
        {!isAuthenticated ? (
          <>
            <span className="flex items-center gap-2">
              <span>Already have an account?</span>
              <Link
                to={ROUTES.LOGIN}
                className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <LogIn className="h-4 w-4" />
                <span>Log in</span>
              </Link>
            </span>
            <span className="text-border">•</span>
            <Link
              to={ROUTES.REGISTER}
              className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </Link>
          </>
        ) : (
          <Link
            to={dashboardPath}
            className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Go to your {role || "User"} Dashboard →</span>
          </Link>
        )}
      </div>
    </div>
  );
}
