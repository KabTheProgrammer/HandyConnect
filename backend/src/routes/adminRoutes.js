import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getAllJobs,
  getAllCategories,
  getAllRequests,
  getAllOffers,
  getReports,
  getActivityLogs,
  getAllReviews,
  getAllDisputes,
} from "../controllers/adminController.js";

const router = express.Router();

// ✅ All routes here are protected + admin only
router.use(protect, admin);

// === User Management ===
router.get("/users", getAllUsers);
router.get("/jobs", getAllJobs);
router.get("/categories", getAllCategories);

// === Requests & Offers ===
router.get("/requests", getAllRequests);
router.get("/offers", getAllOffers);

// === Analytics & Reporting ===
router.get("/reports", getReports);
router.get("/activity", getActivityLogs);

// === Content Moderation ===
router.get("/reviews", getAllReviews);
router.get("/disputes", getAllDisputes);

export default router;
