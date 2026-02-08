"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Change password
router.patch("/:id/change-password", auth_1.authenticate, user_controller_1.default.changePassword);
// Get all users
router.get("/", auth_1.authenticate, user_controller_1.default.getAllUsers);
// Get user by ID
router.get("/:id", auth_1.authenticate, user_controller_1.default.getUserById);
// Create new user
router.post("/", user_controller_1.default.createUser);
// Update user
router.put("/:id", auth_1.authenticate, user_controller_1.default.updateUser);
// Delete user
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)(["Super Admin"]), user_controller_1.default.deleteUser);
// Activate user
router.patch("/:id/activate", auth_1.authenticate, (0, auth_1.authorize)(["Super Admin"]), user_controller_1.default.activateUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map