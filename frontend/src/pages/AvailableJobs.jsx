import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { Loader2, MapPin, Briefcase } from "lucide-react";

const AvailableJobs = ({ hideHeader = false }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/jobs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // ✅ Filter out assigned, completed, or cancelled jobs
        const available = response.data.filter(
          (job) =>
            !job.assignedProvider && // not assigned
            job.status !== "assigned" && // double check backend consistency
            job.status !== "completed" &&
            job.status !== "cancelled"
        );

        setJobs(available);
      } catch (error) {
        console.error("Error loading jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleJobClick = (id) => navigate(`/jobs/${id}`);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col font-display">
      {/* Header */}
      {!hideHeader && (
        <header className="bg-white dark:bg-gray-800 sticky top-0 z-10 px-4 pt-4 pb-3 shadow-sm flex items-center justify-between">
          <button className="p-2 text-gray-700 dark:text-gray-300"></button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Available Jobs
          </h1>
          <button className="p-2 text-gray-700 dark:text-gray-300"></button>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto px-4 pb-24 space-y-4">
        {loading ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="animate-spin text-[#0099E6]" size={26} />
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No jobs available at the moment.
          </p>
        ) : (
          jobs.map((job) => {
            const imageUrl = job.attachments?.[0]
              ? job.attachments[0].startsWith("http")
                ? job.attachments[0]
                : `http://localhost:5000${
                    job.attachments[0].startsWith("/")
                      ? job.attachments[0]
                      : "/" + job.attachments[0]
                  }`
              : "/placeholder-job.jpg";

            return (
              <div
                key={job._id}
                onClick={() => handleJobClick(job._id)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md border border-transparent hover:border-[#0099E6]/40 cursor-pointer transition-all"
              >
                {/* Job Image */}
                <img
                  src={imageUrl}
                  alt={job.title}
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                />

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
                    {job.title}
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {job.description || "No description available."}
                  </p>

                  {/* Location and Category */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {job.location}
                      </span>
                    )}
                    {job.category && (
                      <span className="flex items-center gap-1">
                        <Briefcase size={13} />
                        {job.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <div className="flex items-center justify-end text-[#0099E6] font-semibold text-sm">
                    <span className="ml-0.5">GH₵ {job.budget}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default AvailableJobs;
