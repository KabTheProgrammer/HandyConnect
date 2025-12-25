import { Loader2, Plus, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";


const BidCard = ({ bid, onView, onAccept, onReject, markingBidId }) => {
  const imageUrl = bid?.job?.attachments?.[0] || "/placeholder-job.jpg";

  // Determine status badge and available actions
  const isPending = bid.status === "pending";
  const isAccepted = bid.status === "accepted";
  const isRejected = bid.status === "rejected";

  let badgeColor = "bg-blue-100 text-blue-700";
  let badgeLabel = "Pending";

  if (isAccepted) {
    badgeColor = "bg-green-100 text-green-700";
    badgeLabel = "Accepted";
  } else if (isRejected) {
    badgeColor = "bg-red-100 text-red-700";
    badgeLabel = "Rejected";
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border mb-3 p-3 flex items-start gap-3 hover:shadow-md transition-all">
      <img
        src={imageUrl}
        alt={bid.job?.title || "Job image"}
        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
            {bid.job?.title || "Untitled Job"}
          </h3>
          <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${badgeColor}`}>
            {badgeLabel}
          </span>
        </div>

        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{bid.job?.description || ""}</p>

        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-medium text-gray-700">₵ {bid.amount || "--"}</span>
          <div className="flex gap-2 items-center">
            <button
              onClick={onView}
              className="flex items-center gap-1 text-[#0099E6] text-xs font-medium hover:underline"
            >
              <Eye className="w-3 h-3" /> View
            </button>

            {isPending && (
              <>
                <button
                  onClick={onAccept}
                  disabled={markingBidId === bid._id}
                  className={`flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1 bg-green-500 text-white hover:bg-green-600 ${
                    markingBidId === bid._id ? "bg-gray-300 cursor-not-allowed" : ""
                  }`}
                >
                  {markingBidId === bid._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                  Accept
                </button>

                <button
                  onClick={onReject}
                  disabled={markingBidId === bid._id}
                  className={`flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1 bg-red-500 text-white hover:bg-red-600 ${
                    markingBidId === bid._id ? "bg-gray-300 cursor-not-allowed" : ""
                  }`}
                >
                  {markingBidId === bid._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidCard