import { useParams, useNavigate } from "react-router-dom";
import {
  useGetJobByIdQuery,
  useProviderMarkCompleteMutation,
} from "../features/jobs/jobApiSlice";
import { useGetProviderByIdQuery } from "../features/providers/providerApiSlice";
import { useGetReviewsForProviderQuery } from "../features/reviews/reviewApiSlice";
import { Loader2, Star, ArrowLeft } from "lucide-react";

const ActiveJobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: job, isLoading, isError, refetch } = useGetJobByIdQuery(id);
  const [providerMarkComplete, { isLoading: marking }] =
    useProviderMarkCompleteMutation();

  const providerId = job?.assignedProvider?._id || job?.assignedProvider;
  const { data: providerDetails } = useGetProviderByIdQuery(providerId, {
    skip: !providerId,
  });

  const { data: reviewsData } = useGetReviewsForProviderQuery(providerId, {
    skip: !providerId,
  });

  const handleMarkComplete = async () => {
    try {
      await providerMarkComplete(id).unwrap();
      alert("✅ Job marked as complete! Awaiting customer confirmation.");
      refetch();
    } catch (err) {
      alert(err?.data?.message || "❌ Failed to mark job as complete.");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-primary" />
      </div>
    );

  if (isError || !job)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-gray-500">
        <p>Failed to load job details.</p>
      </div>
    );

  // ---------------------
  // PROGRESS LOGIC
  // ---------------------
  const steps = ["assigned", "in-progress", "payment", "completed"];

  let currentStepIndex = 0;

  if (job.status === "assigned") currentStepIndex = 0;
  else if (job.status === "in-progress")
    currentStepIndex = job.isProviderMarkedComplete ? 2 : 1;
  else if (job.status === "completed") currentStepIndex = 3;

  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  // Button logic
  const actionDisabled =
    job.isProviderMarkedComplete || job.status === "completed";

  const actionText =
    job.status === "completed"
      ? "Completed"
      : job.isProviderMarkedComplete
      ? "Waiting for Customer Confirmation"
      : marking
      ? "Marking..."
      : "Mark as Complete";

  const provider = providerDetails?.provider || job.assignedProvider;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-card-dark p-4 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-200"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-secondary dark:text-white text-lg font-bold flex-1 text-center truncate">
          {job.title}
        </h2>
        <div className="w-10" />
      </div>

      {/* MAIN */}
      <main className="flex-grow p-4 space-y-6">
        {/* PROGRESS BAR */}
        <div className="bg-card-light dark:bg-card-dark rounded-lg p-4 shadow-sm">
          <div className="flex justify-between mb-1">
            <p className="font-semibold">Job Progress</p>
            <p className="text-primary text-sm capitalize">{job.status}</p>
          </div>

          {/* Track */}
          <div className="h-3 w-full rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden relative">
            {/* Animated gradient bar */}
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background:
                  "linear-gradient(90deg, #1193d4, #34d399, #facc15, #f87171)",
              }}
            />
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {steps.map((step, index) => (
              <span
                key={index}
                className={
                  index <= currentStepIndex
                    ? "font-bold text-primary"
                    : "text-gray-400"
                }
              >
                {step.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* PROVIDER INFO */}
        {provider && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg p-4 shadow-sm">
            <h3 className="text-secondary dark:text-white font-bold text-lg mb-3">
              Service Provider
            </h3>

            <div className="flex items-center gap-4 mb-3">
              <img
                src={provider.profileImage || "https://via.placeholder.com/150"}
                alt={provider.name}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div className="flex-grow">
                <p className="font-bold">{provider.name}</p>
                <div className="flex items-center gap-1 text-sm">
                  <Star size={14} className="text-primary" />
                  <span>
                    {provider.averageRating?.toFixed(1) || 0} (
                    {provider.numReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {reviewsData?.length > 0 && (
              <div className="mt-2 space-y-2">
                {reviewsData.map((review) => (
                  <div
                    key={review._id}
                    className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-md"
                  >
                    <img
                      src={
                        review.customer?.profileImage ||
                        "https://via.placeholder.com/40"
                      }
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {review.customer?.name}
                      </p>
                      <p className="text-xs text-gray-500">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* JOB DETAILS */}
        <div className="bg-card-light dark:bg-card-dark rounded-lg p-4 shadow-sm">
          <h3 className="text-secondary dark:text-white font-bold text-lg mb-2">
            Job Details
          </h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">{job.description}</p>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-t">
              <span>Job ID</span>
              <span className="font-medium">#{job._id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span>Category</span>
              <span>{job.category}</span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span>Location</span>
              <span>{job.location}</span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span>Agreed Cost</span>
              <span className="font-bold">GHS {job.budget?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="sticky bottom-0 bg-white dark:bg-card-dark p-4 border-t">
        <button
          onClick={handleMarkComplete}
          disabled={actionDisabled}
          className={`w-full py-3 rounded-lg font-bold text-white transition ${
            actionDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-primary"
          }`}
        >
          {actionText}
        </button>
      </footer>
    </div>
  );
};

export default ActiveJobDetailsPage;
