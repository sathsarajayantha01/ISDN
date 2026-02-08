import express from "express";
import branchController from "../controllers/branch.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Get all branches
router.get("/", branchController.getAllBranches);

// Get branch by ID
router.get("/:id", branchController.getBranchById);

// All branch routes require authentication
router.use(authenticate);

// Create new branch
router.post(
  "/",
  authorize(["System Administrator", "Head Office Manager"]),
  branchController.createBranch,
);

// Update branch
router.put(
  "/:id",
  authorize(["System Administrator", "Head Office Manager"]),
  branchController.updateBranch,
);

// Delete branch
router.delete(
  "/:id",
  authorize(["System Administrator"]),
  branchController.deleteBranch,
);

// Activate branch
router.patch(
  "/:id/activate",
  authorize(["System Administrator", "Head Office Manager"]),
  branchController.activateBranch,
);

export default router;
