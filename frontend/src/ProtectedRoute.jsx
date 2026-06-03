import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ role, allowedRole, children }) => {
    // Check if user is authenticated and has the correct role
    const isAuthenticated = sessionStorage.getItem("role"); // If the user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/llogin" replace />;
    }
    return children;
};

export default ProtectedRoute;
