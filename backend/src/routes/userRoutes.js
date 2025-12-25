import express from "express";
import axios from "axios"; // ✅ Added this
import upload from "../middleware/uploadMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getTopProviders,
  getProviderById,
  getUserById
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Reverse geocode route
router.get("/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ message: "Missing lat/lon" });

  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    res.json(response.data);
  } catch (err) {
    console.error("Reverse geocode error:", err.message);
    res.status(500).json({ message: "Error fetching location" });
  }
});

// ✅ Forward geocode route (convert address/city → coordinates)
router.get("/geocode", async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ message: "Missing address" });

  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );

    if (!response.data.length) {
      return res.status(404).json({ message: "Address not found" });
    }

    const location = response.data[0];
    res.json({
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      display_name: location.display_name,
    });
  } catch (err) {
    console.error("Forward geocode error:", err.message);
    res.status(500).json({ message: "Error fetching coordinates" });
  }
});


// ✅ Upload test route (optional)
router.post("/upload", protect, upload.single("image"), (req, res) => {
  res.status(200).json({
    message: "Image uploaded successfully",
    imageUrl: req.file.path,
  });
});

// ✅ Profile routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("profileImage"), updateUserProfile);

router.delete("/profile", protect, deleteUserAccount);

// ✅ Top rated providers (with filters, pagination, distance)
router.get("/top", getTopProviders);
router.get("/:id", getProviderById);
// Add this route after the /top route
router.get("/:id", getUserById); // Change from getProviderById to getUserById

export default router;
