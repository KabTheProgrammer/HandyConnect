// src/pages/ChatList.jsx
import React, { useState, useEffect } from "react";
import { useGetAllChatsQuery } from "../features/chat/chatApiSlice";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, SquarePen, Search } from "lucide-react";
import { Loader2 } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useSelector } from "react-redux";
import { socket } from "../socket"; // ✅ single socket instance

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");

  // Fetch chats
  const {
    data: chats,
    isLoading,
    isError,
    refetch,
  } = useGetAllChatsQuery(undefined, { refetchOnMountOrArgChange: true });

  // Setup Socket.IO listeners
  useEffect(() => {
    if (!user) return;

    // Notify server user is online
    socket.emit("userOnline", user._id);

    // Join user's personal room for updates
    socket.emit("joinUserRoom", user._id);

    // Listen for new messages and re-fetch chats
    socket.on("receiveMessage", (msg) => {
      console.log("📩 New message received:", msg);
      refetch();
    });

    // Clean up listener
    return () => {
      socket.off("receiveMessage");
    };
  }, [user, refetch]);

  // Filter chats based on search input
  const filteredChats =
    chats?.filter((chat) => {
      const other = chat.participants.find((p) => p._id !== user?._id);
      return other?.name?.toLowerCase().includes(search.toLowerCase());
    }) || [];

  if (isLoading) {
    return (
      <div className="w-full flex justify-center mt-20">
        <Loader2 className="animate-spin" size={30} />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center mt-20 text-red-500">
        Failed to load chats. Please try again.
      </p>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-display bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-background-light dark:bg-background-dark">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex size-12 items-center justify-start text-slate-700 dark:text-slate-300"
          >
            <ArrowLeft className="text-2xl" />
          </button>

          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex-1 text-center">
            Chats
          </h1>

          <div className="flex size-12 items-center justify-end text-slate-700 dark:text-slate-300">
            <SquarePen className="text-2xl" />
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <label className="flex w-full h-12">
            <div className="flex items-center bg-white dark:bg-background-dark rounded-xl w-full shadow-sm">
              <div className="flex items-center justify-center pl-4 text-slate-500 dark:text-slate-400">
                <Search className="text-2xl" />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="flex-1 bg-white dark:bg-background-dark border-none rounded-xl px-4 text-base text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:outline-0"
              />
            </div>
          </label>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex flex-col flex-1 pb-20">
        {filteredChats.length === 0 && (
          <p className="text-center text-slate-500 mt-10">
            No conversations found.
          </p>
        )}

        {filteredChats.map((chat) => {
          const lastMessage =
            chat?.messages?.length > 0
              ? chat.messages[chat.messages.length - 1]
              : null;

          const other =
            chat.participants.find((p) => p._id !== user?._id) ||
            chat.participants[0];

          return (
            <div
              key={chat._id}
              onClick={() => navigate(`/chat/${chat._id}`)}
              className="flex items-center gap-4 px-4 py-2 min-h-[72px] bg-background-light dark:bg-background-dark cursor-pointer active:scale-[0.98] transition justify-between"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative shrink-0">
                  <div
                    className="h-14 w-14 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${
                        other?.profileImage || "/default-avatar.png"
                      }")`,
                    }}
                  ></div>

                  {other?.isOnline && (
                    <div className="absolute bottom-0 right-0 size-4 rounded-full bg-green-500 border-2 border-background-light dark:border-background-dark"></div>
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50 truncate">
                    {other?.name}
                  </p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                    {lastMessage ? lastMessage.text : "No messages yet..."}
                  </p>
                </div>
              </div>

              {/* Time + Unread */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {lastMessage && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}

                {chat.unreadCount > 0 ? (
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                    {chat.unreadCount}
                  </div>
                ) : (
                  lastMessage && (
                    <div className="flex size-6 items-center justify-center">
                      <div className="size-2.5 rounded-full bg-primary"></div>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default ChatList;
