import asyncHandler from "express-async-handler";
import Dispute from "../models/disputeModel.js";
import ActivityLog from "../models/activityModel.js";

/**
 * @desc Get all disputes (admin overview)
 * @route GET /api/admin/disputes
 * @access Private/Admin
 */
export const getAllDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find()
    .populate("job", "title description")
    .populate("customer", "name email")
    .populate("provider", "name email")
    .sort({ createdAt: -1 });

  res.json(disputes);
});

/**
 * @desc Get single dispute
 * @route GET /api/admin/disputes/:id
 * @access Private/Admin
 */
export const getDisputeById = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate("job", "title description")
    .populate("customer", "name email")
    .populate("provider", "name email")
    .populate("reviewedBy", "name email");

  if (!dispute) {
    res.status(404);
    throw new Error("Dispute not found");
  }

  res.json(dispute);
});

/**
 * @desc Resolve a dispute
 * @route PUT /api/admin/disputes/:id/resolve
 * @access Private/Admin
 */
export const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution } = req.body;
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    res.status(404);
    throw new Error("Dispute not found");
  }

  dispute.status = "resolved";
  dispute.resolution = resolution;
  dispute.reviewedBy = req.user._id;
  await dispute.save();

  // ✅ Log admin activity
  await ActivityLog.create({
    user: req.user._id,
    action: `Resolved dispute ${dispute._id}`,
    category: "dispute",
    metadata: {
      disputeId: dispute._id,
      jobId: dispute.job,
      customerId: dispute.customer,
      providerId: dispute.provider,
      resolution,
    },
  });

  res.json({ message: "Dispute resolved successfully", dispute });
});

/**
 * @desc Reject a dispute
 * @route PUT /api/admin/disputes/:id/reject
 * @access Private/Admin
 */
export const rejectDispute = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    res.status(404);
    throw new Error("Dispute not found");
  }

  dispute.status = "rejected";
  dispute.resolution = reason;
  dispute.reviewedBy = req.user._id;
  await dispute.save();

  // ✅ Log admin activity
  await ActivityLog.create({
    user: req.user._id,
    action: `Rejected dispute ${dispute._id}`,
    category: "dispute",
    metadata: {
      disputeId: dispute._id,
      jobId: dispute.job,
      customerId: dispute.customer,
      providerId: dispute.provider,
      reason,
    },
  });

  res.json({ message: "Dispute rejected successfully", dispute });
});
