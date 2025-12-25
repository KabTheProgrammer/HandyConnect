import { useSelector } from "react-redux";
import ProviderJobsPage from "./ProviderJobsPage";
import CustomerJobsPage from "./CustomerJobsPage";

const JobsPage = () => {
  const { user } = useSelector((state) => state.auth || {});

  if (!user) return null; // ProtectedRoute already ensures logged in

  return user.userType === "provider" ? <ProviderJobsPage /> : <CustomerJobsPage />;
};

export default JobsPage;
