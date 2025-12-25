import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  removeJobImages,
  getAssignedJobs,
  providerMarkJobComplete,
  customerConfirmJobComplete,
  assignProvider,
  getActiveJobs,
  getProviderJobs,
  getProviderPendingJobs,
  getProviderCompletedJobs,
} from "../controllers/jobController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ✅ Public jobs and create job
router
  .route("/")
  .get(getJobs)
  .post(protect, upload.array("images", 5), createJob);

// ✅ MUST come before /:id route
router.get("/assigned", protect, getAssignedJobs);
router.get("/active", protect, getActiveJobs);
router.put("/:jobId/assign", protect, assignProvider);


router.put("/:id/mark-complete", protect, providerMarkJobComplete);
router.put("/:id/confirm-complete", protect, customerConfirmJobComplete);

router.get("/provider", protect, getProviderJobs);
router.get("/provider/pending", protect, getProviderPendingJobs);
router.get("/provider/completed", protect, getProviderCompletedJobs);

// ✅ Job by ID routes
router
  .route("/:id")
  .get(getJobById)
  .put(protect, upload.array("images", 5), updateJob)
  .delete(protect, deleteJob);

// ✅ Remove specific job images
router.put("/:id/remove-images", protect, removeJobImages);

export default router;
