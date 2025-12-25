import cron from "node-cron";
import cloudinary from "../utils/cloudinary.js";

cron.schedule("0 3 * * *", async () => {
  console.log("🧹 Running cleanup job...");

  try {
    const result = await cloudinary.search
      .expression('folder="HandyConnect/ChatMedia"')
      .execute();

    const now = Math.floor(Date.now() / 1000);

    const expired = result.resources.filter((file) => {
      if (!file.context?.custom?.expiresAt) return false;
      return Number(file.context.custom.expiresAt) < now;
    });

    for (const file of expired) {
      await cloudinary.uploader.destroy(file.public_id, {
        resource_type: file.resource_type,
      });
      console.log("🗑 Deleted", file.public_id);
    }

  } catch (err) {
    console.error("Cleanup error:", err);
  }
});
