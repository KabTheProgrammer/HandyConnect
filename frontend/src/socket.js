// src/socket.js
import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"], // allow polling as fallback
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("✅ Connected to socket server", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connect error:", err.message);
});
