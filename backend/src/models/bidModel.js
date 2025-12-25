import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Optional: prevent duplicate bids by same provider for same job
bidSchema.index({ job: 1, provider: 1 }, { unique: true });

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
