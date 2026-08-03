import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";

interface Props {
    children: ReactElement;
}

const AuthGuard = ({ children }: Props) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (isAuthenticated && user) {
        const userRole = (user.role || "").toUpperCase();
        switch (userRole) {
            case "ADMIN":
                return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
            case "OWNER":
                return <Navigate to={ROUTES.OWNER.DASHBOARD} replace />;
            default:
                return <Navigate to={ROUTES.CUSTOMER.DASHBOARD} replace />;
        }
    }

    return children;
};

export default AuthGuard;