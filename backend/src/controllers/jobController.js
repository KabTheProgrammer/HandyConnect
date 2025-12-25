// backend/src/controllers/jobController.js
import asyncHandler from "express-async-handler";
import Job from "../models/jobModel.js";
import { deleteMultipleCloudinaryImages } from "../utils/cloudinaryHelper.js";

/**
 * @desc Create job
 * @route POST /api/jobs
 * @access Private (Customer)
 */
export const createJob = asyncHandler(async (req, res) => {
  if (req.user.userType !== "customer") {
    res.status(403);
    throw new Error("Only customers can create jobs");
  }

  const { title, description, budget, location, category } = req.body;

  if (!title || !description || !budget || !location || !category) {
    res.status(400);
    throw new Error(
      "All fields are required (title, description, budget, location, category)"
    );
  }

  const imageUrls =
    req.files && req.files.length > 0
      ? req.files.map((file) => file.path || file.url)
      : [];

  const job = new Job({
    customer: req.user._id,
    title,
    description,
    budget,
    location,
    category,
    attachments: imageUrls,
  });

  const createdJob = await job.save();

  res.status(201).json({
    message: "Job created successfully",
    job: createdJob,
  });
});

/**
 * @desc Get all jobs
 * @route GET /api/jobs
 * @access Public
 */
export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find()
    .populate("customer", "name email")
    .sort({ createdAt: -1 });
  res.json(jobs);
});

/**
 * @desc Get single job
 * @route GET /api/jobs/:id
 * @access Public
 */
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate("customer", "name email, profileImage")
    .populate("assignedProvider", "name email phone, profileImage");

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.json(job);
});

/**
 * @desc Update a job
 * @route PUT /api/jobs/:id
 * @access Private (Customer)
 */
export const updateJob = asyncHandler(async (req, res) => {
  const { title, description, budget, location, category, status } = req.body;

  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.customer.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this job");
  }

  // Handle updated images
  let updatedAttachments = job.attachments;
  if (req.files && req.files.length > 0) {
    const newImageUrls = req.files.map((file) => file.path || file.url);
    updatedAttachments = [...updatedAttachments, ...newImageUrls];
  }

  // Update fields
  job.title = title || job.title;
  job.description = description || job.description;
  job.budget = budget || job.budget;
  job.location = location || job.location;
  job.category = category || job.category;
  job.status = status || job.status;
  job.attachments = updatedAttachments;

  const updatedJob = await job.save();

  res.status(200).json({
    message: "Job updated successfully",
    job: updatedJob,
  });
});

/**
 * @desc Remove specific image(s) from a job
 * @route PUT /api/jobs/:id/remove-images
 * @access Private (Customer)
 */
export const removeJobImages = asyncHandler(async (req, res) => {
  const { imageUrls } = req.body;

  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    res.status(400);
    throw new Error("No images provided for removal");
  }

  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.customer.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this job");
  }

  // filter out removed images
  job.attachments = job.attachments.filter((img) => !imageUrls.includes(img));
  await job.save();

  try {
    await deleteMultipleCloudinaryImages(imageUrls);
  } catch (err) {
    console.error("Cloudinary deletion failed:", err.message);
  }

  res.json({
    message: "Selected images removed successfully",
    job,
  });
});


/**
 * @desc Delete entire job
 * @route DELETE /api/jobs/:id
 * @access Private (Customer)
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.customer.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this job");
  }

  if (job.attachments.length > 0) {
    await deleteMultipleCloudinaryImages(job.attachments);
  }

  await job.deleteOne();

  res.json({ message: "Job deleted successfully" });
});

/**
 * @desc Get all assigned jobs (based on user type)
 * @route GET /api/jobs/assigned
 * @access Private
 */
export const getAssignedJobs = asyncHandler(async (req, res) => {
  let jobs;

  if (req.user.userType === "provider") {
    jobs = await Job.find({ assignedProvider: req.user._id })
      .populate("customer", "name email location profileImage")
      .populate("assignedProvider", "name email profileImage")
      .select(
        "title description category location budget status createdAt attachments isProviderMarkedComplete isCustomerConfirmedComplete"
      );
  } else if (req.user.userType === "customer") {
    jobs = await Job.find({
      customer: req.user._id,
      assignedProvider: { $ne: null },
    })
      .populate("customer", "name email profileImage")
      .populate("assignedProvider", "name email profileImage")
      .select(
        "title description category location budget status createdAt attachments isProviderMarkedComplete isCustomerConfirmedComplete"
      );
  } else if (req.user.userType === "admin") {
    jobs = await Job.find({ assignedProvider: { $ne: null } })
      .populate("customer", "name email profileImage")
      .populate("assignedProvider", "name email profileImage")
      .select(
        "title description category location budget status createdAt attachments isProviderMarkedComplete isCustomerConfirmedComplete"
      );
  } else {
    res.status(403);
    throw new Error("Not authorized to view jobs");
  }

  res.json({
    message: "Assigned jobs fetched successfully",
    total: jobs.length,
    jobs,
  });
});

