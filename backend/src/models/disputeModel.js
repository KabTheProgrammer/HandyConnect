import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issueType: {
      type: String,
      enum: ["payment", "service_quality", "fraud", "other"],
      default: "other",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "rejected"],
      default: "open",
    },
    resolution: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who handled it
    },
  },
  { timestamps: true }
);

const Dispute = mongoose.model("Dispute", disputeSchema);
export default Dispute;
