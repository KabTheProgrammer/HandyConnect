import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return !userInfo ? <Outlet /> : <Navigate to="/customer-home" replace />;
};

export default PublicRoute;
