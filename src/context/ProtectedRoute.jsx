import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        // not logged in
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // user is not allowed to access this route
        return <Navigate to="/not-authorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
