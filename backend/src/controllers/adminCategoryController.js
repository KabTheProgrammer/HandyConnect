import asyncHandler from "express-async-handler";
import ActivityLog from "../models/activityModel.js";
import Category from "../models/categoryModel.js";
/**
 * @desc Create a new category
 * @route POST /api/admin/categories
 * @access Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({
    name,
    description,
    icon,
    createdBy: req.user._id,
  });

  await ActivityLog.create({
    user: req.user._id,
    action: `Created category: ${name}`,
    category: "admin_action",
  });

  res.status(201).json(category);
});

/**
 * @desc Get all categories
 * @route GET /api/admin/categories
 * @access Private/Admin
 */

// export const getCategories = asyncHandler(async (req, res) => {
//   console.log("✅ getCategories controller reached");
//   const categories = await Category.find();
//   console.log("Categories found:", categories);
//   res.json(categories);
// });

export const getCategories = asyncHandler(async (req, res) => {
  console.log("✅ getCategories controller reached");

  // Fetch all categories from DB
  const categories = await Category.find(); // no filters

  console.log("Categories found:", categories);

  // Log activity safely
  if (req.user && req.user._id) {
    await ActivityLog.create({
      user: req.user._id,
      action: "Fetched all categories",
      category: "admin_action",
    });
  }

  // Return categories
  res.json(categories);
});



/**
 * @desc Get single category
 * @route GET /api/admin/categories/:id
 * @access Private/Admin
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json(category);
});

/**
 * @desc Update a category
 * @route PUT /api/admin/categories/:id
 * @access Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, isActive } = req.body;
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  category.name = name || category.name;
  category.description = description || category.description;
  category.icon = icon || category.icon;
  if (isActive !== undefined) category.isActive = isActive;

  const updated = await category.save();

  await ActivityLog.create({
    user: req.user._id,
    action: `Updated category: ${category.name}`,
    category: "admin_action",
  });

  res.json(updated);
});

/**
 * @desc Delete a category (soft delete)
 * @route DELETE /api/admin/categories/:id
 * @access Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await category.deleteOne();

  await ActivityLog.create({
    user: req.user._id,
    action: `Deleted category: ${category.name}`,
    category: "admin_action",
  });

  res.json({ message: "Category deleted" });
});
