import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the Cloudinary public_id from a full URL.
 * Example: https://res.cloudinary.com/demo/image/upload/v1234/folder/name.jpg
 * → returns: folder/name
 */
export const extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const publicIdWithExt = parts.slice(-2).join("/"); // e.g. HandyConnect/JobImages/filename.jpg
    const publicId = publicIdWithExt.split(".")[0]; // remove .jpg, .png
    return publicId;
  } catch (error) {
    console.error("Failed to extract public_id:", error);
    return null;
  }
};

/**
 * Deletes an image from Cloudinary by URL
 */
export const deleteCloudinaryImage = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("🧹 Deleted from Cloudinary:", publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

/**
 * Deletes multiple images
 */
export const deleteMultipleCloudinaryImages = async (urls) => {
  const publicIds = urls
    .map(extractPublicId)
    .filter((id) => id !== null && id !== undefined);
  if (publicIds.length === 0) return;

  try {
    await cloudinary.api.delete_resources(publicIds);
    console.log("🧹 Deleted multiple Cloudinary images:", publicIds);
  } catch (error) {
    console.error("Cloudinary bulk delete error:", error);
  }
};
