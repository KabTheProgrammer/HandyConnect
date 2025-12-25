import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyJobsSidebar = ({ showSidebar, setShowSidebar }) => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch customer’s jobs when sidebar is opened
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo?.token) return;

        const { data } = await axios.get("http://localhost:5000/api/jobs", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        // ✅ Filter only customer’s jobs
        const customerJobs = data.filter(
          (job) => job.customer?._id === userInfo._id
        );
        setMyJobs(customerJobs);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (showSidebar) fetchMyJobs();
  }, [showSidebar]);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-zinc-900 shadow-xl transform transition-transform duration-300 z-50
        ${showSidebar ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-900 z-10 p-4 border-b dark:border-zinc-800 flex justify-between items-center">
        <h2 className="font-semibold text-lg text-zinc-800 dark:text-white">
          My Posted Jobs
        </h2>
        <button
          onClick={() => setShowSidebar(false)}
          className="text-zinc-500 hover:text-zinc-300 transition"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Job List */}
      <div className="overflow-y-auto max-h-[calc(100vh-64px)] p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-zinc-500 text-center">Loading...</p>
        ) : myJobs.length > 0 ? (
          myJobs.map((job) => (
            <div
              key={job._id}
              onClick={() => {
                setShowSidebar(false);
                navigate(`/jobs/${job._id}`); // ✅ Go to job detail page
              }}
              className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition"
            >
              <h3 className="font-semibold text-zinc-800 dark:text-white">
                {job.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {job.description}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Status: {job.status || "Pending"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500 text-center mt-10">
            No jobs posted yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyJobsSidebar;
