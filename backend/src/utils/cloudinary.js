// backend/src/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // ✅ load .env before configuring

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
