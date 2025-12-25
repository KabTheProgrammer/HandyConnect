import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBid,
  getBidsForJob,
  getAllBids,
  updateBidStatus,
  acceptBid,
  rejectBid,
  getMyBids,
  assignBidToProvider,
  cancelBid,
} from "../controllers/bidController.js";

const router = express.Router();

// ✅ Provider applies for a job
router.post("/:jobId/bids", protect, createBid);

// ✅ Customer or admin views all bids for a specific job
router.get("/:jobId/bids", protect, getBidsForJob);

// ✅ Provider views their own bids
router.get("/my-bids", protect, getMyBids);

// ✅ Provider cancels their own bid
router.put("/:id/cancel", protect, cancelBid);

// ✅ Admin views all bids
router.get("/", protect, getAllBids);

// ✅ Customer updates bid status
router.put("/:id/status", protect, updateBidStatus);
router.put("/:id/accept", protect, acceptBid);
router.put("/:id/reject", protect, rejectBid);

// ✅ Customer assigns accepted bid to provider
router.put("/:id/assign", protect, assignBidToProvider);

export default router;
