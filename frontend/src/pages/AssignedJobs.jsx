import { useGetAssignedJobsQuery } from "../features/jobs/jobApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";


const AssignedJobs = () => {
  const { data, isLoading, isError } = useGetAssignedJobsQuery();

  if (isLoading) return <Loader />;
  if (isError) return <Message variant="danger">Error loading jobs</Message>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">My Assigned Jobs</h2>
      {data?.jobs?.length === 0 ? (
        <p>No assigned jobs found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.jobs.map((job) => (
            <div key={job._id} className="p-4 border rounded-lg bg-white">
              <h3 className="font-semibold">{job.title}</h3>
              <p>{job.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedJobs;
