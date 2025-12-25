import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import cloudinary from "../utils/cloudinary.js";
import { deleteCloudinaryImage } from "../utils/cloudinaryHelper.js";
import NodeCache from "node-cache";

// ===============================
// GET USER PROFILE
// ===============================
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (user) {
    // Convert skills array to comma-separated string for frontend display
    const userData = user.toObject();
    userData.skills = user.skills ? user.skills.join(", ") : "";
    
    res.json(userData);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// UPDATE USER PROFILE
// ===============================
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // ✅ Parse location safely only once
  if (req.body.location && typeof req.body.location === "string") {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch (err) {
      console.error("Invalid JSON in location:", err);
    }
  }

  // ✅ Parse skills if they come as a JSON string or comma-separated string
  let skillsArray = user.skills; // default to existing
  if (req.body.skills !== undefined) {
    try {
      if (typeof req.body.skills === 'string') {
        // Check if it's a JSON array string
        if (req.body.skills.trim().startsWith('[')) {
          skillsArray = JSON.parse(req.body.skills);
        } else if (req.body.skills.trim() === '') {
          // Empty string means clear skills
          skillsArray = [];
        } else {
          // It's a comma-separated string
          skillsArray = req.body.skills
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
        }
      } else if (Array.isArray(req.body.skills)) {
        skillsArray = req.body.skills;
      }
    } catch (error) {
      console.error("Error parsing skills:", error);
      // Keep existing skills if parsing fails
    }
  }

  // ✅ Basic info
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.bio = req.body.bio || user.bio;
  user.skills = skillsArray; // Use the parsed array
  user.phone = req.body.phone || user.phone;
  user.country = req.body.country || user.country; // Add this line

  // ✅ Location preference
  if (req.body.useCurrentLocation !== undefined) {
    user.useCurrentLocation = req.body.useCurrentLocation;
  }

  // ✅ Update location + coordinates together
  if (req.body.location) {
    const loc = req.body.location; // already parsed safely above

    user.location = {
      city: loc.city || user.location.city,
      country: loc.country || user.location.country,
    };

    if (loc.coordinates && loc.coordinates.length === 2) {
      user.coordinates = {
        type: "Point",
        coordinates: loc.coordinates.map(Number),
      };
    }
  } else {
    // Update location from individual fields
    if (req.body.city !== undefined || req.body.locationCountry !== undefined) {
      user.location = {
        city: req.body.city || user.location.city,
        country: req.body.locationCountry || user.location.country,
      };
    }
  }

  // ✅ Handle profile image
  if (req.file && req.file.path) {
    user.profileImage = req.file.path;
  }

  const updatedUser = await user.save();

  // Convert skills array to comma-separated string for frontend display
  const userResponse = updatedUser.toObject();
  userResponse.skills = userResponse.skills ? userResponse.skills.join(", ") : "";

  res.json({
    message: "Profile updated successfully",
    user: {
      _id: userResponse._id,
      name: userResponse.name,
      email: userResponse.email,
      phone: userResponse.phone,
      bio: userResponse.bio,
      skills: userResponse.skills, // This is now a comma-separated string
      profileImage: userResponse.profileImage,
      location: userResponse.location,
      coordinates: userResponse.coordinates,
      useCurrentLocation: userResponse.useCurrentLocation,
      country: userResponse.country,
    },
  });
});


// ===============================
// GET PROVIDER BY ID (with reviews)
// ===============================

export const getProviderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 🧱 Fetch provider and populate reviews
  const provider = await User.findById(id)
    .select("-password") // never send password
    .populate({
      path: "reviews",
      populate: {
        path: "customer",
        select: "name profileImage", // include reviewer name + avatar
      },
    })
    .lean();

  if (!provider || provider.userType !== "provider") {
    res.status(404);
    throw new Error("Provider not found");
  }

  res.status(200).json({
    message: "Provider details fetched successfully",
    provider,
  });
});



// ===============================
// DELETE USER ACCOUNT
// ===============================
export const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.profileImage) {
    await deleteCloudinaryImage(user.profileImage);
  }

  await user.deleteOne();

  res.json({ message: "Account deleted successfully" });
});

// ===============================
// GET TOP PROVIDERS (with filters + pagination + distance)
// ===============================
const cache = new NodeCache({ stdTTL: 60 }); // cache for 60 seconds

// ✅ Get top-rated providers with filters, geo + pagination + caching
export const getTopProviders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { skill, location, radius, latitude, longitude } = req.query;

  // ✅ Create unique cache key based on filters
  const cacheKey = `providers:${skill || "all"}:${location || "any"}:${
    radius || "none"
  }:${latitude || "none"}:${longitude || "none"}:${page}`;

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  // ✅ Base MongoDB filter
  const filter = { userType: "provider" };
  if (skill) filter.skills = { $regex: skill, $options: "i" };
  if (location) filter.location = { $regex: location, $options: "i" };

  let providers = [];

  // ✅ Geo filtering if coordinates & radius provided
  if (latitude && longitude && radius) {
    const distance = parseFloat(radius) * 1000; // km → meters

    providers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: "distance",
          maxDistance: distance,
          spherical: true,
        },
      },
      { $match: filter },
      { $sort: { averageRating: -1, numReviews: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          email: 1,
          skills: 1,
          location: 1,
          numReviews: 1,
          averageRating: 1,
          profileImage: 1,
          distance: 1,
        },
      },
    ]);
  } else {
    // ✅ Regular query (convert to plain JS objects using .lean())
    providers = await User.find(filter)
      .sort({ averageRating: -1, numReviews: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "name email skills location numReviews averageRating profileImage coordinates"
      )
      .lean();
  }

  // ✅ Convert distance to kilometers (if available)
  providers.forEach((p) => {
    if (p.distance) {
      p.distance = (p.distance / 1000).toFixed(2) + " km";
    }
  });

  const total = await User.countDocuments(filter);
  const pages = Math.ceil(total / limit);

  const response = {
    message: "Top rated providers fetched successfully",
    page,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
    nextPage: page < pages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
    total,
    filtersApplied: {
      skill: skill || null,
      location: location || null,
      radius: radius || null,
      latitude: latitude || null,
      longitude: longitude || null,
    },
    providers,
  };

  // ✅ Cache only plain objects (no Mongoose documents)
  cache.set(cacheKey, response);

  res.status(200).json(response);
});

// ===============================
// GET USER BY ID (general - for both customers and providers)
// ===============================
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select("-password") // never send password
    .lean();

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Convert skills array to comma-separated string for frontend display
  if (user.skills && Array.isArray(user.skills)) {
    user.skills = user.skills.join(", ");
  }

  res.status(200).json({
    message: "User details fetched successfully",
    user,
  });
});