import { useGetJobsQuery } from "../features/jobs/jobApiSlice";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";

const JobList = () => {
  const { data: jobs, isLoading, isError } = useGetJobsQuery();

  if (isLoading) return <Loader />;
  if (isError) return <Message variant="danger">Failed to load jobs</Message>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Available Jobs</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {jobs?.map((job) => (
          <div
            key={job._id}
            className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{job.description}</p>
            <p className="font-medium">Budget: ${job.budget}</p>
            <Link
              to={`/jobs/${job._id}`}
              className="mt-2 inline-block text-blue-600 hover:underline"
            >
              View Details →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;
