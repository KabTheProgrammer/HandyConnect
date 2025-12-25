// src/pages/ProviderJobDetails.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2, MapPin, Tag, DollarSign, CalendarDays } from "lucide-react";
import { useGetJobByIdQuery, useProviderMarkCompleteMutation } from "../features/jobs/jobApiSlice";
import BottomNav from "../components/BottomNav";

const ProviderJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});

  const { data: jobData, isLoading, isError, refetch } = useGetJobByIdQuery(id);
  const job = jobData?.job || jobData;

  const [providerMarkComplete, { isLoading: marking }] = useProviderMarkCompleteMutation();

  const handleMarkComplete = async () => {
    try {
      await providerMarkComplete(job._id).unwrap();
      await refetch();
      alert("Job marked as complete. Waiting for customer confirmation.");
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Failed to mark job as complete.");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-background-light dark:bg-background-dark">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  if (isError || !job)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load job details.</p>
      </div>
    );

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col justify-between">
      {/* HEADER */}
      <header className="sticky top-0 z-10 flex items-center bg-background-light/80 p-4 pb-2 backdrop-blur-sm dark:bg-background-dark/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 dark:text-gray-200"
        >
          <svg
            fill="currentColor"
            height="24px"
            viewBox="0 0 256 256"
            width="24px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
          </svg>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold pr-10">Job Details</h1>
      </header>

      {/* MAIN */}
      <main className="flex-grow p-4 mb-36 overflow-y-auto">
        {/* Job Info */}
        <section className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{job.category || "Uncategorized"}</p>
          <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">{job.description || "No description provided."}</p>
        </section>

        {/* Job Images */}
        {job.attachments?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-2xl font-bold mb-3">Job Images</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {job.attachments.map((img, index) => (
                <div key={index} className="relative overflow-hidden rounded-lg shadow-sm">
                  <img
                    src={img.startsWith("http") ? img : `http://localhost:5000${img.startsWith("/") ? img : "/" + img}`}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Job Details Box */}
        <section className="mb-6">
          <h2 className="text-2xl font-bold mb-3">Job Details</h2>
          <div className="mt-4 space-y-4 rounded-lg bg-white dark:bg-[#162228] p-4 shadow-sm">
            <DetailRow icon={<Tag size={18} />} label="Category" value={job.category || "N/A"} />
            <DetailRow icon={<MapPin size={18} />} label="Location" value={job.location || "No location"} />
            <DetailRow icon={<DollarSign size={18} />} label="Budget" value={`$${job.budget || "N/A"}`} isPrimary />
            <DetailRow icon={<CalendarDays size={18} />} label="Posted" value={job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"} />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="sticky bottom-0 bg-background-light dark:bg-background-dark border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            {!job.isProviderMarkedComplete ? (
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                className="flex-1 py-3 rounded-full bg-[#0099E6] text-white font-semibold shadow-md hover:bg-[#0088cc] transition"
              >
                {marking ? "Marking..." : "Mark Job Complete"}
              </button>
            ) : (
              <span className="flex-1 py-3 text-center text-gray-500 font-medium">
                Waiting for customer confirmation
              </span>
            )}
          </div>
        </div>
        <BottomNav />
      </footer>
    </div>
  );
};

const DetailRow = ({ icon, label, value, isPrimary }) => (
  <div className={`flex justify-between items-center border-b border-gray-200/50 py-3`}>
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">{icon} {label}</div>
    <p className={`font-medium ${isPrimary ? "text-primary" : ""}`}>{value}</p>
  </div>
);

export default ProviderJobDetails;
