// backend/src/middleware/uploadMiddleware.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

// 🧱 Default single-image storage (e.g., profile images)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "HandyConnect/ProfileImages",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

// 🧱 Job image storage (multiple attachments)
const jobStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "HandyConnect/JobImages",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
export const uploadJobImages = multer({ storage: jobStorage });

const ONE_MONTH = 30 * 24 * 60 * 60;

const chatMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "HandyConnect/ChatMedia",
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov"],
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",

    // Metadata for auto-delete
    context: {
      expiresAt: Math.floor(Date.now() / 1000) + ONE_MONTH,
    }
  })
});

export const uploadChatMedia = multer({ storage: chatMediaStorage });

export default upload;
