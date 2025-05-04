import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";
import { Spinner } from "./ui/Spinner";

interface PrivateRouteProps {
  requiredRole?: UserRole;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have permission, redirect to unauthorized
  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Otherwise, render the protected route
  return <Outlet />;
};

export default PrivateRoute;
