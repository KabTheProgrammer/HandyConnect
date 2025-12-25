import asyncHandler from "express-async-handler";
import Bid from "../models/bidModel.js";
import Job from "../models/jobModel.js";

// @desc Create a new bid (provider applies for job)
// @route POST /api/jobs/:jobId/bids
// @access Private (Provider)
// @desc Create a new bid (provider applies for job)
// @route POST /api/jobs/:jobId/bids
// @access Private (Provider)
export const createBid = asyncHandler(async (req, res) => {
  try {
    if (req.user.userType !== "provider") {
      res.status(403);
      throw new Error("Only service providers can apply for jobs");
    }

    const { amount, message } = req.body;
    const { jobId } = req.params;

    console.log("Job ID:", jobId);
    console.log("Provider:", req.user._id);
    console.log("Bid data:", amount, message);

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error("Job not found");
    }

    // 🚫 Rule 1: Prevent bidding on completed jobs
    if (job.status === "completed" || job.status === "cancelled") {
      return res.status(400).json({
        message:
          "You cannot bid on this job because it is already completed or cancelled.",
      });
    }

    // 🚫 Rule 2: Prevent new bids if a provider is already assigned
    if (job.status === "assigned" || job.assignedProvider) {
      return res.status(400).json({
        message:
          "Bidding is closed because a provider has already been assigned to this job.",
      });
    }

    // 🚫 Rule 3: Prevent duplicate bids from the same provider
    const existingBid = await Bid.findOne({
      job: jobId,
      provider: req.user._id,
    });
    if (existingBid) {
      return res.status(400).json({
        message: "You have already placed a bid for this job.",
      });
    }

    // ✅ Create a new bid
    const bid = await Bid.create({
      job: jobId,
      provider: req.user._id,
      amount,
      message,
    });

    res.status(201).json({
      message: "Bid submitted successfully.",
      bid,
    });
  } catch (error) {
    console.error("❌ Bid creation failed:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// controllers/bidController.js (updated getBidsForJob)
export const getBidsForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  // Load the job and its owner
  const job = await Job.findById(jobId).select("customer");
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // PROVIDER — only their own bid(s)
  if (req.user.userType === "provider") {
    const bids = await Bid.find({
      job: jobId,
      provider: req.user._id,
    })
      .populate({
        path: "job",
        select: "title description budget category location attachments",
      })
      .populate({
        path: "provider",
        select: "name email profileImage averageRating skills",
      });

    return res.json({ bids });
  }

  // CUSTOMER — only if they own the job
  if (req.user.userType === "customer") {
    if (job.customer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You are not authorized to view bids for this job");
    }

    const bids = await Bid.find({ job: jobId })
      .populate({
        path: "provider",
        select: "name email profileImage averageRating skills",
      })
      .sort({ createdAt: -1 });

    return res.json({ bids });
  }

  // ADMIN — see all bids
  if (req.user.userType === "admin") {
    const bids = await Bid.find({ job: jobId })
      .populate({
        path: "provider",
        select: "name email profileImage averageRating skills",
      })
      .sort({ createdAt: -1 });
    return res.json({ bids });
  }

  // DEFAULT DENY
  res.status(403);
  throw new Error("Not authorized to view bids for this job");
});



// ✅ Admin-only: View all bids across all jobs
export const getAllBids = asyncHandler(async (req, res) => {
  if (req.user.userType !== "admin") {
    res.status(403);
    throw new Error("Only admins can view all bids");
  }

  const bids = await Bid.find()
    .populate("provider", "name email")
    .populate("job", "title location");

  res.json({
    message: "All bids fetched successfully",
    totalBids: bids.length,
    bids,
  });
});

// @desc Update bid status (accept/reject)
// @route PUT /api/bids/:id/status
// @access Private (Customer)
export const updateBidStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // "accepted" or "rejected"

  const bid = await Bid.findById(req.params.id)
    .populate("job")
    .populate("provider", "name email");

  if (!bid) {
    res.status(404);
    throw new Error("Bid not found");
  }

  // ✅ Only job owner (customer) can change bid status
  if (bid.job.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this bid");
  }

  // ✅ Update bid status
  bid.status = status;
  await bid.save();

  // ✅ If bid accepted — assign provider to job
  if (status === "accepted") {
    const job = await Job.findById(bid.job._id);
    job.assignedProvider = bid.provider._id; // ✅ ensures correct reference
    job.status = "assigned";
    job.assignedAt = new Date();
    await job.save();

    // Reject all other bids for this job
    await Bid.updateMany(
      { job: job._id, _id: { $ne: bid._id } },
      { $set: { status: "rejected" } }
    );
  }

  res.json({
    message:
      status === "accepted"
        ? "Bid accepted and provider assigned successfully"
        : "Bid rejected successfully",
    bid,
  });
});

