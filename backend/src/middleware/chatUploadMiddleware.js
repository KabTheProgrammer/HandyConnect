import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

// -------------------------------
// Single file upload (e.g., PDFs, single images/videos)
// -------------------------------
const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "HandyConnect/ChatFiles",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "mp4"],
    transformation: [
      { quality: "auto" }, // automatic compression for images/videos
    ],
  },
});

export const uploadChatFile = multer({ storage: chatStorage });

// -------------------------------
// Multiple media uploads (images/videos)
// -------------------------------
const chatMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "HandyConnect/ChatMedia",
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "avi"],
    transformation: [
      { quality: "auto" }, // compress images/videos
      { fetch_format: "auto" }, // automatically optimize format
    ],
  },
});

export const uploadChatMedia = multer({ storage: chatMediaStorage });

export default uploadChatFile;
