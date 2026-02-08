import express from "express";
import productCategoryController from "../controllers/productCategory.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// All category modification routes require authentication
router.use(authenticate);

// Get all categories - public access
router.get("/", authenticate, productCategoryController.getAllCategories);

// Get category by ID - public access
router.get("/:id", authenticate, productCategoryController.getCategoryById);

// Create new category
router.post(
  "/",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  productCategoryController.createCategory,
);

// Update category
router.put(
  "/:id",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  productCategoryController.updateCategory,
);

// Delete category
router.delete(
  "/:id",
  authenticate,
  authorize(["Super Admin"]),
  productCategoryController.deleteCategory,
);

export default router;
