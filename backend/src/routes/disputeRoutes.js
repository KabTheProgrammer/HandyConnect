import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Dispute from "../models/disputeModel.js";
import ActivityLog from "../models/activityModel.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

/**
 * @desc Create a dispute (customer or provider)
 * @route POST /api/disputes
 * @access Private
 */
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { job, issueType, description, provider } = req.body;

    const dispute = await Dispute.create({
      job,
      customer: req.user._id,
      provider,
      issueType,
      description,
    });

    // ✅ Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: `Created a new dispute (${issueType})`,
      category: "dispute",
      metadata: {
        disputeId: dispute._id,
        job,
        issueType,
      },
    });

    res.status(201).json(dispute);
  })
);

/**
 * @desc Get all disputes for logged-in user
 * @route GET /api/disputes
 * @access Private
 */
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const disputes = await Dispute.find({
      $or: [{ customer: req.user._id }, { provider: req.user._id }],
    })
      .populate("job", "title description")
      .populate("customer", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    res.json(disputes);
  })
);

/**
 * @desc Get a single dispute by ID
 * @route GET /api/disputes/:id
 * @access Private
 */
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const dispute = await Dispute.findById(req.params.id)
      .populate("job", "title description")
      .populate("customer", "name email")
      .populate("provider", "name email");

    if (!dispute) {
      res.status(404);
      throw new Error("Dispute not found");
    }

    // Ensure only customer or provider can view it
    if (
      dispute.customer._id.toString() !== req.user._id.toString() &&
      dispute.provider._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Not authorized to view this dispute");
    }

    res.json(dispute);
  })
);

export default router;
