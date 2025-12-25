import { Loader2, CheckCircle } from "lucide-react";

const JobCard = ({
  job,
  onView,
  onMarkComplete,
  markingJobId,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex gap-3 items-start">
        {/* Job image */}
        <img
          src={job.attachments?.[0] || "/placeholder-job.jpg"}
          alt={job.title}
          className="w-16 h-16 rounded-lg object-cover border"
        />

        {/* Job info */}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{job.title}</h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {job.description}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
            {job.status && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  job.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : job.status === "in-progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {job.status}
              </span>
            )}
          </div>

          {/* Buttons Row */}
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            {/* View Details */}
            <button
              onClick={onView}
              className="text-[#0099E6] text-sm font-semibold hover:underline"
            >
              View Details
            </button>

            {/* ✅ Mark Complete or Waiting */}
            {onMarkComplete && (
              !job.isProviderMarkedComplete ? (
                <button
                  onClick={() => onMarkComplete(job._id)}
                  disabled={markingJobId === job._id}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all
                    ${
                      markingJobId === job._id
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white shadow-sm"
                    }`}
                >
                  {markingJobId === job._id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Complete
                    </>
                  )}
                </button>
              ) : (
                <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                  Waiting for Customer
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
