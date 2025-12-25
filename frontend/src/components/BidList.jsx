import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Star } from "lucide-react";
import {
  useRejectBidMutation,
  useAcceptAndAssignBidMutation,
} from "../features/bids/bidApiSlice";
import { apiSlice } from "../app/api/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BidList = ({ job, bids = [], isLoading, onDecision }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const [acceptAndAssignBid] = useAcceptAndAssignBidMutation();
  const [rejectBid] = useRejectBidMutation();

  const [loadingBids, setLoadingBids] = useState({}); // { [bidId]: "accepting" | "rejecting" }

  const isCustomer =
    user?.userType === "customer" &&
    user._id.toString() === (job.customer?._id || job.customer).toString();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!bids.length) {
    return <p className="text-gray-500 text-center">No bids yet.</p>;
  }

  const handleReject = async (bidId) => {
    try {
      setLoadingBids((prev) => ({ ...prev, [bidId]: "rejecting" }));
      await rejectBid(bidId).unwrap();

      // Update bids cache immediately
      dispatch(
        apiSlice.util.updateQueryData("getBidsForJob", job._id, (draft) => {
          const bidIndex = draft?.bids?.findIndex((b) => b._id === bidId);
          if (bidIndex !== -1) draft.bids[bidIndex].status = "rejected";
        })
      );

      toast.success("✅ Bid rejected successfully!");
      onDecision?.();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reject bid");
    } finally {
      setLoadingBids((prev) => {
        const copy = { ...prev };
        delete copy[bidId];
        return copy;
      });
    }
  };

 const handleAcceptAndAssign = async (bid) => {
  try {
    setLoadingBids((prev) => ({ ...prev, [bid._id]: "accepting" }));

    // Call API and unwrap data
    const result = await acceptAndAssignBid({ bidId: bid._id }).unwrap();

    // 🧠 Safe updates — each in a try/catch so none can break the rest
    try {
      dispatch(
        apiSlice.util.updateQueryData("getBidsForJob", job._id, (draft) => {
          if (!draft?.bids) return; // prevents "select" crash
          draft.bids.forEach((b) => {
            if (b._id === bid._id) b.status = "accepted";
            else if (b.status === "pending") b.status = "rejected";
          });
        })
      );
    } catch (e) {
      console.warn("Skipping getBidsForJob cache update (not yet in store)");
    }

    try {
      dispatch(
        apiSlice.util.updateQueryData("getJobById", job._id, (draft) => {
          if (!draft) return;
          draft.assignedProvider = result.provider;
          draft.status = "assigned";
        })
      );
    } catch (e) {
      console.warn("Skipping getJobById cache update (not yet in store)");
    }

    try {
      dispatch(
        apiSlice.util.updateQueryData("getJobs", undefined, (draft) => {
          if (!draft) return;
          const jobIndex = draft.findIndex((j) => j._id === job._id);
          if (jobIndex !== -1) {
            draft[jobIndex].status = "assigned";
            draft[jobIndex].assignedProvider = result.provider;
          }
        })
      );
    } catch (e) {
      console.warn("Skipping getJobs cache update (not yet in store)");
    }

    toast.success("Bid accepted and provider assigned successfully!");
    onDecision?.();
  } catch (err) {
    console.error("Error in handleAcceptAndAssign:", err);
    toast.error(
      err?.data?.message || err?.message || "Failed to accept & assign bid"
    );
  } finally {
    setLoadingBids((prev) => {
      const copy = { ...prev };
      delete copy[bid._id];
      return copy;
    });
  }
};


  const handleViewProfile = (providerId) => navigate(`/provider/${providerId}`);

  return (
    <div className="space-y-4">
      {bids.map((bid) => {
        const loadingState = loadingBids[bid._id]; // "accepting" | "rejecting" | undefined

        return (
          <div
            key={bid._id}
            className="p-4 rounded-lg shadow-sm bg-white dark:bg-[#162228] border border-gray-100 dark:border-gray-700"
          >
            {/* Provider Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={bid.provider?.profileImage || "/default-avatar.png"}
                  alt={bid.provider?.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-300"
                />
                <div>
                  <h3 className="font-semibold text-lg">
                    {bid.provider?.name || "Unknown Provider"}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={14} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {bid.provider?.averageRating
                        ? bid.provider.averageRating.toFixed(1)
                        : "No ratings"}
                    </span>
                  </div>
                  {bid.provider?.skills?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Skills: {bid.provider.skills.slice(0, 3).join(", ")}
                      {bid.provider.skills.length > 3 && "..."}
                    </p>
                  )}
                </div>
              </div>

              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  bid.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : bid.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {bid.status}
              </span>
            </div>

            {/* Offer + Message */}
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Offer: <span className="font-medium">₵{bid.amount}</span>
            </p>
            <p className="text-sm text-gray-500 mb-3">
              {bid.message || "No note provided."}
            </p>

            {/* View Profile Button */}
            {isCustomer && (
              <button
                onClick={() => handleViewProfile(bid.provider?._id)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                View Profile
              </button>
            )}

            {/* Accept / Reject Buttons */}
            {isCustomer && bid.status === "pending" && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleAcceptAndAssign(bid)}
                  disabled={loadingState === "accepting"}
                  className="flex-1 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition flex justify-center items-center gap-2"
                >
                  {loadingState === "accepting" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Accept & Assign
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleReject(bid._id)}
                  disabled={loadingState === "rejecting"}
                  className="flex-1 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition flex justify-center items-center gap-2"
                >
                  {loadingState === "rejecting" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle size={18} /> Reject
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BidList;
