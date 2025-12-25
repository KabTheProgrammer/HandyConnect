import { useNavigate } from "react-router-dom";
import { useGetActiveJobsQuery } from "../features/jobs/jobApiSlice";
import { Loader2 } from "lucide-react";
import CustomerConfirmCompletion from "../components/CustomerConfirmCompletion";

const ActiveJobsPage = () => {
  const navigate = useNavigate();
  const { data: jobs, isLoading, isError, refetch } = useGetActiveJobsQuery();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-red-600 mt-10">
        Failed to load active jobs
      </div>
    );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 space-y-4">
      <h2 className="text-secondary dark:text-white text-xl font-bold mb-4">
        Active Jobs
      </h2>

      {jobs?.length === 0 ? (
        <p className="text-center text-text-secondary dark:text-text-secondary-dark">
          You have no active jobs yet.
        </p>
      ) : (
        jobs.map((job) => (
          <div
            key={job._id}
            className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow-sm cursor-pointer transition hover:shadow-md relative"
            // Only navigate if not awaiting confirmation
            onClick={() =>
              job.isProviderMarkedComplete && !job.isCustomerConfirmedComplete
                ? null
                : navigate(`/jobs/${job._id}/active`)
            }
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-text-main dark:text-text-main-dark">
                {job.title}
              </h3>
              <span className="text-sm font-medium text-primary capitalize">
                {job.status}
              </span>
            </div>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark line-clamp-2">
              {job.description}
            </p>
            <div className="flex justify-between text-sm text-text-secondary dark:text-text-secondary-dark mt-2">
              <span>{job.category}</span>
              <span className="font-semibold text-text-main dark:text-text-main-dark">
                GHS {job.budget}
              </span>
            </div>

            {/* ✅ Customer confirm button */}
            <CustomerConfirmCompletion job={job} refetchJob={refetch} />
          </div>
        ))
      )}
    </div>
  );
};

export default ActiveJobsPage;
