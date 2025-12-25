// src/features/providers/providerApiSlice.js
import { apiSlice } from "../../app/api/apiSlice";
import { PROVIDER_URL } from "../../constants/apiConstants";

export const providerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get top providers (with optional geolocation)
    getTopProviders: builder.query({
      query: ({ latitude, longitude, maxDistance = 10000 } = {}) => {
        const params = new URLSearchParams();
        if (latitude && longitude) {
          params.append("latitude", latitude);
          params.append("longitude", longitude);
          params.append("maxDistance", maxDistance);
        }

        return `${PROVIDER_URL.TOP}?${params.toString()}`;
      },
      providesTags: ["User"],
    }),

    // ✅ Get single provider details
    getProviderById: builder.query({
      query: (id) => `${PROVIDER_URL.BASE}/${id}`,
      providesTags: ["User"],
    }),
  }),
});

export const { useGetTopProvidersQuery, useGetProviderByIdQuery } = providerApiSlice;
