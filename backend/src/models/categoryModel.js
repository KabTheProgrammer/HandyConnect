import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String, // optional for UI (could be a Cloudinary URL or local path)
    },
    isActive: {
      type: Boolean,
      default: true, // allows admin to hide categories without deleting them
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who created it
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
