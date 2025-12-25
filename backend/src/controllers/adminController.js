import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Job from "../models/jobModel.js";
import Review from "../models/reviewModel.js";
import Dispute from "../models/disputeModel.js"; // create this model later
import ActivityLog from "../models/activityModel.js"; // optional

// === User Management ===
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

export const getAllJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate("provider", "name email");
  res.json(jobs);
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Job.distinct("category");
  res.json(categories);
});

// === Requests & Offers ===
export const getAllRequests = asyncHandler(async (req, res) => {
  const requests = await Job.find({ status: "requested" }).populate("customer provider");
  res.json(requests);
});

export const getAllOffers = asyncHandler(async (req, res) => {
  const offers = await Job.find({ status: "offered" }).populate("provider");
  res.json(offers);
});

// === Analytics & Reporting ===
export const getReports = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalReviews = await Review.countDocuments();

  res.json({
    totalUsers,
    totalJobs,
    totalReviews,
  });
});

export const getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 });
  res.json(logs);
});

// === Content Moderation ===
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().populate("provider customer", "name email");
  res.json(reviews);
});

export const getAllDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find().populate("provider customer", "name email");
  res.json(disputes);
});
