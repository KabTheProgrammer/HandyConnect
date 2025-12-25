import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadChatFile, uploadChatMedia } from "../middleware/chatUploadmiddleware.js";

import {
  getAllChats,
  addMessage,
  markAsRead,
  sendFileMessage,
  sendMediaMessage,
  getChatById,
  startChatWithProvider,
  getOrCreateJobChat,
} from "../controllers/chatController.js";

const router = express.Router();

// ----------------------------
// Pre-job chat with provider
// ----------------------------
router.post("/provider/:providerId", protect, startChatWithProvider);

// ----------------------------
// Job chat
// ----------------------------
router.get("/job/:jobId", protect, getOrCreateJobChat);

// ----------------------------
// Messages
// ----------------------------
router.post("/:chatId", protect, addMessage);

// Single file message
router.post("/:chatId/file", protect, uploadChatFile.single("file"), sendFileMessage);

// Multi-media message (images/videos)
router.post("/:chatId/media", protect, uploadChatMedia.array("files"), sendMediaMessage);

// Mark as read
router.patch("/:chatId/read", protect, markAsRead);

// ----------------------------
// Get chat list
// ----------------------------
router.get("/", protect, getAllChats);

// Get chat details
router.get("/:chatId", protect, getChatById);

export default router;
