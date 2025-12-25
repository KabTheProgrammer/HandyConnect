import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user } = useSelector((state) => state.auth);

  // If not logged in → send to login
  if (!user) {
    return <Navigate to="/auth-choice" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