export const getActiveJobs = async (req, res) => {
  try {
    let jobs;

    if (req.user.userType === "provider") {
      jobs = await Job.find({
        assignedProvider: req.user._id,
        status: { $in: ["assigned", "in-progress"] },
      })
        .populate("customer", "name email location profileImage")
        .populate("assignedProvider", "name email phone profileImage")
        .sort({ updatedAt: -1 });
    } else if (req.user.userType === "customer") {
      jobs = await Job.find({
        customer: req.user._id,
        status: { $in: ["assigned", "in-progress"] },
      })
        .populate("assignedProvider", "name email phone profileImage")
        .populate("customer", "name email profileImage")
        .sort({ updatedAt: -1 });
    } else {
      return res
        .status(403)
        .json({ message: "Not authorized to view active jobs" });
    }

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching active jobs:", error);
    res.status(500).json({ message: "Error fetching active jobs" });
  }
};

/**
 * @desc Provider marks job as completed
 * @route PUT /api/jobs/:id/mark-complete
 * @access Private (Provider)
 */
export const providerMarkJobComplete = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.assignedProvider?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to mark this job as complete");
  }

  if (job.isProviderMarkedComplete) {
    res.status(400);
    throw new Error("You have already marked this job as complete");
  }

  job.isProviderMarkedComplete = true;
  job.status = "in-progress";
  await job.save();

  res.json({
    message:
      "Job marked as completed by provider, awaiting customer confirmation",
    job,
  });
});

// @desc Customer confirms job completion
// @route PUT /api/jobs/:id/confirm-complete
// @access Private (Customer)
export const customerConfirmJobComplete = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // 🔍 DEBUG LOGS — temporary
  console.log(">>> req.user:", req.user);
  console.log(">>> job.customer:", job.customer);

  const customerId =
    job.customer?._id?.toString() || job.customer?.toString();
  const userId = req.user.id?.toString() || req.user._id?.toString();

  console.log(">>> customerId:", customerId);
  console.log(">>> userId:", userId);

  if (req.user.userType !== "customer") {
    res.status(403);
    throw new Error("Only customers can confirm job completion");
  }

  if (customerId !== userId) {
    res.status(403);
    throw new Error("You are not authorized to confirm completion of this job");
  }

  if (!job.isProviderMarkedComplete) {
    res.status(400);
    throw new Error("Provider has not marked this job as completed yet");
  }

  // ✅ Mark as complete
  job.isCustomerConfirmedComplete = true;
  job.status = "completed";
  job.completedAt = new Date();
  await job.save();

  res.json({
    message: "Job marked as fully completed 🎉",
    job,
  });
});


// ✅ Customer assigns a provider to a job (final confirmation)
export const assignProvider = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { providerId } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Only the customer who owns the job can assign
  if (job.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to assign provider to this job");
  }

  job.assignedProvider = providerId;
  job.status = "assigned";
  job.assignedAt = new Date();
  await job.save();

  res.json({
    message: "Provider successfully assigned to job",
    job,
  });
});

// ✅ Get all provider jobs
export const getProviderJobs = asyncHandler(async (req, res) => {
  if (req.user.userType !== "provider") {
    res.status(403);
    throw new Error("Only providers can access this");
  }

  const jobs = await Job.find({ assignedProvider: req.user._id })
    .populate("customer", "name email profileImage")
    .sort({ createdAt: -1 });

  res.json(jobs);
});

// ✅ Pending (provider marked complete, customer not confirmed)
export const getProviderPendingJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({
    assignedProvider: req.user._id,
    isProviderMarkedComplete: true,
    isCustomerConfirmedComplete: false,
  })
    .populate("customer", "name email profileImage")
    .sort({ updatedAt: -1 });

  res.json(jobs);
});

// ✅ Completed (fully confirmed)
export const getProviderCompletedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({
    assignedProvider: req.user._id,
    isCustomerConfirmedComplete: true,
  })
    .populate("customer", "name email profileImage")
    .sort({ updatedAt: -1 });

  res.json(jobs);
});