// @desc Accept a bid (assign provider to job)
// @route PUT /api/bids/:id/accept
// @access Private (Customer)
export const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate("job")
      .populate("provider");

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // 🧠 Make sure bid.job exists and is a valid ObjectId
    if (!bid.job || !bid.job._id) {
      return res
        .status(400)
        .json({ message: "Bid has no valid job reference" });
    }

    const job = await Job.findById(bid.job._id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // ✅ Assign provider to the job
    job.assignedProvider = bid.provider._id;
    job.status = "assigned";
    job.assignedAt = new Date();
    await job.save();

    // ✅ Update bid status
    bid.status = "accepted";
    await bid.save();

    // ❌ Reject other bids for the same job automatically
    await Bid.updateMany(
      { job: job._id, _id: { $ne: bid._id } },
      { $set: { status: "rejected" } }
    );

    res.status(200).json({
      message: "Bid accepted and provider assigned to job",
      job,
      bid,
      provider: bid.provider, // ✅ added
    });
  } catch (error) {
    console.error("Error accepting bid:", error);
    res.status(500).json({
      message: "Error accepting bid",
      error: error.message,
    });
  }
};

// @desc Reject a bid manually
// @route PUT /api/bids/:id/reject
// @access Private (Customer)
export const rejectBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id).populate("job");

  if (!bid) {
    res.status(404);
    throw new Error("Bid not found");
  }

  if (bid.job.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to reject this bid");
  }

  bid.status = "rejected";
  await bid.save();

  res.json({
    message: "Bid rejected successfully",
    bid,
  });
});

// controllers/bidController.js
export const getMyBids = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ Fetch all jobs created by this user (if they are a customer)
    const myJobs = await Job.find({ customer: userId }).select("_id");

    // ✅ Fetch all bids where:
    // - user is the provider, OR
    // - bid is on a job created by this user (customer)
    const bids = await Bid.find({
      $or: [
        { provider: userId },
        { job: { $in: myJobs.map((j) => j._id) } },
      ],
    })
      .populate({
        path: "job",
        select: "title description status attachments customer",
        populate: { path: "customer", select: "name email" },
      })
      .populate("provider", "name email");

    res.status(200).json(bids);
  } catch (error) {
    console.error("❌ getMyBids error:", error);
    res.status(500).json({ message: "Failed to fetch bids" });
  }
};


// ✅ Assign an accepted bid to a provider
export const assignBidToProvider = asyncHandler(async (req, res) => {
  const { id } = req.params; // bid id
  const bid = await Bid.findById(id).populate("job provider");

  if (!bid) {
    res.status(404);
    throw new Error("Bid not found");
  }

  const job = await Job.findById(bid.job);
  if (!job) {
    res.status(404);
    throw new Error("Associated job not found");
  }

  // Only the job's customer can assign it
  if (job.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to assign this job");
  }

  if (bid.status !== "accepted") {
    res.status(400);
    throw new Error("Only accepted bids can be assigned");
  }

  // Assign provider to the job
  job.assignedProvider = bid.provider._id;
  job.status = "assigned";
  await job.save();

  res.status(200).json({
    message: `Job assigned to ${bid.provider.name}`,
    job,
  });
});

// @desc Provider cancels their own bid
// @route PUT /api/bids/:id/cancel
// @access Private (Provider)
export const cancelBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);

  if (!bid) {
    res.status(404);
    throw new Error("Bid not found");
  }

  if (bid.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to cancel this bid");
  }

  if (bid.status === "accepted") {
    res.status(400);
    throw new Error("Cannot cancel an accepted bid");
  }

  bid.status = "cancelled";
  await bid.save();

  res.json({
    message: "Bid cancelled successfully",
    bid,
  });
});
