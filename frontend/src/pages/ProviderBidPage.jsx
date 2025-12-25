import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  useCreateBidMutation,
  useGetBidsForJobQuery,
  useGetMyBidsQuery,
} from "../features/bids/bidApiSlice";
import { useGetJobByIdQuery } from "../features/jobs/jobApiSlice";
import Loader from "../components/Loader";

const ProviderBidPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Fetch job details
  const { data: job, isLoading: jobLoading } = useGetJobByIdQuery(jobId);

  // ✅ Fetch all bids for this job
  const {
    data: bidsData,
    isLoading: bidsLoading,
    refetch: refetchJobBids,
  } = useGetBidsForJobQuery(jobId);

  // ✅ Fetch provider’s own bids (for other pages)
  const { refetch: refetchMyBids } = useGetMyBidsQuery();

  // ✅ Create bid mutation
  const [createBid, { isLoading: bidLoading }] = useCreateBidMutation();

  const jobDetails = job?.job || job;
  const bids = Array.isArray(bidsData) ? bidsData : bidsData?.bids || [];

  // ✅ Check if provider already interacted with this job
  const existingBid = bids.find((b) => b.provider?._id === userInfo?._id);
  const hasRejected = existingBid?.status === "rejected";
  const hasApplied = !!existingBid;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate fields
    if (!amount || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    if (Number(amount) > Number(jobDetails.budget)) {
      toast.error(`Bid cannot exceed ₵${jobDetails.budget}`);
      return;
    }

    if (hasRejected) {
      toast.error("You were rejected for this job and cannot bid again");
      return;
    }

    if (hasApplied) {
      toast.error("You have already applied for this job");
      return;
    }

    try {
      // ✅ Attempt to create bid
      const res = await createBid({ jobId, amount, message }).unwrap();

      toast.success("Bid placed successfully!");
      await Promise.all([refetchJobBids(), refetchMyBids()]);
      navigate("/provider-jobs", { state: { bidSuccess: true } });
    } catch (error) {
      console.error("Bid creation error:", error);
      const message =
        error?.data?.message ||
        "Failed to place bid. Please check if the job is still open.";
      toast.error(message);
    }
  };

  if (jobLoading || bidsLoading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Submit a Bid</h2>

      {/* Job info */}
      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
        <h3 className="text-xl font-bold text-gray-900">{jobDetails.title}</h3>
        <p className="text-gray-600 mt-1">{jobDetails.description}</p>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Category:</span> {jobDetails.category}
          </p>
          <p>
            <span className="font-semibold">Location:</span> {jobDetails.location}
          </p>
          <p>
            <span className="font-semibold">Budget:</span> ₵ {jobDetails.budget}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {jobDetails.status}
          </p>
        </div>
      </div>

      {hasRejected ? (
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-800 text-center font-medium">
          You were rejected for this job and cannot bid again.
        </div>
      ) : hasApplied ? (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-center font-medium">
          You’ve already applied for this job.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Your Bid Amount (₵)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter your bid"
              className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none ${
                Number(amount) > Number(jobDetails.budget)
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-blue-400"
              }`}
            />
            {Number(amount) > Number(jobDetails.budget) && (
              <p className="text-sm text-red-500 mt-1">
                Bid cannot exceed budget (₵{jobDetails.budget})
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-1">
              Proposal Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a short proposal message..."
              rows="4"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={bidLoading}
            className={`w-full py-2 rounded-lg font-semibold text-white shadow-md transition ${
              bidLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#0099E6] hover:bg-[#0088cc]"
            }`}
          >
            {bidLoading ? "Submitting..." : "Submit Bid"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProviderBidPage;
