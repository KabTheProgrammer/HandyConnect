import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ import this
import { useGetMyBidsQuery, useCancelBidMutation } from "../features/bids/bidApiSlice";

const MyBidsTab = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth); // ✅ get logged-in user

  // ✅ Make query depend on user ID
  const {
    data: myBids = [],
    isLoading,
    refetch,
  } = useGetMyBidsQuery(undefined, { skip: !user?._id });

  const [cancelBid, { isLoading: cancelling }] = useCancelBidMutation();

  // ✅ Automatically refetch when user changes (fixes stale cache issue)
  useEffect(() => {
    if (user?._id) {
      refetch();
    }
  }, [user?._id, refetch]);

  const handleCancel = async (bidId) => {
    try {
      await cancelBid(bidId).unwrap();
      alert("Bid cancelled successfully");
      refetch();
    } catch (err) {
      console.error("Cancel bid error:", err);
      alert(err?.data?.message || "Failed to cancel bid");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-[#0099E6]" size={28} />
      </div>
    );

  if (!myBids.length)
    return (
      <p className="text-sm text-gray-500 text-center mt-8">
        You have not placed any bids yet.
      </p>
    );

  return (
    <div className="space-y-3">
      {myBids.map((bid) => {
        const job = bid.job || {};
        const imageUrl = job.attachments?.[0] || "/placeholder-job.jpg";

        return (
          <div
            key={bid._id}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex gap-3 items-start">
              {/* Job Image */}
              <img
                src={imageUrl}
                alt={job.title || "Job"}
                className="w-16 h-16 rounded-lg object-cover border"
              />

              {/* Job Info */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">
                  {job.title || "Untitled Job"}
                </h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {job.description || "No description available."}
                </p>

                {/* Date & Status */}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>📅 {new Date(bid.createdAt).toLocaleDateString()}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      bid.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : bid.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : bid.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <button
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="text-[#0099E6] text-sm font-semibold hover:underline"
                  >
                    View
                  </button>

                  {job.customer && (
                    <span className="text-xs text-gray-700">
                      Customer: {job.customer.name || "Unknown"}
                    </span>
                  )}

                  {bid.status === "pending" && (
                    <button
                      onClick={() => handleCancel(bid._id)}
                      disabled={cancelling}
                      className="text-red-500 text-xs font-medium hover:underline"
                    >
                      {cancelling ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyBidsTab;
