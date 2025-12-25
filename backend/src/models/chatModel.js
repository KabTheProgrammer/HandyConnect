// src/models/chatModel.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    attachments: [String], // cloudinary urls or file paths
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const chatSchema = mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        attachments: [String],
        read: Boolean,
        createdAt: Date,
      },
    ],
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      unique: true,  // still unique per job chat
      sparse: true,  // allow multiple nulls for pre-job chats
      default: null,
    },
  },
  { timestamps: true }
);



const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
