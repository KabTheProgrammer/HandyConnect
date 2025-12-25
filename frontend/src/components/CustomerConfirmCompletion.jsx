import React from "react";
import { useSelector } from "react-redux";
import { useCustomerConfirmCompleteMutation } from "../features/jobs/jobApiSlice";
import { Loader2 } from "lucide-react";

const CustomerConfirmCompletion = ({ job, refetchJob }) => {
  const { user } = useSelector((state) => state.auth || {});
  const [customerConfirmComplete, { isLoading }] = useCustomerConfirmCompleteMutation();

  // ✅ Allow only customers
  if (!user || user.userType !== "customer") return null;

  const customerId = job.customer?._id || job.customer;

  // ✅ Ensure this job belongs to the logged-in customer
  if (!customerId || user._id.toString() !== customerId.toString()) return null;

  // ✅ Prevent confirmation before provider marks complete
  if (!job.isProviderMarkedComplete) return null;

  // ✅ Prevent re-confirmation
  if (job.isCustomerConfirmedComplete) return null;

  const handleConfirm = async () => {
    try {
      await customerConfirmComplete(job._id).unwrap();
      await refetchJob?.();
      alert("🎉 Job fully completed!");
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Failed to confirm job completion.");
    }
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full py-3 rounded-full bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Confirming...
          </span>
        ) : (
          "Confirm Job Completion"
        )}
      </button>
    </div>
  );
};

export default CustomerConfirmCompletion;
