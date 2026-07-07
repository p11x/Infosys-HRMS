import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const AdminGuard = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser || userRole !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};