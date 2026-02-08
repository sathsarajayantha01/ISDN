"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productCategory_controller_1 = __importDefault(require("../controllers/productCategory.controller"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All category modification routes require authentication
router.use(auth_1.authenticate);
// Get all categories - public access
router.get("/", auth_1.authenticate, productCategory_controller_1.default.getAllCategories);
// Get category by ID - public access
router.get("/:id", auth_1.authenticate, productCategory_controller_1.default.getCategoryById);
// Create new category
router.post("/", auth_1.authenticate, (0, auth_1.authorize)(["Super Admin", "Admin"]), productCategory_controller_1.default.createCategory);
// Update category
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)(["Super Admin", "Admin"]), productCategory_controller_1.default.updateCategory);
// Delete category
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)(["Super Admin"]), productCategory_controller_1.default.deleteCategory);
exports.default = router;
//# sourceMappingURL=productCategory.routes.js.map