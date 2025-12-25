import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetAllJobsQuery, useGetActiveJobsQuery } from "../features/jobs/jobApiSlice";
import { Loader2 } from "lucide-react";
import BottomNav from "../components/BottomNav";
import JobImageSlider from "../components/JobSlider";

const ProviderHome = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: allJobs, isLoading: jobsLoading } = useGetAllJobsQuery();
  const { data: activeJobs, isLoading: activeLoading } = useGetActiveJobsQuery();

  const newOpportunities =
    allJobs?.filter((job) => !job.assignedProvider && job.status === "open") || [];

  const providerActiveJobs =
  activeJobs?.filter(
    (job) =>
      job.assignedProvider?._id === user?._id &&
      job.status !== "completed" &&
      job.status !== "pending"
  ) || [];

  return (
    <div className="pb-24 min-h-screen bg-secondary">
      {/* ✅ Profile Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={user?.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="w-14 h-14 rounded-full object-cover border border-secondary"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.bio || "Service Provider"}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span>⭐ {user?.averageRating?.toFixed(1) || "0.0"}</span>
              <span>•</span>
              <span>{user?.reviews?.length || 0} reviews</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-8">
        {/* 🔹 New Opportunities Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">New Opportunities</h3>
            <button
              onClick={() => navigate("/available-jobs")}
              className="text-sm text-primary font-semibold hover:underline"
            >
              View All Jobs
            </button>
          </div>

          {jobsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : newOpportunities.length > 0 ? (
            <JobImageSlider
              jobs={newOpportunities}
              autoScroll
              onView={(id) => navigate(`/jobs/${id}`)}
            />
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              No new jobs available.
            </p>
          )}
        </section>

        {/* 🔹 Active Jobs */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary">Active Jobs</h3>
          {activeLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : providerActiveJobs.length > 0 ? (
            <div className="space-y-3">
              {providerActiveJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white p-4 rounded-xl border border-secondary shadow-sm hover:shadow-md transition"
                >
                  <div className="flex gap-3 items-start">
                    <img
                      src={job.attachments?.[0] || "/placeholder-job.jpg"}
                      alt={job.title}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-800 line-clamp-1">
                          {job.title}
                        </h4>
                        <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          📅 {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => navigate(`/jobs/active/${job._id}`)}
                          className="text-primary text-xs font-semibold hover:underline"
                        >
                          View Progress
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              You have no active jobs yet.
            </p>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProviderHome;
