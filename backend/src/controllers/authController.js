// controllers/authController.js
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    userType,
    phone,
    bio,
    skills,
    location, // expected JSON string or undefined
    useCurrentLocation,
    latitude,
    longitude,
  } = req.body;
  
  if (req.body.location && typeof req.body.location === "string") {
  try {
    req.body.location = JSON.parse(req.body.location);
  } catch (err) {
    console.error("Invalid JSON in location:", err);
  }
}


  if (!name || !email || !password || !userType) {
    res.status(400);
    throw new Error("All required fields must be filled");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // ✅ Handle profile image (Cloudinary)
  let profileImage;
  if (req.file?.path) {
    profileImage = req.file.path;
  }

  // ✅ Parse and normalize location data
  let locData = { city: "", country: "", coordinates: [0, 0] };

  try {
    if (location) {
      const loc = JSON.parse(location);
      locData.city = loc.city || "";
      locData.country = loc.country || "";
      if (loc.coordinates && loc.coordinates.length === 2) {
        locData.coordinates = loc.coordinates.map(Number);
      }
    }

    // If frontend sends latitude/longitude directly
    if (latitude && longitude) {
      locData.coordinates = [Number(longitude), Number(latitude)];
    }
  } catch (err) {
    console.error("Invalid location format:", err.message);
  }

  // ✅ Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    userType,
    phone,
    bio,
    skills: skills ? skills.split(",").map((s) => s.trim()) : [],
    location: {
      city: locData.city,
      country: locData.country,
    },
    coordinates: {
      type: "Point",
      coordinates: locData.coordinates,
    },
    useCurrentLocation: useCurrentLocation === "true" || useCurrentLocation === true,
    profileImage,
  });

  if (newUser) {
    const fullUser = await User.findById(newUser._id).select("-password");
    res.status(201).json({
      ...fullUser.toObject(),
      token: generateToken(newUser._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});



// ===============================
// LOGIN
// ===============================
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // ✅ Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // ✅ Optional role check (customer/provider)
  if (role && user.userType !== role) {
    res.status(403);
    throw new Error(
      `This account is registered as a ${user.userType}. Please log in as a ${user.userType}.`
    );
  }

  // ✅ Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // ✅ Return full user profile (excluding password) + token
  const userProfile = await User.findById(user._id).select("-password");

  res.status(200).json({
    ...userProfile.toObject(), 
    token: generateToken(user._id),
  });
});



// ===============================
// LOGOUT
// ===============================
// controllers/authController.js

export const logoutUser = asyncHandler(async (req, res) => {
  // Use updateOne to avoid revalidating entire schema
  const result = await User.updateOne(
    { _id: req.user._id },
    { $set: { lastLogout: new Date() } },
    { runValidators: false }
  );

  if (result.matchedCount === 0) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ message: "User logged out successfully" });
});
