import { apiSlice } from "../../app/api/apiSlice";
import { JOB_URL } from "../../constants/apiConstants";

export const jobApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all jobs (public or customer view)
    getAllJobs: builder.query({
      query: () => `${JOB_URL.BASE}`,
      providesTags: (result = []) =>
        result
          .map((job) => ({ type: "Job", id: job._id }))
          .concat([{ type: "AllJobs" }]),
    }),
    getProviderJobs: builder.query({
      query: () => `${JOB_URL.BASE}/provider`,
      providesTags: (result = []) =>
        result
          .map((job) => ({ type: "Job", id: job._id }))
          .concat([{ type: "ProviderJobs" }]),
    }),

    getAssignedJobs: builder.query({
      query: (userId) => `${JOB_URL.BASE}/assigned?user=${userId}`,
      providesTags: ["AssignedJobs"],
    }),

    // ✅ Get job by ID
    getJobById: builder.query({
      query: (jobId) => `${JOB_URL.BASE}/${jobId}`,
      providesTags: (result, error, id) => [{ type: "Job", id }],
    }),

    // ✅ Create a new job (customer)
    createJob: builder.mutation({
      query: (formData) => ({
        url: `${JOB_URL.BASE}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AllJobs"],
    }),

    // ✅ Update a job (customer)
    updateJob: builder.mutation({
      query: ({ id, formData }) => ({
        url: `${JOB_URL.BASE}/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Job", id },
        "AllJobs",
      ],
    }),

    // ✅ Delete a job
    deleteJob: builder.mutation({
      query: (id) => ({
        url: `${JOB_URL.BASE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AllJobs"],
    }),

    // ✅ Remove job images
    removeJobImages: builder.mutation({
      query: ({ id, imageUrls }) => ({
        url: `${JOB_URL.BASE}/${id}/remove-images`,
        method: "PUT",
        body: { imageUrls }, // 👈 must match backend expectation
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Job", id },
        "AllJobs",
      ],
    }),

    // ✅ Provider marks job complete
    providerMarkComplete: builder.mutation({
      query: (id) => ({
        url: `${JOB_URL.BASE}/${id}/mark-complete`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Job", id }, "AllJobs"],
    }),

    // ✅ Customer confirms completion
    customerConfirmComplete: builder.mutation({
      query: (id) => ({
        url: `${JOB_URL.BASE}/${id}/confirm-complete`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Job", id }, "AllJobs"],
    }),

    // ✅ Get bids for a specific job
    getBidsForJob: builder.query({
      query: (jobId) => `/jobs/${jobId}/bids`,
      providesTags: ["Bids"],
    }),

    // ✅ Update bid status (accept/reject)
    updateBidStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/bids/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Bids"],
    }),

    // ✅ Get active jobs
    getActiveJobs: builder.query({
      query: () => `${JOB_URL.BASE}/active`,
      providesTags: ["Jobs"],
    }),

    // ✅ Assign provider (customer final confirmation)
    assignProvider: builder.mutation({
      query: ({ jobId, providerId }) => ({
        url: `${JOB_URL.BASE}/${jobId}/assign`,
        method: "PUT",
        body: { providerId },
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: "Job", id: jobId },
        "AllJobs",
      ],
    }),

    getProviderPendingJobs: builder.query({
      query: () => `${JOB_URL.BASE}/provider/pending`,
      providesTags: ["ProviderJobs"],
    }),
    getProviderCompletedJobs: builder.query({
      query: () => `${JOB_URL.BASE}/provider/completed`,
      providesTags: ["ProviderJobs"],
    }),
  }),
});

export const {
  useGetAllJobsQuery,
  useGetAssignedJobsQuery,
  useGetProviderJobsQuery,
  useGetJobByIdQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useRemoveJobImagesMutation,
  useProviderMarkCompleteMutation,
  useCustomerConfirmCompleteMutation,
  useGetBidsForJobQuery,
  useUpdateBidStatusMutation,
  useAssignProviderMutation,
  useGetActiveJobsQuery,
  useGetProviderPendingJobsQuery,
  useGetProviderCompletedJobsQuery,
} = jobApiSlice;
