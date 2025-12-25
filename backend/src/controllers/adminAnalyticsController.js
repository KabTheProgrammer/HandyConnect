import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Job from "../models/jobModel.js";
import Review from "../models/reviewModel.js";
import Dispute from "../models/disputeModel.js";
import ActivityLog from "../models/activityModel.js";

export const getPlatformStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const customers = await User.countDocuments({ userType: "customer" });
  const providers = await User.countDocuments({ userType: "provider" });

  const jobs = await Job.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const disputes = await Dispute.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const avgRating = await Review.aggregate([
    { $group: { _id: null, avgRating: { $avg: "$rating" } } }
  ]);

  const recentActivity = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("action category createdAt user");

  res.json({
    users: { total: totalUsers, customers, providers },
    jobs,
    disputes,
    averageRating: avgRating[0]?.avgRating || 0,
    recentActivity,
  });
});
