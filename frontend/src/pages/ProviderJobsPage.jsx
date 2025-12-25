import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetAssignedJobsQuery,
  useProviderMarkCompleteMutation,
} from "../features/jobs/jobApiSlice";
import { Loader2, Eye, CheckCircle } from "lucide-react";
import BottomNav from "../components/BottomNav";
import MyBidsTab from "../components/MyBidsTabs";
import AvailableJobs from "./AvailableJobs";

const ProviderJobsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const [tab, setTab] = useState("available"); // default to Available Jobs
  const [markingJobId, setMarkingJobId] = useState(null);

  const {
    data: assignedData,
    isLoading,
    isError,
    refetch: refetchAssigned,
  } = useGetAssignedJobsQuery(user?._id, {
    pollingInterval: 10000,
    skip: !user?._id,
  });

  const [providerMarkComplete] = useProviderMarkCompleteMutation();

  const assignedJobs = assignedData?.jobs ?? assignedData ?? [];

  // Categorize jobs by status
  const activeJobs = useMemo(
    () =>
      assignedJobs.filter(
        (j) =>
          ["assigned", "in-progress"].includes(j.status) &&
          !j.isProviderMarkedComplete
      ),
    [assignedJobs]
  );

  const pendingJobs = useMemo(
    () =>
      assignedJobs.filter(
        (j) => j.isProviderMarkedComplete && !j.isCustomerConfirmedComplete
      ),
    [assignedJobs]
  );

  const completedJobs = useMemo(
    () =>
      assignedJobs.filter(
        (j) => j.isCustomerConfirmedComplete || j.status === "completed"
      ),
    [assignedJobs]
  );

  // Mark job complete
  const handleMarkComplete = async (jobId) => {
    try {
      setMarkingJobId(jobId);
      await providerMarkComplete(jobId).unwrap();
      await refetchAssigned();
      alert("Marked as complete — waiting for customer confirmation.");
    } catch (err) {
      console.error("Mark complete failed:", err);
      alert(err?.data?.message || "Failed to mark complete");
    } finally {
      setMarkingJobId(null);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-[#0099E6]" size={28} />
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Failed to load jobs — please try again.</p>
      </div>
    );

  // Determine job list for each tab
  const jobListForTab =
    tab === "active"
      ? activeJobs
      : tab === "pending"
      ? pendingJobs
      : tab === "completed"
      ? completedJobs
      : [];

  // Tab definitions
  const tabs = [
    { id: "available", label: "Available Jobs" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "bids", label: "My Bids" },
  ];

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-4 border-b flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-800">My Jobs</h1>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Tabs Navigation */}
        <nav className="flex gap-2 bg-white rounded-lg p-1 mb-4 shadow-sm overflow-x-auto">
          {tabs.map((t) => (
            <Tab
              key={t.id}
              label={t.label}
              active={tab === t.id}
              onClick={() => setTab(t.id)}
            />
          ))}
        </nav>

        {/* Show the tab content */}
        {tab === "available" ? (
          <AvailableJobs hideHeader={true} />
        ) : tab === "bids" ? (
          <MyBidsTab />
        ) : jobListForTab.length ? (
          jobListForTab.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onView={() => navigate(`/jobs/${job._id}`)}
              onMarkComplete={
                tab === "active" && job.status !== "completed"
                  ? () => handleMarkComplete(job._id)
                  : undefined
              }
              markingJobId={markingJobId}
            />
          ))
        ) : (
          <EmptyMessage
            text={
              tab === "active"
                ? "No active jobs yet."
                : tab === "pending"
                ? "No pending jobs."
                : "No completed jobs yet."
            }
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
};

/* ---------- Subcomponents ---------- */

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 min-w-[110px] py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
      active
        ? "bg-[#0099E6]/10 text-black shadow-sm"
        : "text-gray-500 hover:text-[#0099E6]"
    }`}
  >
    {label}
  </button>
);

const JobCard = ({ job, onView, onMarkComplete, markingJobId }) => {
  const imageUrl = job?.attachments?.[0] || "/placeholder-job.jpg";
  const showMarkButton = Boolean(onMarkComplete);

  let badgeColor = "bg-gray-100 text-gray-700";
  let label = "Open";
  if (job.status === "completed" || job.isCustomerConfirmedComplete) {
    badgeColor = "bg-green-100 text-green-700";
    label = "Completed";
  } else if (job.isProviderMarkedComplete && !job.isCustomerConfirmedComplete) {
    badgeColor = "bg-yellow-100 text-yellow-700";
    label = "Pending Confirmation";
  } else if (["assigned", "in-progress"].includes(job.status)) {
    badgeColor = "bg-blue-100 text-blue-700";
    label = "Active";
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border mb-3 p-3 flex items-start gap-3 hover:shadow-md transition-all">
      <img
        src={imageUrl}
        alt={job.title}
        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
            {job.title}
          </h3>
          <span
            className={`text-[10px] font-medium px-2 py-1 rounded-full ${badgeColor}`}
          >
            {label}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {job.description}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-medium text-gray-700">
            ₵ {job.budget ?? "--"}
          </span>
          <div className="flex gap-2 items-center">
            <button
              onClick={onView}
              className="flex items-center gap-1 text-[#0099E6] text-xs font-medium hover:underline"
            >
              <Eye className="w-3 h-3" /> View
            </button>
            {showMarkButton && job.status !== "completed" && (
              <button
                onClick={onMarkComplete}
                disabled={markingJobId === job._id}
                className={`flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1 ${
                  markingJobId === job._id
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {markingJobId === job._id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyMessage = ({ text }) => (
  <p className="text-sm text-gray-500 text-center mt-8">{text}</p>
);

export default ProviderJobsPage;
