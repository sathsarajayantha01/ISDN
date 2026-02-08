import express from "express";
import productController from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth";
import { uploadMultiple } from "../utils/multer";

const router = express.Router();

// Get all products - public access
router.get("/", authenticate, productController.getAllProducts);

// Get products by category - public access (must come before /:id)
router.get(
  "/category/:categoryId",
  authenticate,
  productController.getProductsByCategory,
);

// Get product by ID - public access
router.get("/:id", authenticate, productController.getProductById);

// Create new product with multiple image upload
router.post(
  "/",
  authenticate,
  authorize(["System Administrator", "Head Office Manager", "RDC Staff"]),
  uploadMultiple,
  productController.createProduct,
);

// Update product with multiple image upload
router.put(
  "/:id",
  authenticate,
  authorize(["System Administrator", "Head Office Manager", "RDC Staff"]),
  uploadMultiple,
  productController.updateProduct,
);

// Delete product
router.delete(
  "/:id",
  authenticate,
  authorize(["System Administrator"]),
  productController.deleteProduct,
);

// Activate product
router.patch(
  "/:id/activate",
  authenticate,
  authorize(["System Administrator", "Head Office Manager", "RDC Staff"]),
  productController.activateProduct,
);

// Deactivate product
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize(["System Administrator", "Head Office Manager", "RDC Staff"]),
  productController.deactivateProduct,
);

// Update product quantity
router.patch(
  "/quantity/:id",
  authenticate,
  authorize(["System Administrator", "Head Office Manager", "RDC Staff"]),
  productController.updateProductQuantity,
);

// transfer product quantity between branches
router.put(
  "/transfer/:id",
  authenticate,
  authorize(["System Administrator", "Head Office Manager", "RDC Staff"]),
  productController.transferProductQuantity,
);

// Review (accept/reject) transferred product quantity
router.post(
  "/transfer/review/:id",
  authenticate,
  authorize(["System Administrator", "Head Office Manager", "RDC Staff"]),
  productController.reviewTransferQuantity,
);

export default router;
