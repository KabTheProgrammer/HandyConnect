// src/pages/CustomerJobsPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetAllJobsQuery,
  useDeleteJobMutation,
} from "../features/jobs/jobApiSlice";
import {
  useGetMyBidsQuery,
  useRejectBidMutation,
  useAcceptAndAssignBidMutation,
} from "../features/bids/bidApiSlice";
import BidCard from "../components/BidCard";
import BottomNav from "../components/BottomNav";

const CustomerJobsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const [tab, setTab] = useState("my-jobs");
  const [markingJobId, setMarkingJobId] = useState(null);
  const [markingBidId, setMarkingBidId] = useState(null);

  // Jobs
  const {
    data: jobsData = [],
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useGetAllJobsQuery(user?._id, { pollingInterval: 10000 });
  const [deleteJob] = useDeleteJobMutation();

  // Bids
  const {
    data: bidsData = [],
    isLoading: bidsLoading,
    refetch: refetchBids,
  } = useGetMyBidsQuery();
  const [rejectBid] = useRejectBidMutation();
  const [acceptBid] = useAcceptAndAssignBidMutation();

  /* ---------------- Jobs Handlers ---------------- */
  const handleConfirmComplete = async (jobId) => {
    try {
      setMarkingJobId(jobId);
      const token = JSON.parse(localStorage.getItem("userInfo")).token;
      const baseUrl = import.meta.env.VITE_API_URL;

      const res = await fetch(`${baseUrl}/jobs/${jobId}/confirm-complete`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Failed to confirm job completion."
        );
      }

      refetchJobs();
      toast.success("Job fully completed! 🎉");
    } catch (err) {
      console.error(err);
      toast.error(
        err.message || "Provider must mark complete before you can confirm."
      );
    } finally {
      setMarkingJobId(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(jobId).unwrap();
      refetchJobs();
      toast.success("Job deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete job.");
    }
  };

  /* ---------------- Bids Handlers ---------------- */
  const handleRejectBid = async (bidId) => {
    if (!window.confirm("Are you sure you want to reject this bid?")) return;
    try {
      setMarkingBidId(bidId);
      await rejectBid(bidId).unwrap();
      refetchBids();
      toast.success("Bid rejected successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject bid.");
    } finally {
      setMarkingBidId(null);
    }
  };

  const handleAcceptBid = async (bidId, jobId) => {
    if (!window.confirm("Are you sure you want to accept this bid?")) return;
    try {
      setMarkingBidId(bidId);
      await acceptBid({ bidId }).unwrap();

      // Automatically reject other pending bids for the same job
      const otherBids = bidsData.filter(
        (b) => b.job?._id === jobId && b._id !== bidId && b.status === "pending"
      );
      for (const b of otherBids) {
        await rejectBid(b._id).unwrap();
      }

      refetchBids();
      toast.success("Bid accepted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept bid.");
    } finally {
      setMarkingBidId(null);
    }
  };

  const handleDeleteBid = async (bidId) => {
    if (!window.confirm("Are you sure you want to delete this bid?")) return;
    try {
      setMarkingBidId(bidId);
      await rejectBid(bidId).unwrap(); // reuse reject mutation
      refetchBids();
      toast.success("Bid deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete bid.");
    } finally {
      setMarkingBidId(null);
    }
  };

  /* ---------------- Filter Jobs by Tab ---------------- */
  const getJobsByTab = (tab) => {
    const customerJobs = jobsData.filter((job) => {
      const jobCustomerId = job.customer?._id || job.customer;
      return jobCustomerId?.toString() === user?._id?.toString();
    });

    switch (tab) {
      case "my-jobs":
        return customerJobs;
      case "pending":
        return customerJobs.filter(
          (job) => job.status === "assigned" && !job.isProviderMarkedComplete
        );
      case "active":
        return customerJobs.filter(
          (job) =>
            job.status === "in-progress" ||
            (job.isProviderMarkedComplete && !job.isCustomerConfirmedComplete)
        );
      case "completed":
        return customerJobs.filter(
          (job) => job.status === "completed" || job.isCustomerConfirmedComplete
        );
      default:
        return [];
    }
  };

  const displayedJobs = getJobsByTab(tab);
  const isLoading = jobsLoading || bidsLoading;

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-[#0099E6]" />
      </div>
    );

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-4 border-b flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-800">My Jobs</h1>
        <button
          onClick={() => navigate("/jobs/new")}
          className="h-10 w-10 rounded-full bg-[#0099E6] text-white flex items-center justify-center hover:bg-[#007bbf] transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto p-4">
        <nav className="flex gap-2 bg-white rounded-lg p-1 mb-4 shadow-sm overflow-x-auto">
          <Tab
            label="My Jobs"
            active={tab === "my-jobs"}
            onClick={() => setTab("my-jobs")}
          />
          <Tab
            label="Pending"
            active={tab === "pending"}
            onClick={() => setTab("pending")}
          />
          <Tab
            label="Active"
            active={tab === "active"}
            onClick={() => setTab("active")}
          />
          <Tab
            label="Completed"
            active={tab === "completed"}
            onClick={() => setTab("completed")}
          />
          <Tab
            label="My Bids"
            active={tab === "bids"}
            onClick={() => setTab("bids")}
          />
        </nav>

        {/* Content */}
        {tab === "bids" ? (
          bidsData.length ? (
            bidsData.map((bid) => (
              <BidCard
                key={bid._id}
                bid={bid}
                onView={() => navigate(`/jobs/${bid.job?._id}`)}
                onAccept={
                  !bid.isAccepted && !bid.isRejected
                    ? () => handleAcceptBid(bid._id, bid.job?._id)
                    : undefined
                }
                onReject={
                  !bid.isAccepted && !bid.isRejected
                    ? () => handleRejectBid(bid._id)
                    : undefined
                }
                onDelete={
                  bid.isAccepted || bid.isRejected
                    ? () => handleDeleteBid(bid._id)
                    : undefined
                }
                markingBidId={markingBidId}
              />
            ))
          ) : (
            <EmptyMessage text="You have no bids yet." />
          )
        ) : displayedJobs.length ? (
          displayedJobs.map((job) => (
            <CompactJobCard
              key={job._id}
              job={job}
              onView={() => navigate(`/jobs/${job._id}`)}
              onDelete={
                // Show delete button only if job is open or completed
                job.status === "open" ||
                job.status === "completed" ||
                job.isCustomerConfirmedComplete
                  ? () => handleDeleteJob(job._id)
                  : undefined
              }
              onConfirmComplete={
                tab === "active"
                  ? () => handleConfirmComplete(job._id)
                  : undefined
              }
              markingJobId={markingJobId}
            />
          ))
        ) : (
          <EmptyMessage
            text={
              tab === "my-jobs"
                ? "You haven't created any jobs yet."
                : tab === "pending"
                ? "No pending jobs."
                : tab === "active"
                ? "No active jobs."
                : "No completed jobs yet."
            }
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
};

/* ---------------- Job Card ---------------- */
const CompactJobCard = ({
  job,
  onView,
  onDelete,
  onConfirmComplete,
  markingJobId,
}) => {
  const imageUrl = job?.attachments?.[0] || "/placeholder-job.jpg";
  const showConfirmButton = Boolean(onConfirmComplete);

  let badgeColor = "bg-gray-100 text-gray-700";
  let label = "Open";

  if (job.status === "completed" || job.isCustomerConfirmedComplete) {
    badgeColor = "bg-green-100 text-green-700";
    label = "Completed";
  } else if (showConfirmButton) {
    badgeColor = "bg-yellow-100 text-yellow-700";
    label = "Awaiting confirmation";
  } else if (job.status === "assigned") {
    badgeColor = "bg-blue-100 text-blue-700";
    label = "Pending";
  } else if (job.status === "in-progress") {
    badgeColor = "bg-purple-100 text-purple-700";
    label = "Active";
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border mb-3 p-3 flex items-start gap-3 hover:shadow-md transition-all">
      <img
        src={imageUrl}
        alt={job.title || "Job image"}
        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
            {job.title || "Untitled Job"}
          </h3>
          <span
            className={`text-[10px] font-medium px-2 py-1 rounded-full ${badgeColor}`}
          >
            {label}
          </span>
        </div>

        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {job.description || ""}
        </p>

        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-medium text-gray-700">
            ₵ {job.budget || "--"}
          </span>
          <div className="flex gap-2 items-center">
            <button
              onClick={onView}
              className="flex items-center gap-1 text-[#0099E6] text-xs font-medium hover:underline"
            >
              <Eye className="w-3 h-3" /> View
            </button>

            {showConfirmButton && (
              <button
                onClick={onConfirmComplete}
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
                Confirm Complete
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                disabled={
                  !(
                    job.status === "open" ||
                    job.status === "completed" ||
                    job.isCustomerConfirmedComplete
                  )
                }
                className={`flex items-center gap-1 text-xs font-medium ${
                  job.status === "open" ||
                  job.status === "completed" ||
                  job.isCustomerConfirmedComplete
                    ? "text-red-500 hover:underline"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- UI Components ---------------- */
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 min-w-[110px] py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
      active
        ? "bg-[#0099E6]/10 text-[#0099E6] shadow-sm"
        : "text-gray-500 hover:text-[#0099E6]"
    }`}
  >
    {label}
  </button>
);

const EmptyMessage = ({ text }) => (
  <p className="text-sm text-gray-500 text-center mt-8">{text}</p>
);

export default CustomerJobsPage;
