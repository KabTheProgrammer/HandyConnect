import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function useChatSocket({ jobId, onMessage }) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    const socket = socketRef.current;

    // Join chat room
    if (jobId) {
      socket.emit("joinRoom", jobId);
    }

    // Listen for new messages
    socket.on("receiveMessage", (msg) => {
      if (onMessage) onMessage(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [jobId]);

  const sendMessage = (payload) => {
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", payload);
    }
  };

  return { sendMessage };
}
