import express from "express";
import promotionsController from "../controllers/promotions.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Get all promotions - authenticated access
router.get("/", authenticate, promotionsController.getAllPromotions);

// Get promotion by ID - authenticated access
router.get("/:id", authenticate, promotionsController.getPromotionById);

// Create promotion - admin only
router.post(
  "/",
  authenticate,
  authorize(["admin", "manager"]),
  promotionsController.createPromotion,
);

// Update promotion - admin only
router.put(
  "/:id",
  authenticate,
  authorize(["admin", "manager"]),
  promotionsController.updatePromotion,
);

// Delete promotion - admin only
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  promotionsController.deletePromotion,
);

export default router;
