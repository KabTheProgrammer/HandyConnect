import express from "express";
import {
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/adminCategoryController.js";
import Category from "../models/categoryModel.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.route("/")
  .post(protect, admin, createCategory);

router.get("/all", protect, admin, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// Routes for single category
router.route("/:id")
  .get(protect, admin, getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;
