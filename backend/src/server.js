import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; // ✅ FIX #1: Import HTTP for socket server
import { Server } from "socket.io"; // ✅ FIX #2: Import socket.io properly
import connectDB from "./config/db.js";
import './cron/deleteExpired.js'


// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import providerRoutes from "./routes/userRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminDisputeRoutes from "./routes/adminDisputeRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";

dotenv.config();
const app = express();

// ------------------------
// CORS CONFIG
// ------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://your-production-domain.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// ------------------------
// CONNECT DB
// ------------------------
connectDB();

// ------------------------
// API ROUTES
// ------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/jobs", bidRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/chat", chatRoutes);

// ADMIN ROUTES
app.use("/api/admin", adminRoutes);
app.use("/api/admin/disputes", adminDisputeRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);

// ------------------------
// SOCKET.IO SERVER
// ------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ New socket:", socket.id);

  // Save online users
  socket.on("userOnline", (userId) => {
    socket.userId = userId;
    io.emit("onlineUsers", { userId, isOnline: true });
  });

  // Join chat room for a jobId
  socket.on("joinRoom", (jobId) => {
    socket.join(jobId);
  });

  // Send message
  socket.on("sendMessage", (data) => {
    io.to(data.jobId).emit("receiveMessage", data);
  });

  // Typing indicator
  socket.on("typing", ({ jobId, userId }) => {
    socket.to(jobId).emit("typing", { userId });
  });

  // Stop typing
  socket.on("stopTyping", ({ jobId, userId }) => {
    socket.to(jobId).emit("stopTyping", { userId });
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      io.emit("onlineUsers", { userId: socket.userId, isOnline: false });
    }
  });
});


// -------------------------
// NOT FOUND HANDLER
// -------------------------
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// -------------------------
// GLOBAL ERROR HANDLER
// -------------------------
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
);
