// src/pages/JobDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Loader2,
  MapPin,
  Tag,
  DollarSign,
  CalendarDays,
  User,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  useGetJobByIdQuery,
  useProviderMarkCompleteMutation,
} from "../features/jobs/jobApiSlice";
import BottomNav from "../components/BottomNav";
import BidList from "../components/BidList";
import CustomerConfirmCompletion from "../components/CustomerConfirmCompletion";
import { useGetMyBidsQuery } from "../features/bids/bidApiSlice";
import { toast } from "react-toastify";
import { useGetBidsForJobQuery } from "../features/bids/bidApiSlice";
import axios from 'axios'
import { BASE_URL } from "../constants/apiConstants";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});

  const {
    data: bidsResponse,
    isLoading: isBidsLoading,
    refetch: refetchBids,
  } = useGetBidsForJobQuery(id, { skip: !user });
  const bidsData = bidsResponse?.bids || [];

  // Fetch job details
  const {
    data: jobData,
    isLoading,
    isError,
    refetch: refetchJob,
  } = useGetJobByIdQuery(id);
  const job = jobData?.job || jobData;

  // Fetch provider's bids (if user is a provider)
  const { data: myBidsData } = useGetMyBidsQuery(undefined, {
    skip: user?.userType !== "provider",
  });

  // Mark job complete
  const [providerMarkComplete, { isLoading: markingProviderComplete }] =
    useProviderMarkCompleteMutation();

  const idToString = (val) => {
    if (!val) return null;
    if (typeof val === "string") return val;
    if (val._id) return val._id.toString();
    if (val.toString) return val.toString();
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background-light dark:bg-background-dark">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load job details.</p>
      </div>
    );
  }

  // Determine ownership
  const jobCustomerId = idToString(job.customer);
  const userId = idToString(user?._id || user?.id);
  const isCustomerOwner =
    user?.userType === "customer" && jobCustomerId === userId;

  // Check if provider already bid
 const providerHasBid =
  user?.userType === "provider"
    ? myBidsData?.bids?.some(
        (b) => idToString(b.job?._id || b.job) === idToString(job._id)
      )
    : false;


  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url.startsWith("/") ? url : "/" + url}`;
  };

  const handleBid = () => {
    if (!user) return navigate("/auth-choice");
    if (providerHasBid)
      return toast.info("You have already placed a bid for this job.");
    navigate(`/bids/${job._id}/bids`);
  };

const handleMessageCustomer = async () => {
  if (!user) return navigate("/auth-choice");
  if (!job?._id) return toast.error("Invalid job.");

  try {
    let chat;

    if (user.userType === "provider") {
      // Provider -> Customer: fetch pre-job chat or create new
      const res = await axios.post(
        `${BASE_URL}/chat/provider/${job.customer._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      chat = res.data;
    } else if (user.userType === "customer") {
      // Customer -> Provider: fetch job chat
      const res = await axios.get(`${BASE_URL}/chat/${job._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      chat = res.data;
    }

    if (!chat?._id) return toast.error("Failed to open chat.");

    // Navigate to ChatDetails page
    navigate(`/chat/${chat._id}`, { state: { chat } });
  } catch (err) {
    console.error("Chat creation error:", err);
    toast.error("Could not open chat.");
  }
};



  const handleProviderMarkComplete = async () => {
    try {
      await providerMarkComplete(job._id).unwrap();
      await refetchJob();
      toast.success(
        "Job marked as complete. Waiting for customer confirmation."
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to mark job as complete.");
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col justify-between">
      {/* HEADER */}
      <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-2 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200/30 dark:hover:bg-gray-700/30 transition"
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
        <h1 className="flex-1 text-center text-lg font-bold pr-10">
          Job Details
        </h1>
      </header>

      {/* MAIN */}
      <main className="flex-grow p-4 mb-36 overflow-y-auto">
        {/* Job Info */}
        <section className="mb-6">
          <h2 className="text-2xl font-bold mb-1">{job.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {job.category || "Uncategorized"}
          </p>
          <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
            {job.description || "No description provided."}
          </p>
        </section>

        {/* Job Images */}
        {job.attachments?.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Job Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {job.attachments.map((img, i) => (
                <img
                  key={i}
                  src={getImageUrl(img)}
                  alt={`Attachment ${i + 1}`}
                  className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                />
              ))}
            </div>
          </section>
        )}

        {/* Job Details */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Job Details</h3>
          <div className="bg-white dark:bg-[#162228] shadow-sm rounded-lg p-4 space-y-4">
            <DetailRow
              icon={<Tag size={18} />}
              label="Category"
              value={job.category || "N/A"}
            />
            <DetailRow
              icon={<MapPin size={18} />}
              label="Location"
              value={job.location || "No location"}
            />
            <DetailRow
              icon={<DollarSign size={18} />}
              label="Budget"
              value={`₵ ${job.budget || "N/A"}`}
              valueClass="text-primary font-semibold"
            />
            <DetailRow
              icon={<CalendarDays size={18} />}
              label="Posted"
              value={
                job.createdAt
                  ? new Date(job.createdAt).toLocaleDateString()
                  : "N/A"
              }
            />
          </div>
        </section>

        {/* Customer Info (Provider only) */}
        {user?.userType === "provider" && job.customer && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <User size={18} /> Customer
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={getImageUrl(job.customer.profileImage)}
                alt="Customer"
                className="h-14 w-14 rounded-full object-cover border border-gray-300 dark:border-gray-700"
              />
              <div>
                <p className="font-semibold">{job.customer.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customer
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Customer Confirm Completion */}
        {isCustomerOwner && (
          <CustomerConfirmCompletion job={job} refetchJob={refetchJob} />
        )}

        {/* Bids Section */}
        {isCustomerOwner && (
          <section className="mb-10">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <User size={18} /> Bids for this Job
            </h3>
            <BidList
              job={job}
              bids={bidsData} // now it's an array
              isLoading={isBidsLoading}
              isCustomer
              onDecision={async () => {
                await refetchBids();
                await refetchJob();
              }}
            />
          </section>
        )}
      </main>
      {/* Footer for customer actions */}
{isCustomerOwner && !job.assignedProvider && (
  <footer className="sticky bottom-0 bg-background-light dark:bg-background-dark border-t border-gray-200/50 dark:border-gray-700/50">
    <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(`/jobs/edit/${job._id}`)}
          className="w-full py-3 rounded-full bg-[#0099E6] text-white font-semibold shadow-md hover:bg-[#0088cc] transition"
        >
          Edit Job
        </button>
      </div>
    </div>
    <BottomNav />
  </footer>
)}


      {/* Footer for provider actions */}
      {user?.userType === "provider" && (
        <footer className="sticky bottom-0 bg-background-light dark:bg-background-dark border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
            <div className="max-w-md mx-auto flex items-center gap-3">
              <button
                onClick={handleMessageCustomer}
                className="flex-1 py-3 rounded-full bg-[#D8EEF9] text-[#0073CF] font-semibold shadow-sm hover:bg-[#c7e4f6] transition"
              >
                Message Customer
              </button>

              {!providerHasBid ? (
                <button
                  onClick={handleBid}
                  className="flex-1 py-3 rounded-full bg-[#0099E6] text-white font-semibold shadow-md hover:bg-[#0088cc] transition"
                >
                  Bid on Job
                </button>
              ) : !job.isProviderMarkedComplete ? (
                <button
                  onClick={handleProviderMarkComplete}
                  disabled={markingProviderComplete}
                  className="flex-1 py-3 rounded-full bg-[#0099E6] text-white font-semibold shadow-md hover:bg-[#0088cc] transition"
                >
                  {markingProviderComplete ? "Marking..." : "Mark Job Complete"}
                </button>
              ) : (
                <span
                  className={`flex-1 py-3 text-center font-medium rounded-full ${
                    job.isCustomerConfirmedComplete
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                  }`}
                >
                  {job.isCustomerConfirmedComplete ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> Completed
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Clock size={18} /> Waiting for confirmation
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
          <BottomNav />
        </footer>
      )}
    </div>
  );
};

const DetailRow = ({ icon, label, value, valueClass }) => (
  <div className="flex justify-between items-center border-b border-gray-200/50 py-2 last:border-b-0">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      {icon} {label}
    </div>
    <p className={valueClass || "font-medium"}>{value}</p>
  </div>
);

export default JobDetails;
