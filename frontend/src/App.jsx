// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Pages
import Splash from "./pages/Splash";
import AuthChoice from "./pages/AuthChoice";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CustomerHome from "./pages/CustomerHome";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import ProviderProfilePage from "./pages/ProviderProfilePage";
import ProviderDetails from "./pages/ProviderDetails";
import ProviderHome from "./pages/ProviderHome";
import JobDetails from "./pages/JobDetails";
import CreateJob from "./pages/CreateJob";
import AssignedJobs from "./pages/AssignedJobs";
import AvailableJobs from "./pages/AvailableJobs";
import ProviderBidPage from "./pages/ProviderBidPage";
import ActiveJobDetailsPage from "./pages/ActiveJobDetailsPage";
import ActiveJobsPage from "./pages/ActiveJobsPage";
import JobsPage from "./pages/JobsPage";
import CustomerJobsPage from "./pages/CustomerJobsPage";
import ProviderJobsPage from "./pages/ProviderJobsPage";
// 🆕 New Provider Job Details
import ProviderJobDetails from "./pages/ProviderJobDetails";
import EditJob from "./pages/EditJob";
import ChatList from "./pages/chatList";
import ChatDetails from "./pages/ChatDetails";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display">
      <Routes>
        {/* 🌐 Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Splash />} />
          <Route path="/auth-choice" element={<AuthChoice />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* 🔒 Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* 🏠 Dashboards */}
          <Route path="/customer-home" element={<CustomerHome />} />
          <Route path="/provider-home" element={<ProviderHome />} />

          {/* 👤 Profiles */}
          <Route path="/customer/profile" element={<CustomerProfilePage />} />
          <Route path="/provider/profile" element={<ProviderProfilePage />} />
          <Route path="/provider/:id" element={<ProviderDetails />} />

          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:chatId" element={<ChatDetails />} />


          {/* 💼 Jobs */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/new" element={<CreateJob />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/jobs/edit/:id" element={<EditJob />} />
          <Route path="/jobs/assigned" element={<AssignedJobs />} />
          <Route path="/available-jobs" element={<AvailableJobs />} />
          <Route path="/bids/:jobId/bids" element={<ProviderBidPage />} />

          {/* ⚙️ Active Jobs */}
          <Route path="/jobs/active" element={<ActiveJobsPage />} />
          <Route path="/jobs/active/:id" element={<ActiveJobDetailsPage />} />

          {/* 🆕 Customer / Provider Job Management */}
          <Route path="/customer-jobs" element={<CustomerJobsPage />} />
          <Route path="/provider-jobs" element={<ProviderJobsPage />} />
          <Route path="/provider/jobs/:id" element={<ProviderJobDetails />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
