import express from "express";
import userController from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Change password
router.patch(
  "/:id/change-password",
  authenticate,
  userController.changePassword,
);

// Get all users
router.get("/", authenticate, userController.getAllUsers);

// Get users by role name (using query parameter, must come before /:id)
router.get("/role", authenticate, userController.getUsersByRoleName);

// Get user by ID
router.get("/:id", authenticate, userController.getUserById);

// Create new user
router.post("/", userController.createUser);

// Update user
router.put("/:id", authenticate, userController.updateUser);

// Delete user
router.delete(
  "/:id",
  authenticate,
  authorize(["System Administrator"]),
  userController.deleteUser,
);

// Activate user
router.patch(
  "/:id/activate",
  authenticate,
  authorize(["System Administrator"]),
  userController.activateUser,
);

export default router;
