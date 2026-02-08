"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const branch_controller_1 = __importDefault(require("../controllers/branch.controller"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all branches
router.get("/", branch_controller_1.default.getAllBranches);
// Get branch by ID
router.get("/:id", branch_controller_1.default.getBranchById);
// All branch routes require authentication
router.use(auth_1.authenticate);
// Create new branch
router.post("/", (0, auth_1.authorize)(["Super Admin", "Admin"]), branch_controller_1.default.createBranch);
// Update branch
router.put("/:id", (0, auth_1.authorize)(["Super Admin", "Admin"]), branch_controller_1.default.updateBranch);
// Delete branch
router.delete("/:id", (0, auth_1.authorize)(["Super Admin"]), branch_controller_1.default.deleteBranch);
// Activate branch
router.patch("/:id/activate", (0, auth_1.authorize)(["Super Admin", "Admin"]), branch_controller_1.default.activateBranch);
exports.default = router;
//# sourceMappingURL=branch.routes.js.map