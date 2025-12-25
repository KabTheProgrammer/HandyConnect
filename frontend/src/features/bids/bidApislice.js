import { apiSlice } from "../../app/api/apiSlice";

export const bidApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create a new bid
    createBid: builder.mutation({
      query: ({ jobId, ...data }) => ({
        url: `/jobs/${jobId}/bids`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: "JobBids", id: jobId },
        { type: "MyBids" },
      ],
    }),

    // ✅ Get all bids for a specific job
    getBidsForJob: builder.query({
      query: (jobId) => `/jobs/${jobId}/bids`,
      providesTags: (result, error, jobId) => [{ type: "JobBids", id: jobId }],
    }),

    // ✅ Provider’s own bids
    getMyBids: builder.query({
      query: () => `/bids/my-bids`,
      providesTags: ["MyBids"],
    }),

    // ✅ Cancel bid
    cancelBid: builder.mutation({
      query: (id) => ({
        url: `/bids/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["MyBids"],
    }),

    // ✅ Admin / all bids
    getAllBids: builder.query({
      query: () => `/bids`,
      providesTags: ["Bid"],
    }),

    // ✅ Update bid status
    updateBidStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/bids/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Bid", "MyBids", "JobBids"],
    }),

    // ✅ Reject bid
    rejectBid: builder.mutation({
      query: (id) => ({
        url: `/bids/${id}/reject`,
        method: "PUT",
      }),
      invalidatesTags: ["Bid", "MyBids", "JobBids"],
    }),

    // ✅ Accept + assign bid
    acceptAndAssignBid: builder.mutation({
      query: ({ bidId }) => ({
        url: `/bids/${bidId}/accept`,
        method: "PUT",
      }),
      transformResponse: (response) => response,
      invalidatesTags: ["Bid", "MyBids", "JobBids"],
    }),
  }),
});

export const {
  useCreateBidMutation,
  useGetBidsForJobQuery,
  useGetAllBidsQuery,
  useGetMyBidsQuery,
  useCancelBidMutation,
  useUpdateBidStatusMutation,
  useRejectBidMutation,
  useAcceptAndAssignBidMutation,
} = bidApiSlice;
