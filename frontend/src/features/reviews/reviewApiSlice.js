import { apiSlice } from "../../app/api/apiSlice";

export const reviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReviewsForProvider: builder.query({
      query: (providerId) => `/reviews/${providerId}`,
      providesTags: (result, error, providerId) => {
        const reviewsArray = Array.isArray(result) ? result : [];
        return [
          ...reviewsArray.map((r) => ({ type: "Review", id: r._id })),
          { type: "Reviews", id: providerId },
        ];
      },
    }),
  }),
});

export const { useGetReviewsForProviderQuery } = reviewApiSlice;
