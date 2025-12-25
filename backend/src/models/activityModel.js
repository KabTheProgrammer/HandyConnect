import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "auth",
        "job",
        "review",
        "dispute",
        "system",
        "admin_action",
        "profile",
      ],
      default: "system",
    },
    metadata: {
      type: Object,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activitySchema);
export default ActivityLog;
