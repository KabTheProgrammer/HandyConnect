import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "assigned", "in-progress", "completed", "cancelled"],
      default: "open",
    },
    attachments: [String],
    assignedAt: Date,
    completedAt: Date,
    isProviderMarkedComplete: { type: Boolean, default: false },
    isCustomerConfirmedComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
