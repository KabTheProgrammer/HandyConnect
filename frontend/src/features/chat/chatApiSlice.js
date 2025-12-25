import { apiSlice } from "../../app/api/apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get or create chat for a job
    getChatByJobId: builder.query({
      query: (jobId) => ({
        url: `/chat/job/${jobId}`, // ✅ matches backend
        method: "GET",
      }),
      providesTags: ["Chat"],
    }),

    getAllChats: builder.query({
      query: () => ({
        url: "/chat",
        method: "GET",
      }),
      providesTags: ["Chat"],
    }),

    sendMessage: builder.mutation({
      query: ({ chatId, text }) => ({
        url: `/chat/${chatId}`, // must be real chatId
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Chat"],
    }),

    sendMediaMessage: builder.mutation({
  query: ({ chatId, files, token }) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return {
      url: `/chat/${chatId}/media`,
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type' will be automatically set by browser for FormData
      },
    };
  },
  invalidatesTags: ["Chat"],
}),

  }),
});



export const {
  useGetAllChatsQuery,
  useGetChatByJobIdQuery,
  useSendMessageMutation,
  useSendMediaMessageMutation,
} = chatApiSlice;
