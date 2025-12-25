import asyncHandler from "express-async-handler";
import Review from "../models/reviewModel.js";
import User from "../models/userModel.js";
import Job from "../models/jobModel.js";

// @desc Create a new review for a provider (only after job completion)
// @route POST /api/reviews
// @access Private (customer)
export const createReview = asyncHandler(async (req, res) => {
  const { providerId, jobId, rating, comment } = req.body;

  // ✅ Check provider existence
  const provider = await User.findById(providerId);
  if (!provider || provider.userType !== "provider") {
    res.status(404);
    throw new Error("Provider not found or invalid user type");
  }

  // ✅ Find job and validate completion
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.status !== "completed") {
    res.status(400);
    throw new Error("You can only review after the job is completed");
  }

  // ✅ Ensure this customer actually owned the job
  if (job.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to review this job");
  }

  // ✅ Prevent duplicate reviews for the same job
  const alreadyReviewed = await Review.findOne({
    provider: providerId,
    customer: req.user._id,
    job: jobId,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You already reviewed this provider for this job");
  }

  // ✅ Create the review
  const review = await Review.create({
    provider: providerId,
    customer: req.user._id,
    job: jobId,
    rating,
    comment,
  });

  // ⭐ Recalculate provider’s average rating and review count
  const reviews = await Review.find({ provider: providerId });
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  provider.averageRating = avgRating.toFixed(1);
  provider.numReviews = reviews.length;
  await provider.save();

  res.status(201).json({
    message: "Review submitted successfully and provider rating updated",
    review,
    provider: {
      id: provider._id,
      name: provider.name,
      averageRating: provider.averageRating,
      numReviews: provider.numReviews,
    },
  });
});

// @desc Get all reviews for a specific provider (with avg rating)
// @route GET /api/reviews/:providerId
// @access Public
export const getReviewsForProvider = asyncHandler(async (req, res) => {
  const { providerId } = req.params;

  // ✅ Check provider existence
  const provider = await User.findById(providerId);
  if (!provider || provider.userType !== "provider") {
    res.status(404);
    throw new Error("Provider not found or invalid user type");
  }

  // ✅ Fetch all reviews for this provider, include customer name & email
  const reviews = await Review.find({ provider: providerId })
    .populate("customer", "name email")
    .sort({ createdAt: -1 });

  // ✅ Calculate average rating (consistent with model)
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  // ✅ Sync with provider model stats (optional but clean)
  provider.averageRating = averageRating;
  provider.numReviews = reviews.length;
  await provider.save();

  res.status(200).json({
    provider: {
      id: provider._id,
      name: provider.name,
      averageRating,
      totalReviews: reviews.length,
    },
    reviews,
  });
});

// @desc Get reviews for the logged-in provider (their own profile)
// @route GET /api/reviews/my
// @access Private (provider only)
export const getMyReviews = asyncHandler(async (req, res) => {
  // Ensure the logged-in user is a provider
  if (req.user.userType !== "provider") {
    res.status(403);
    throw new Error("Only providers can view their reviews");
  }

  const providerId = req.user._id;

  // Fetch reviews for this provider
  const reviews = await Review.find({ provider: providerId })
    .populate("customer", "name email")
    .sort({ createdAt: -1 });

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  res.status(200).json({
    provider: {
      id: providerId,
      name: req.user.name,
      averageRating,
      totalReviews: reviews.length,
    },
    reviews,
  });
});
