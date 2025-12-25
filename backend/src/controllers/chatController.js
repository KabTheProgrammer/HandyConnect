import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel.js";
import Job from "../models/jobModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// -----------------------------------------------------
// GET ALL CHATS FOR LOGGED-IN USER
// -----------------------------------------------------
export const getAllChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.find({ participants: userId })
    .populate("participants", "name profileImage isOnline")
    .populate("job", "title") // include job title if chat is job-related
    .populate("messages.sender", "name profileImage")
    .sort({ updatedAt: -1 })
    .lean();

  const formatted = chats.map((chat) => {
    chat.unreadCount = chat.messages.filter(
      (msg) => msg.sender._id.toString() !== userId.toString() && !msg.read
    ).length;
    return chat;
  });

  res.json(formatted);
});

// -----------------------------------------------------
// GET CHAT BY ID
// -----------------------------------------------------
export const getChatById = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chat ID" });
  }

  const chat = await Chat.findById(chatId)
    .populate("participants", "name profileImage isOnline")
    .populate("job", "title")
    .populate("messages.sender", "name profileImage");

  if (!chat) return res.status(404).json({ message: "Chat not found" });

  res.json(chat);
});

// -----------------------------------------------------
// START OR GET PRE-JOB CHAT WITH PROVIDER
// -----------------------------------------------------
export const startChatWithProvider = asyncHandler(async (req, res) => {

  const { providerId } = req.params;
  const userId = req.user?._id;

  if (!userId) return res.status(401).json({ message: "No authenticated user" });
  if (!mongoose.Types.ObjectId.isValid(providerId)) return res.status(400).json({ message: "Invalid providerId" });

  if (userId.toString() === providerId) return res.status(400).json({ message: "Cannot chat with yourself" });

  const provider = await User.findById(providerId);
  if (!provider) return res.status(404).json({ message: "Provider not found" });

  let chat = await Chat.findOne({
    participants: { $all: [userId, providerId] },
    job: null,
  }).populate("participants", "name profileImage isOnline");

  if (!chat) {
    if (!chat) {
  try {
    chat = await Chat.create({
      participants: [userId, providerId],
      messages: [],
      job: null,
    });
    chat = await chat.populate("participants", "name profileImage isOnline");
  } catch (err) {
    return res.status(500).json({ message: "Chat creation failed", error: err.message });
  }
}
  }
  res.status(200).json(chat);
});


// -----------------------------------------------------
// GET OR CREATE JOB CHAT
// -----------------------------------------------------
export const getOrCreateJobChat = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(jobId))
    return res.status(400).json({ message: "Invalid job ID" });

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });

  let chat = await Chat.findOne({ job: jobId }).populate(
    "participants",
    "name profileImage isOnline"
  );

  if (!chat) {
    chat = await Chat.create({
      participants: [job.customer, job.assignedProvider || userId],
      job: jobId,
      messages: [],
    });
    chat = await chat.populate("participants", "name profileImage isOnline");
  }

  res.json(chat);
});

// -----------------------------------------------------
// ADD MESSAGE
// -----------------------------------------------------
export const addMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { text, attachments } = req.body;
  const senderId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(chatId))
    return res.status(400).json({ message: "Invalid chat ID" });

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  if (!chat.participants.map(p => p.toString()).includes(senderId.toString())) {
    chat.participants.push(senderId);
  }

  const newMessage = {
    sender: senderId,
    text: text || "",
    attachments: attachments || [],
    read: false,
    createdAt: new Date(),
  };

  chat.messages.push(newMessage);
  chat.updatedAt = new Date();
  await chat.save();

  // emit via socket if io exists
  if (req.io) {
    chat.participants.forEach((participantId) => {
      req.io.to(participantId.toString()).emit("receiveMessage", newMessage);
    });
  }

  res.json(newMessage);
});

// -----------------------------------------------------
// MARK ALL MESSAGES AS READ
// -----------------------------------------------------
export const markAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  chat.messages.forEach((msg) => {
    if (msg.sender.toString() !== userId.toString()) msg.read = true;
  });

  await chat.save();
  res.json({ success: true });
});

// -----------------------------------------------------
// SEND FILE MESSAGE
// -----------------------------------------------------
export const sendFileMessage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  const message = {
    sender: req.user._id,
    attachments: [req.file.path],
    read: false,
    createdAt: new Date(),
  };

  chat.messages.push(message);
  chat.updatedAt = new Date();
  await chat.save();

  if (req.io) {
    chat.participants.forEach((participantId) => {
      req.io.to(participantId.toString()).emit("receiveMessage", message);
    });
  }

  res.json(message);
});

export const sendMediaMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const files = req.files; // multer array for multiple uploads

  if (!files || files.length === 0)
    return res.status(400).json({ message: "No files uploaded" });

  if (!mongoose.Types.ObjectId.isValid(chatId))
    return res.status(400).json({ message: "Invalid chat ID" });

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  // Get URLs from multer + Cloudinary
  const attachments = files.map((f) => f.path); // CloudinaryStorage sets path = secure_url

  const message = {
    sender: req.user._id,
    attachments,
    read: false,
    createdAt: new Date(),
  };

  chat.messages.push(message);
  chat.updatedAt = new Date();
  await chat.save();

  // Emit via socket if io exists
  if (req.io) {
    chat.participants.forEach((participantId) => {
      req.io.to(participantId.toString()).emit("receiveMessage", message);
    });
  }

  res.json({ message, attachments });
});