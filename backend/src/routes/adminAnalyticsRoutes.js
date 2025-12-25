import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getPlatformStats } from "../controllers/adminAnalyticsController.js";

const router = express.Router();

router.get("/", protect, admin, getPlatformStats);

export default router;
