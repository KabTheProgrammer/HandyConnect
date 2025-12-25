// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"

const router = express.Router();

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);

router.post("/logout", protect, logoutUser);

export default router;
