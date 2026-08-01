import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

interface Props {

    children: JSX.Element;

}

const AuthGuard = ({

    children

}: Props) => {

    const {

        isAuthenticated,

        user

    } = useAuth();

    if (isAuthenticated) {

        switch (user?.role) {

            case "ADMIN":

                return <Navigate to="/admin/dashboard" replace />;

            case "OWNER":

                return <Navigate to="/owner/dashboard" replace />;

            default:

                return <Navigate to="/customer/dashboard" replace />;

        }

    }

    return children;

};

export default AuthGuard;