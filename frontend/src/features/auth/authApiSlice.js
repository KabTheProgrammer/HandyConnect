import { apiSlice } from "../../app/api/apiSlice";
import { AUTH_URL, USER_URL } from "../../constants/apiConstants";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Register
    register: builder.mutation({
      query: (data) => ({
        url: AUTH_URL.REGISTER, // → /api/auth/register
        method: "POST",
        body: data,
      }),
    }),

    // ✅ Login
    login: builder.mutation({
      query: (data) => ({
        url: AUTH_URL.LOGIN, // → /api/auth/login
        method: "POST",
        body: data,
      }),
    }),

    // ✅ Logout
    logout: builder.mutation({
      query: () => ({
        url: AUTH_URL.LOGOUT, // → /api/auth/logout
        method: "POST",
      }),
    }),

    // ✅ Get Profile
    getProfile: builder.query({
      query: () => USER_URL.PROFILE, // → /api/users/profile
      providesTags: ["User"],
    }),

    // ✅ Update Profile (supports Cloudinary image upload)
    updateProfile: builder.mutation({
      query: (data) => ({
        url: USER_URL.PROFILE, // → /api/users/profile
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApiSlice;
