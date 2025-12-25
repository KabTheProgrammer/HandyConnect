import { useEffect, useState } from "react";
import { Loader2, UserCheck, CheckCircle2 } from "lucide-react";
import { useAssignProviderMutation } from "../features/jobs/jobApiSlice";

const AssignProvider = ({ job, bid, onSuccess }) => {
  const [assignProvider, { isLoading, isSuccess }] = useAssignProviderMutation();
  const [error, setError] = useState(null);
  const [assigned, setAssigned] = useState(
    job?.assignedProvider?._id === bid?.provider?._id
  );

  // 🧠 Auto-update when the backend call succeeds
  useEffect(() => {
    if (isSuccess) {
      setAssigned(true);
      if (onSuccess) onSuccess(); // refetch job or bids list
    }
  }, [isSuccess, onSuccess]);

  const handleAssign = async () => {
    if (!job?._id || !bid?.provider?._id) {
      console.error("❌ Missing job or provider ID", job, bid);
      setError("Invalid job ID — cannot assign provider.");
      return;
    }

    try {
      setError(null);

      // ✅ Optimistic update (show instant UI change)
      setAssigned(true);

      await assignProvider({
        jobId: job._id,
        providerId: bid.provider._id,
      }).unwrap();

      // Backend response handled by isSuccess effect above
    } catch (err) {
      console.error("❌ Error assigning provider:", err);
      setAssigned(false); // revert optimistic change if failed
      setError(err?.data?.message || "Something went wrong.");
    }
  };

  if (!job?._id) {
    return (
      <div className="p-4 bg-white dark:bg-[#162228] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-4">
        <p className="text-red-500 text-sm">
          Cannot assign provider — invalid job reference.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-[#162228] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-4">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <UserCheck size={20} /> Assign Provider
      </h3>

      {assigned ? (
        <p className="text-green-600 dark:text-green-400 flex items-center gap-2 font-medium">
          <CheckCircle2 size={18} />{" "}
          {bid.provider?.name} has been assigned to this job.
        </p>
      ) : (
        <>
          <p className="text-gray-500 dark:text-gray-400 mb-3">
            Confirm assigning{" "}
            <span className="font-semibold">{bid.provider?.name}</span> to this job.
          </p>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <button
            onClick={handleAssign}
            disabled={isLoading}
            className="w-full py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            {isLoading ? (
              <span className="flex justify-center items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> Assigning...
              </span>
            ) : (
              "Confirm Assignment"
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default AssignProvider;
