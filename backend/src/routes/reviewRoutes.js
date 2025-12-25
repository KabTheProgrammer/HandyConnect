import express from "express";
import {
  createReview,
  getReviewsForProvider,
  getMyReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route POST /api/reviews
// @desc Create a review for a provider (customer only)
// @access Private
router.post("/", protect, createReview);

// @route GET /api/reviews/my
// @desc Get reviews for the logged-in provider
// @access Private (provider only)
router.get("/my/reviews", protect, getMyReviews);

// @route GET /api/reviews/:providerId
// @desc Get all reviews for a specific provider
// @access Public
router.get("/:providerId", getReviewsForProvider);


export default router;
